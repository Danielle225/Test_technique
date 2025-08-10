from typing import List, Dict
from sqlalchemy.orm import Session
from models.partage_note import PartageNote
from repositories.note_repository import NoteRepository
from repositories.utilisateur_repository import UserRepository
from core.exceptions import NotFoundException, ValidationException, AuthorizationException
from core.permissions import PermissionChecker

class PartageService:
    def __init__(self, db: Session):
        self.db = db
        self.note_repo = NoteRepository(db)
        self.user_repo = UserRepository(db)
        self.permission_checker = PermissionChecker()

    def share_note_with_user(self, note_id: int, user_email: str, owner_id: int) -> Dict:
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException("Pas de note trouvée")

        target_user = self.user_repo.get_by_email(user_email)
        if not target_user:
            raise NotFoundException("Pas d'utilisateur trouvé")

        if target_user.id == owner_id:
            raise ValidationException("Impossible de partager une note avec soi-même")

        existing_share = self.db.query(PartageNote).filter(
            PartageNote.note_id == note_id,
            PartageNote.partage_avec_utilisateur == target_user.id
        ).first()

        if existing_share:
            raise ValidationException("Note déjà partagée avec cet utilisateur")

        shared_note = PartageNote(
            note_id=note_id,
            partage_avec_utilisateur_id=target_user.id,
            partage_par_utilisateur_id=owner_id,
        )

        self.db.add(shared_note)
        self.db.commit()

        return {
            "message": f"Note partagée avec {user_email}",
            "partage_avec": {
                "email": target_user.email,
                "partage_par_utilisateurs": shared_note.partage_par_utilisateur_id,
            }
        }

    def unshare_note_with_user(self, note_id: int, user_email: str, owner_id: int) -> Dict:
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException("Pas de note  trouvée")

        target_user = self.user_repo.get_by_email(user_email)
        if not target_user:
            raise NotFoundException("Pas d'utilisateur trouvé")

        shared_note = self.db.query(PartageNote).filter(
            PartageNote.note_id == note_id,
            PartageNote.partage_avec_utilisateurs == target_user.id,
            PartageNote.partage_par_utilisateur_id == owner_id
        ).first()

        if not shared_note:
            raise NotFoundException("Partage non trouvé")

        self.db.delete(shared_note)
        self.db.commit()

        return {"message": f"Partage retiré pour {user_email}"}

    def get_notes_shared_with_user(self, utilisateur_id: int, skip: int = 0, limit: int = 100) -> List:
        return self.note_repo.get_shared_with_user(utilisateur_id, skip, limit)

    def get_note_shares(self, note_id: int, owner_id: int) -> List[Dict]:
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException("Pas de note  trouvée")

        shares = self.db.query(PartageNote).filter(
            PartageNote.note_id == note_id,
            PartageNote.partage_par_utilisateur_id == owner_id
        ).all()

        result = []
        for share in shares:
            user = self.user_repo.get(share.partage_avec_utilisateur)
            if user:
                result.append({
                    "email": user.email,
                    "shared_at": share.partage_avec_utilisateur,
                    "can_edit": share.can_edit
                })

        return result

    def create_public_link(self, note_id: int, owner_id: int) -> Dict:
        """Créer un lien public pour une note"""
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException("Note non trouvée")

        note.make_public()
        self.db.commit()

        return {
            "message": "Lien public créé",
            "public_url": f"/api/v1/notes/public/{note.token_publique}",
            "token": note.token_publique
        }

    def revoke_public_link(self, note_id: int, owner_id: int) -> Dict:
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException("Note non trouvée")

        note.make_private()
        self.db.commit()

        return {"message": "Lien public supprimé"}