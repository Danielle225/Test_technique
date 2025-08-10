from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateurs"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe = Column(String(255), nullable=False)
    est_actif = Column(Boolean, default=True)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    date_modification = Column(DateTime(timezone=True), onupdate=func.now())

    notes = relationship("Note", back_populates="owner", cascade="all, delete-orphan")
    partages_donnes = relationship("PartageNote", foreign_keys="[PartageNote.utilisateur_id]", back_populates="utilisateur_proprietaire")
    partages_recus = relationship("PartageNote", foreign_keys="[PartageNote.partage_avec_utilisateur_id]", back_populates="partage_avec_utilisateur")

    def __repr__(self):
        return f"<Utilisateur(id={self.id}, email='{self.email}')>"