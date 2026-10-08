# backend/agents.py
from crewai import Agent
from config_llm import llm

def create_lead_tech():
    return Agent(
        role="Lead Architect & Tech Lead",
        goal="Concevoir une arborescence de fichiers stricte et lister les dépendances nécessaires.",
        backstory="Tu es un architecte logiciel sénior. Tu définis l'arborescence exacte du projet et t'assures que les dépendances (package.json, etc.) sont spécifiées sans créer de fichiers inutiles.",
        verbose=True,
        llm=llm
    )

def create_dev_backend():
    return Agent(
        role="Senior Backend Engineer",
        goal="Écrire le code backend et base de données complet et fonctionnel sans rien omettre.",
        backstory="Tu es un développeur backend expert. Tu écris un code complet. Tu n'écris JAMAIS de commentaires de type '// Code à compléter' ou de fichiers vides.",
        verbose=True,
        llm=llm
    )

def create_dev_frontend():
    return Agent(
        role="Senior Frontend Engineer",
        goal="Écrire le code de l'interface utilisateur (HTML, CSS, JS client) prêt à l'emploi.",
        backstory="Tu es un spécialiste UI/UX et frontend. Tu conçois des interfaces modernes et complètes interconnectées au backend.",
        verbose=True,
        llm=llm
    )

def create_devops_docs():
    return Agent(
        role="DevOps & Documentation Specialist",
        goal="Générer les fichiers de configuration (package.json) et un README.md d'installation.",
        backstory="Tu t'assures que le projet peut être lancé immédiatement avec un package.json valide et une documentation claire.",
        verbose=True,
        llm=llm
    )

def create_inspector_qa():
    return Agent(
        role="Quality Assurance & Code Auditor",
        goal="Auditer l'ensemble du code, supprimer les fichiers vides et formater la livraison finale.",
        backstory="Tu es le dernier rempart qualité. Tu supprimes les fichiers fantômes ou vides, vérifies que tout est cohérent et formates chaque fichier sous '### File: nom_fichier'.",
        verbose=True,
        llm=llm
    )