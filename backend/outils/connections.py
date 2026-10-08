# outils/connections.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

DATABASE_URL = "postgresql://admin:mysecretpassword@localhost:5432/agent_db"

engine = create_engine(DATABASE_URL)
# On s'assure que les tables sont créées au démarrage
models.Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dépendance FastAPI pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
