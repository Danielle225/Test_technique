# models/tag.py - Version corrigée
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.database import Base

# Définir la table de liaison ici plutôt que dans notes.py
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('notes.id', ondelete='CASCADE')),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'))
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, index=True)

    date_creation = Column(DateTime(timezone=True), server_default=func.now())

    notes = relationship("Note", secondary=note_tags, back_populates="tags")
    
    def __repr__(self):
        return f"<Tag(id={self.id}, nom='{self.nom}')>"

    @classmethod
    def get_or_create(cls, db_session, nom_tag: str):
        """Obtenir un tag existant ou le créer s'il n'existe pas"""
        tag = db_session.query(cls).filter(cls.nom == nom_tag.lower().strip()).first()
        if not tag:
            tag = cls(nom=nom_tag.lower().strip())
            db_session.add(tag)
            db_session.flush()  
        return tag