# backend/tasks.py
from crewai import Task
import os
from crewai_tools import FileReadTool, FileWriterTool, DirectoryReadTool

WORKSPACE_DIR = os.path.abspath("./workspace")
os.makedirs(WORKSPACE_DIR, exist_ok=True)

file_read_tool = FileReadTool()
file_write_tool = FileWriterTool()
dir_read_tool = DirectoryReadTool()

def create_task_architecture(lead_tech_agent, project_description, existing_code=""):
    context = f"Besoin du projet : {project_description}"
    if existing_code:
        context += f"\n\nProjet existant :\n{existing_code}"

    return Task(
        description=(
            f"Analyse la demande suivante :\n{context}\n\n"
            "Définis l'arborescence exacte des fichiers nécessaires. "
            "Spécifie explicitement si un package.json, index.html ou README.md est requis. "
            "Interdiction de créer des fichiers inutiles ou vides."
        ),
        expected_output="La liste exacte et le rôle de chaque fichier à créer.",
        agent=lead_tech_agent,
        tools=[file_read_tool, file_write_tool, dir_read_tool]
    )

def create_task_backend(dev_backend_agent, existing_code=""):
    return Task(
        description=(
            "Écris le code source complet pour la partie serveur / logique / base de données.\n"
            "Chaque fichier doit être écrit INTÉGRALEMENT. N'écris AUCUN fichier vide."
        ),
        expected_output="Le code backend complet des fichiers concernés.",
        agent=dev_backend_agent,
        tools=[file_read_tool, file_write_tool, dir_read_tool]
    )

def create_task_frontend(dev_frontend_agent, existing_code=""):
    return Task(
        description=(
            "Écris le code de l'interface utilisateur (HTML, CSS, JS client).\n"
            "Assure-toi que l'interface est utilisable et qu'aucun fichier frontend requis ne manque."
        ),
        expected_output="Le code frontend complet (ex: index.html, styles.css, app.js).",
        agent=dev_frontend_agent,
        tools=[file_read_tool, file_write_tool, dir_read_tool]
    )

def create_task_config_docs(devops_docs_agent, existing_code=""):
    return Task(
        description=(
            "Génère le fichier package.json (avec toutes les dépendances requises comme express) "
            "et le fichier README.md avec les instructions de lancement."
        ),
        expected_output="Le contenu complet du fichier package.json et du README.md.",
        agent=devops_docs_agent,
        tools=[file_read_tool, file_write_tool, dir_read_tool]
    )

def create_task_qa_delivery(inspector_qa_agent):
    return Task(
        description=(
            "Lit les fichiers générés par l'équipe et génère le livrable final.\n\n"
            "RÈGLE D'OR - AUCUN BAVARDAGE :\n"
            "- Ne fais AUCUN résumé, AUCUNE explication, AUCUNE introduction.\n"
            "- N'écris PAS 'Voici un résumé...' ou 'Here is a summary...'.\n"
            "- Réponds EXCLUSIVEMENT avec la liste des fichiers en utilisant EXACTEMENT cette structure :\n\n"
            "FILE_START: chemin/fichier.ext\n"
            "contenu brut du fichier\n"
            "FILE_END\n\n"
            "Exemple strict :\n"
            "FILE_START: index.html\n"
            "<!DOCTYPE html>...\n"
            "FILE_END\n"
            "FILE_START: script.js\n"
            "console.log('hi');\n"
            "FILE_END"
        ),
        expected_output="Uniquement du texte brut structuré avec FILE_START et FILE_END, sans aucun blabla autour.",
        agent=inspector_qa_agent,
        tools=[file_read_tool, file_write_tool, dir_read_tool]
    )