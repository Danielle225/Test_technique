from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.exceptions import NotFoundException
from models.notes import Note
from repositories.note_repository import NoteRepository
from repositories.tag_repository import TagRepository
from core.permissions import PermissionChecker
from schemas.note_schema import NoteCreate, NoteUpdate  # Add this import

class NoteService:

    def __init__(self, db: Session):
        self.db = db
        self.note_repository = NoteRepository(db)
        self.tag_repository = TagRepository(db)
        self.permissions = PermissionChecker(db)


    def create_note(self, note_data: NoteCreate, utilisateur_id: int) -> Note:
        print(f"DEBUG: utilisateur_id = {utilisateur_id}") 
        note = Note(
            titre= note_data.titre,
            contenu= note_data.contenu,
            owner_id=utilisateur_id,
            visibilite=note_data.visibilite,
        )
        if note_data.visibilite == "public":
            note.generate_public_token()
        
        self.db.add(note)
        self.db.flush()
        
        if note_data.tags:
            for tag_nom in note_data.tags:
                tag = self.tag_repository.get_or_create(tag_nom)
                note.tags.append(tag)
                
        self.db.commit()
        self.db.refresh(note)
        return note
        

    def get_user_notes(self, utilisateur_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
        
        return self.note_repository.get_user_notes(utilisateur_id, skip, limit)

    def get_note_by_id(self, note_id: int, utilisateur_id: int) -> Note:
        print(f"DEBUG: Getting note {note_id} for user {utilisateur_id}")
        note = self.note_repository.get_user_note_by_id(note_id, utilisateur_id) or self.note_repository.get_shared_with_user(utilisateur_id)
        if self.note_repository.get_shared_note_by_id(note_id, utilisateur_id):
            print(f"DEBUG: Note {note_id} found in shared notes for user {utilisateur_id}")
            return note[0]  # Assuming this returns a list, we take the first item
        
        else:
            note = self.note_repository.get_user_note_by_id(note_id, utilisateur_id)
        if not note:
            raise NotFoundException("Note non trouvée")
        return note

    def update_note(self, note_id: int, note_data: NoteUpdate, utilisateur_id: int) -> Note:
        
        note = self.get_note_by_id(note_id, utilisateur_id)
        user = self.permissions.user_by_id(utilisateur_id)
        if not self.permissions.can_edit_note(user, note):
            print("DEBUG: User does not have permission to edit this note")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vous n'avez pas la permission de modifier cette note")
        print(f"DEBUG: Updating note {note_id} for user {utilisateur_id}")
        
        if note_data.titre is not None:
            note.titre = note_data.titre
        if note_data.contenu is not None:
            note.contenu = note_data.contenu
        if note_data.visibilite is not None:
            note.visibilite = note_data.visibilite
            if note_data.visibilite == "public":
                note.generate_public_token()
            elif note_data.visibilite == "prive":
                note.token_publique = None
        
        if note_data.tags is not None:
            note.tags.clear()
            for tag_nom in note_data.tags:
                tag = self.tag_repository.get_or_create(tag_nom)
                note.tags.append(tag)
        
        self.db.commit()
        self.db.refresh(note)
        return note

    def delete_note(self, note_id: int, utilisateur_id: int) -> bool:
        note = self.get_note_by_id(note_id, utilisateur_id)
        self.db.delete(note)
        self.db.commit()
        return True

    def get_public_note_by_token(self, token: str) -> Optional[Note]:
        return self.note_repository.get_public_note_by_token(token)

    def search_notes(self, utilisateur_id: int, query: str, skip: int = 0, limit: int = 100) -> List[Note]:
        return self.note_repository.search_user_notes(utilisateur_id, query, skip, limit)

    def filter_notes_by_visibilite(self, utilisateur_id: int, visibilite: str, skip: int = 0, limit: int = 100) -> List[Note]:
        return self.note_repository.filter_user_notes_by_visibility(utilisateur_id, visibilite, skip, limit)

    def filter_notes_by_tag(self, utilisateur_id: int, tag_nom: str, skip: int = 0, limit: int = 100) -> List[Note]:
        return self.note_repository.filter_user_notes_by_tag(utilisateur_id, tag_nom, skip, limit)
