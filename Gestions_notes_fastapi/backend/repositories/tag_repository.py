from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.tag import Tag
from repositories.base import BaseRepository

class TagRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, tag_nom: str) -> Tag:
        """Obtenir ou créer un tag"""
        tag_nom = tag_nom.lower().strip()
        tag = self.db.query(Tag).filter(Tag.nom == tag_nom).first()

        if not tag:
            tag = Tag(nom=tag_nom)
            self.db.add(tag)
            self.db.flush()  
        
        return tag

    def get_by_name(self, tag_nom: str) -> Optional[Tag]:
        """Obtenir un tag par nom"""
        return self.db.query(Tag).filter(Tag.nom == tag_nom.lower().strip()).first()

    def get_popular_tags(self, utilisateur_id: int, limit: int = 20) -> List[Tag]:
        """Obtenir les tags les plus utilisés par un utilisateur"""
        from models.notes import Note, note_tags
        
        return (
            self.db.query(Tag, func.count(note_tags.c.note_id).label('count'))
            .join(note_tags)
            .join(Note)
            .filter(Note.utilisateur_id == utilisateur_id)
            .group_by(Tag.id)
            .order_by(func.count(note_tags.c.note_id).desc())
            .limit(limit)
            .all()
        )

    def search_tags(self, query: str, limit: int = 10) -> List[Tag]:
        """Rechercher des tags"""
        return (
            self.db.query(Tag)
            .filter(Tag.nom.contains(query.lower()))
            .limit(limit)
            .all()
        )