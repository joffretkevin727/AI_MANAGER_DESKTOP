# backend/config_llm.py
from crewai import LLM

# Utilisation du modèle Qwen 2.5 Coder 14B via Ollama
llm = LLM(
    model="ollama/qwen2.5-coder:14b",
    base_url="http://localhost:11434"
)