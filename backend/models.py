from sqlalchemy import Column, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="IDLE") # IDLE, RUNNING, PAUSED, COMPLETED
    result = Column(Text, nullable=True)

class StartProjectRequest(BaseModel):
    prompt: str | None = None