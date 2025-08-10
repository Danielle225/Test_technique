import random
from tokenize import generate_tokens
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True)
    titre = Column(String(255), nullable=False)
    contenu = Column(Text)
    owner_id = Column(Integer, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    date_modification = Column(DateTime(timezone=True), onupdate=func.now())
    visibilite = Column(String(50), default="prive")  
    token_publique = Column(String(255), nullable=True)  # Token pour les notes publiques

    owner = relationship("Utilisateur", back_populates="notes")
    partages = relationship("PartageNote", back_populates="note", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="note_tags", back_populates="notes")

    def generate_public_token(self):
        if self.visibilite == "public":
            self.token_publique = str(random.randint(100000, 999999))  # Fonction pour générer un token unique
        else:
            self.token_publique = None
            
    

    def __repr__(self):
        return f"<Note(id={self.id}, titre='{self.titre}', owner_id={self.owner_id})>"
    
    