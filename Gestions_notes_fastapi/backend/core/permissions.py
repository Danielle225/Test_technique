from typing import Optional
from sqlalchemy.orm import Session
from models.utilisateurs import Utilisateur
from models.notes import Note
from models.partage_note import PartageNote
from core.exceptions import forbidden_exception

class PermissionChecker:
    def __init__(self, db: Session):
        self.db = db

    def can_read_note(self, user: Utilisateur, note: Note) -> bool:
        if note.owner_id == user.id:
            return True

        shared = self.db.query(PartageNote).filter(
            PartageNote.note_id == note.id,
            PartageNote.partage_par_utilisateur_id == user.id,
            PartageNote.can_read == True
        ).first()
    
        return shared 

    def can_edit_note(self, user: Utilisateur, note: Note) -> bool:
        if note.owner_id == user.id:
            return True

        shared = self.db.query(PartageNote).filter(
            PartageNote.note_id == note.id,
            PartageNote.partage_par_utilisateur_id == user.id,
            PartageNote.can_edit == True
        ).first()
    
        return shared is not None

    def can_delete_note(self, user: Utilisateur, note: Note) -> bool:
        return note.owner_id == user.id

    def can_share_note(self, user: Utilisateur, note: Note) -> bool:
        return note.owner_id == user.id

    def require_note_read_permission(self, user: Utilisateur, note: Note, db: Session):
        if not PermissionChecker(db).can_read_note(user, note):
            raise forbidden_exception

    def require_note_edit_permission(self, user: Utilisateur, note: Note, db: Session):
        if not PermissionChecker(db).can_edit_note(user, note):
            raise forbidden_exception

    def require_note_delete_permission(self, user: Utilisateur, note: Note, db: Session):
        if not PermissionChecker(db).can_delete_note(user, note):
            raise forbidden_exception

    def require_note_share_permission(self, user: Utilisateur, note: Note, db: Session):
        if not PermissionChecker(db).can_share_note(user, note):
            raise forbidden_exception