# schemas/schemas.py
from pydantic import BaseModel
from typing import Optional

# Schéma de base partagé
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

# Schéma pour la création (ce qu'on attend de React)
class ProjectCreate(ProjectBase):
    pass

# Schéma complet retourné par l'API (avec les champs générés par la DB)
class ProjectResponse(ProjectBase):
    id: int
    status: str
    result: Optional[str] = None

    # Obligatoire pour que Pydantic puisse lire les objets SQLAlchemy (ORMs)
    class Config:
        from_attributes = True
