from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base

class PartageNote(Base):
    __tablename__ = "partage_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False) 
    partage_avec_utilisateur_id = Column(Integer, ForeignKey("utilisateurs.id", ondelete="CASCADE"), nullable=False)  
    
    permission = Column(String(50), default="read") 
    
    date_partage = Column(DateTime(timezone=True), server_default=func.now())
    
    note = relationship("Note", back_populates="partages")
    utilisateur_proprietaire = relationship(
        "Utilisateur", 
        foreign_keys=[utilisateur_id],
        back_populates="partages_donnes"
    )
    partage_avec_utilisateur = relationship(
        "Utilisateur", 
        foreign_keys=[partage_avec_utilisateur_id],
        back_populates="partages_recus"
    )
    
    def __repr__(self):
        return f"<PartageNote(id={self.id}, note_id={self.note_id}, avec_utilisateur={self.partage_avec_utilisateur_id})>"