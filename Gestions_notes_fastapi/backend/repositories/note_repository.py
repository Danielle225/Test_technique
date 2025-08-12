from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from models.notes import Note
from models.tag import Tag
from models.partage_note import PartageNote
from schemas.note_schema import NoteCreate, NoteUpdate
from repositories.base import BaseRepository

class NoteRepository(BaseRepository[Note, NoteCreate, NoteUpdate]):
    def __init__(self, db: Session):
        super().__init__(Note, db)

    def get_user_notes(self, utilisateur_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
        """
        Récupère toutes les notes accessibles à un utilisateur :
        - Ses propres notes (owner_id == utilisateur_id)
        - Les notes partagées avec lui (via PartageNote)
        """
        
        return  (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .outerjoin(PartageNote, Note.id == PartageNote.note_id)
            .filter(
                or_(
                    Note.owner_id == utilisateur_id,
                    PartageNote.partage_avec_utilisateur_id == utilisateur_id
                )
            )
            .distinct()  # Important pour éviter les doublons
            .order_by(Note.date_modification.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_user_note_by_id(self, note_id: int, utilisateur_id: int) -> Optional[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .filter(and_(Note.id == note_id, Note.owner_id == utilisateur_id))
            .first()
        )

    def get_public_note_by_token(self, token: str) -> Optional[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .filter(and_(Note.token_publique == token, Note.visibilite == "public"))
            .first()
        )

    def search_user_notes(self, utilisateur_id: int, query: str, skip: int = 0, limit: int = 100) -> List[Note]:
        search_filter = or_(
            Note.titre.contains(query),
            Note.contenu.contains(query)
        )
        
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .filter(and_(Note.owner_id == utilisateur_id, search_filter))
            .order_by(Note.date_modification.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def filter_user_notes_by_visibility(self, utilisateur_id: int, visibilite: str, skip: int = 0, limit: int = 100) -> List[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .filter(and_(Note.owner_id == utilisateur_id, Note.visibilite == visibilite))
            .order_by(Note.date_modification.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def filter_user_notes_by_tag(self, utilisateur_id: int, nom_tag: str, skip: int = 0, limit: int = 100) -> List[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .join(Note.tags)
            .filter(and_(Note.owner_id == utilisateur_id, Tag.nom == nom_tag.lower()))
            .order_by(Note.date_modification.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_user_notes(self, utilisateur_id: int) -> int:
        return self.db.query(Note).filter(Note.owner_id == utilisateur_id).count()

    def get_shared_with_user(self, utilisateur_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
        return (
            self.db.query(Note)
            .options(joinedload(Note.tags))
            .join(PartageNote)
            .filter(PartageNote.partage_avec_utilisateur == utilisateur_id)
            .order_by(Note.date_modification.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )