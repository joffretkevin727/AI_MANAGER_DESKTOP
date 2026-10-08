# router/routes.py
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
import asyncio
from crewai import Crew, Process

import os

import models
import agents
import tasks
from outils.connections import get_db
from schemas.schemas import ProjectCreate, ProjectResponse
from models import StartProjectRequest

router = APIRouter()

# --- GESTIONNAIRE WEBSOCKET ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- FONCTIONS DE CALLBACK NATIVES POUR ASSURER LE STREAMING (Étape A) ---
def local_step_callback(step_output, loop):
    """Intercepte chaque étape de réflexion d'un agent et l'envoie sur le WebSocket"""
    message = "🤔 [Pensée Agent] "
    if hasattr(step_output, 'thought') and step_output.thought:
        message += str(step_output.thought)
    elif hasattr(step_output, 'text') and step_output.text:
        message += str(step_output.text)
    else:
        message += "L'agent analyse l'étape courante..."
        
    asyncio.run_coroutine_threadsafe(manager.broadcast(message), loop)

def local_task_callback(task_output, loop):
    """Intercepte la fin d'une tâche complète"""
    message = f"✅ [Système] Tâche terminée avec succès."
    asyncio.run_coroutine_threadsafe(manager.broadcast(message), loop)


def run_agent_crew(project_id: int, loop, session_factory):
    # 1. Créer un dossier logs dédié s'il n'existe pas
    os.makedirs("./logs", exist_ok=True)
    
    # 2. Définir le fichier de log spécifique à ce projet
    log_file_path = f"./logs/project_{project_id}.log"
    
    
    db = session_factory()
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    
    if not project or project.status == "PAUSED":
        db.close()
        return

    try:
        # Dans router/routes.py (dans run_agent_crew)

        # 1. Instanciation des 5 agents
        lead_tech = agents.create_lead_tech()
        dev_backend = agents.create_dev_backend()
        dev_frontend = agents.create_dev_frontend()
        devops_docs = agents.create_devops_docs()
        inspector_qa = agents.create_inspector_qa()

        # Callbacks WebSocket
        for agent in [lead_tech, dev_backend, dev_frontend, devops_docs, inspector_qa]:
            agent.step_callback = lambda step: local_step_callback(step, loop)

        # 2. Instanciation des tâches
        existing_code = project.result if project.result else ""
        if len(existing_code) > 3000:
            existing_code = existing_code[:3000] + "\n...[code tronqué]"

        t1 = tasks.create_task_architecture(lead_tech, project.description, existing_code)
        t2 = tasks.create_task_backend(dev_backend, existing_code)
        t3 = tasks.create_task_frontend(dev_frontend, existing_code)
        t4 = tasks.create_task_config_docs(devops_docs, existing_code)
        t5 = tasks.create_task_qa_delivery(inspector_qa)

        for t in [t1, t2, t3, t4, t5]:
            t.callback = lambda task: local_task_callback(task, loop)

        # 3. Exécution de la Crew à 5 agents
        crew = Crew(
            agents=[lead_tech, dev_backend, dev_frontend, devops_docs, inspector_qa],
            tasks=[t1, t2, t3, t4, t5],
            process=Process.sequential,
            verbose=True,
            memory=True,
            output_log_file=log_file_path
        )

        asyncio.run_coroutine_threadsafe(
            manager.broadcast("🚀 Lancement de l'équipe (LeadTech -> DevBack -> DevFront -> DevOps -> QA)..."), 
            loop
        )

        output = crew.kickoff()
        
        db.refresh(project)
        if project.status == "RUNNING":
            project.result = str(output)
            project.status = "FINISH"  # On passe en FINISH
            db.commit()
            # On envoie l'événement FINISH
            asyncio.run_coroutine_threadsafe(manager.broadcast("--- SYSTEM_EVENT: FINISH ---"), loop)
            
    # Dans router/routes.py (fonction run_agent_crew)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print("❌ EXCEPTION BACKEND :", error_details)  # S'affichera dans le terminal Uvicorn/FastAPI
        
        project.status = "FAILED"
        project.result = f"Erreur lors de l'exécution : {str(e)}"
        db.commit()
        
        # Envoyer l'erreur exacte sur le WebSocket pour la voir sur le Frontend
        asyncio.run_coroutine_threadsafe(
            manager.broadcast(f"❌ [Erreur Système] : {str(e)}"), 
            loop
        )
        asyncio.run_coroutine_threadsafe(
            manager.broadcast("--- SYSTEM_EVENT: FAILED ---"), 
            loop
        )
    finally:
        db.close()


# --- ROUTES ---

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/projects", response_model=ProjectResponse)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    project = models.Project(name=project_in.name, description=project_in.description, status="IDLE")
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# Dans routes.py

REFINEMENT_INSTRUCTION = """
RÈGLE STRICTE D'ÉVOLUTION DU CODE :
1. Applique IMPÉRATIVEMENT la demande de modification ci-dessus en priorité absolue.
2. Conserve les fichiers existants UTILES, mais N'HÉSITE PAS à supprimer/réécrire le code obsolète (ex: retirer les routes API si la demande exige du JS pur).
3. Renvoie TOUS les fichiers du projet au format :
FILE_START: chemin/vers/fichier.ext
contenu complet
FILE_END
"""

@router.post("/projects/{project_id}/start")
async def start_project(
    project_id: int, 
    background_tasks: BackgroundTasks, 
    req: StartProjectRequest = None,
    db: Session = Depends(get_db)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
        
    user_instruction = req.prompt.strip() if (req and req.prompt) else ""
    
    if project.result and project.result.strip():
        # ON MET LA NOUVELLE INSTRUCTION EN HAUT DU PROMPT
        updated_description = (
            f"🚨 DEMANDE DE MODIFICATION PRIORITAIRE DE L'UTILISATEUR :\n"
            f"{user_instruction}\n\n"
            f"--- CODE DU PROJET ACTUEL (À ADAPTER / NETTOYER) ---\n"
            f"{project.result}\n\n"
            f"{REFINEMENT_INSTRUCTION}"
        )
        project.description = updated_description
    else:
        if user_instruction:
            project.description = f"{project.description}\n[Instruction : {user_instruction}]"
        
    project.status = "RUNNING"
    db.commit()
    
    loop = asyncio.get_event_loop()
    from outils.connections import SessionLocal
    background_tasks.add_task(run_agent_crew, project_id, loop, SessionLocal)
    
    return {"message": "Équipe d'agents démarrée", "status": "RUNNING"}

@router.post("/projects/{project_id}/pause")
async def pause_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
        
    project.status = "PAUSED"
    db.commit()
    return {"message": "Le projet a été demandé en pause", "status": "PAUSED"}

# Dans router/routes.py

@router.post("/projects/{project_id}/complete")
async def complete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
        
    project.status = "COMPLETED"
    db.commit()
    return {"message": "Projet marqué comme complété avec succès", "status": "COMPLETED"}

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable")
    return project

@router.get("/projects", response_model=list[ProjectResponse])
def get_all_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.id.desc()).all()

@router.get("/projects/{project_id}/logs")
def get_project_logs(project_id: int):
    log_path = f"./logs/project_{project_id}.log"
    
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            return {"logs": f.read()}
            
    return {"logs": "Aucun log disponible pour ce projet."}
