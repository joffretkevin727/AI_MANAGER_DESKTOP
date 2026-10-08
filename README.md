# 🚀 Multi-Agent Code Orchestrator (CrewAI & FastAPI)

Plateforme d'orchestration multi-agents alimentée par **CrewAI** et **FastAPI** en backend, couplée à un frontend **React**. Le système permet de générer, refactoriser et faire évoluer des applications web de manière autonome tout en conservant le contexte et la persistance du code.

---

## 🛠️ Architecture & Technologies

- **Backend** : FastAPI, Python 3.10+, CrewAI, SQLite / PostgreSQL, Pydantic
- **Frontend** : React, JSZip, Parser personnalisé (`FILE_START / FILE_END`)
- **LLM & Outils** : Google Gemini / Ollama (Qwen 2.5 Coder 14B), CrewAI Tools (`FileReadTool`, `FileWriterTool`, `DirectoryReadTool`)

---

## 📦 Structure du Projet

```text
├── backend/
│   ├── main.py              # Point d'entrée de l'application FastAPI
│   ├── routes.py            # Endpoints API (gestion des projets et exécutions)
│   ├── tasks.py             # Définition des tâches CrewAI et injection des outils
│   ├── crew.py              # Configuration et orchestration des agents
│   ├── workspace/           # Bac à sable (sandbox) où les agents rédigent les fichiers
│   └── logs/                # Fichiers de logs d'exécution par projet
│
└── frontend/
    ├── src/
    │   ├── utils/
    │   │   └── fileParser.js # Parser de découpage et fusion (merge) du code
    │   └── components/       # Interface utilisateur (console, explorateur de fichiers)
    └── package.json
```

⚙️ Fonctionnalités Clés
# 1. Isolation par Sandbox (./workspace)

Les agents modifient et lisent les fichiers uniquement dans un répertoire sécurisé pour éviter toute altération du code source de l'application.

# 2. Parsing Indestructible (FILE_START / FILE_END)

Encadrement strict des fichiers générés pour permettre au frontend de parser le Markdown, le HTML et le JS sans conflit avec les blocs de code imbriqués ou les titres (#, ##).

# 3. Génération Fallback Auto-Reconstruite

Le backend vérifie physiquement le contenu du dossier ./workspace à la fin de chaque exécution afin d'assembler la sortie au format attendu, même si l'agent QA génère du texte descriptif.

# 4. Mémoire Contextuelle & Persistance

Activation de la mémoire globale (memory=True) combinée à la réinjection de l'état actuel du code lors des demandes de modification pour éliminer les régressions.


🚀 Installation & Lancement

1. Backend (FastAPI & CrewAI)

# Aller dans le dossier backend
cd backend

# Créer et activer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate

# Installer les dépendances
pip install fastapi uvicorn crewai crewai-tools chromadb mem0ai

# Lancer le serveur backend
uvicorn main:app --reload --port 8000


2. Frontend (React)

# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm start
📝 Format du Contrat d'Échange (IA ↔ Frontend)
Toute génération de fichier respecte la structure suivante :

Plaintext
FILE_START: path/vers/fichier.ext
// Contenu du fichier
FILE_END
📋 Journalisation (Logs)
Les logs de suivi d'exécution des agents sont consultables en direct dans l'interface React ou directement sur le serveur dans :

./backend/logs/project_{id}.log

💻 Procédures d'Installation Complet
1. Installation de Docker

Sur Windows & macOS
Télécharge et installe Docker Desktop depuis le site officiel : docker.com.

Sur Windows, assure-toi d'activer WSL 2 pendant l'installation.

2. Installation de l'IA Locale (Ollama & Qwen 2.5 Coder 14B)
Installation d'Ollama

https://ollama.com/download/windows

# Télécharger et démarrer le modèle Qwen 2.5 Coder 14B
ollama run qwen2.5-coder:14b

# Télécharger le modèle d'embeddings requis pour la mémoire CrewAI en local
ollama pull nomic-embed-text

3. Installation de l'environnement Python & CrewAI (Backend)

# 1. Aller dans le dossier backend
cd backend

# 2. Créer un environnement virtuel Python 3.10 ou supérieur
python3 -m venv venv

# Activation de l'environnement virtuel :
# Sur Linux/macOS :
source venv/bin/activate
# Sur Windows (PowerShell) :
# .\venv\Scripts\Activate.ps1

# 3. Mettre à jour pip
pip install --upgrade pip

# 4. Installer CrewAI, FastAPI, les outils de fichiers et la mémoire
pip install crewai crewai-tools fastapi uvicorn chromadb mem0ai pydantic

4. Configuration des variables d'environnement (.env)
Crée un fichier .env à la racine du dossier backend/  et mettre votre clef API si vous etes sur une ia en cloud

🚀 Démarrage de l'Application



Vérifier les prérequis :

docker ps          # Vérifie que Docker tourne
ollama list        # Vérifie la présence des modèles locaux (si usage Ollama)

Lancer le serveur backend (FastAPI) :

cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

Lancer le client frontend (React)

cd frontend
npm install
npm start

# -----------------------------------------------------------------------------------------