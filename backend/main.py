# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router.routes import router as api_router

app = FastAPI(title="AI Agent Orchestrator API - Production Ready")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion de toutes les routes de notre dossier router/
app.include_router(api_router)
