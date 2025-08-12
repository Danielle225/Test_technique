from typing import List, Dict
import uuid
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
        self.permission_checker = PermissionChecker(db)

    def share_note_with_user(self, note_id: int, user_email: str, owner_id: int) -> Dict:
        # Vérification de la note
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException({
                "status": "error",
                "code": "NOTE_NOT_FOUND",
                "message": f"La note avec l'ID {note_id} n'existe pas ou vous n'en êtes pas le propriétaire",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "action": "share_note"
                }
            })

        # Vérification de l'utilisateur destinataire
        target_user = self.user_repo.get_by_email(user_email)
        if not target_user:
            raise NotFoundException({
                "status": "error",
                "code": "USER_NOT_FOUND",
                "message": f"Aucun utilisateur trouvé avec l'adresse email '{user_email}'",
                "data": {
                    "email": user_email,
                    "note_id": note_id,
                    "action": "share_note"
                }
            })

        # Vérification auto-partage
        if target_user.id == owner_id:
            raise ValidationException({
                "status": "error",
                "code": "SELF_SHARING_FORBIDDEN",
                "message": "Vous ne pouvez pas partager une note avec vous-même",
                "data": {
                    "user_id": owner_id,
                    "target_email": user_email,
                    "note_id": note_id,
                    "action": "share_note"
                }
            })

        # Vérification partage existant
        existing_share = self.db.query(PartageNote).filter(
            PartageNote.note_id == note_id,
            PartageNote.partage_avec_utilisateur_id == target_user.id
        ).first()

        if existing_share:
            raise ValidationException({
                "status": "error",
                "code": "ALREADY_SHARED",
                "message": f"Cette note est déjà partagée avec '{user_email}'",
                "data": {
                    "note_id": note_id,
                    "target_email": user_email,
                    "existing_share_id": existing_share.id,
                    "shared_at": str(existing_share.date_partage),
                    "action": "share_note"
                }
            })

        try:
            shared_note = PartageNote(
                note_id=note_id,
                utilisateur_id=owner_id,
                partage_avec_utilisateur_id=target_user.id,
                permission="read"
            )

            self.db.add(shared_note)
            self.db.commit()

            return {
                "status": "success",
                "code": "SHARE_CREATED",
                "message": f"La note '{note.titre}' a été partagée avec succès avec {user_email}",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "partage_avec": {
                        "email": target_user.email,
                        "user_id": target_user.id,
                        "permission": "read"
                    },
                    "partage_par": {
                        "user_id": owner_id,
                        "date_partage": shared_note.date_partage
                    }
                }
            }
        except Exception as e:
            self.db.rollback()
            raise ValidationException({
                "status": "error",
                "code": "SHARE_CREATION_FAILED",
                "message": "Erreur lors du partage de la note",
                "data": {
                    "note_id": note_id,
                    "target_email": user_email,
                    "owner_id": owner_id,
                    "error_details": str(e),
                    "action": "share_note"
                }
            })

    def unshare_note_with_user(self, note_id: int, user_email: str, owner_id: int) -> Dict:
        # Vérification de la note
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException({
                "status": "error",
                "code": "NOTE_NOT_FOUND",
                "message": f"La note avec l'ID {note_id} n'existe pas ou vous n'en êtes pas le propriétaire",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "action": "unshare_note"
                }
            })

        # Vérification de l'utilisateur
        target_user = self.user_repo.get_by_email(user_email)
        if not target_user:
            raise NotFoundException({
                "status": "error",
                "code": "USER_NOT_FOUND",
                "message": f"Aucun utilisateur trouvé avec l'adresse email '{user_email}'",
                "data": {
                    "email": user_email,
                    "note_id": note_id,
                    "action": "unshare_note"
                }
            })

        # Recherche du partage existant
        shared_note = self.db.query(PartageNote).filter(
            PartageNote.note_id == note_id,
            PartageNote.partage_avec_utilisateur_id == target_user.id,
            PartageNote.utilisateur_id == owner_id
        ).first()

        if not shared_note:
            raise NotFoundException({
                "status": "error",
                "code": "SHARE_NOT_FOUND",
                "message": f"Aucun partage trouvé entre cette note et l'utilisateur '{user_email}'",
                "data": {
                    "note_id": note_id,
                    "target_email": user_email,
                    "owner_id": owner_id,
                    "action": "unshare_note"
                }
            })

        try:
            self.db.delete(shared_note)
            self.db.commit()

            return {
                "status": "success",
                "code": "SHARE_REMOVED",
                "message": f"Le partage de la note '{note.titre}' avec {user_email} a été supprimé avec succès",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "user_email": user_email,
                    "removed_at": "now"
                }
            }
        except Exception as e:
            self.db.rollback()
            raise ValidationException({
                "status": "error",
                "code": "UNSHARE_FAILED",
                "message": "Erreur lors de la suppression du partage",
                "data": {
                    "note_id": note_id,
                    "target_email": user_email,
                    "owner_id": owner_id,
                    "error_details": str(e),
                    "action": "unshare_note"
                }
            })

    def get_notes_shared_with_user(self, utilisateur_id: int, skip: int = 0, limit: int = 100) -> List:
        try:
            notes = self.note_repo.get_shared_with_user(utilisateur_id, skip, limit)
            if not notes:
                return {
                    "status": "success",
                    "code": "NO_SHARED_NOTES",
                    "message": "Aucune note partagée avec vous pour le moment",
                    "data": []
                }
            return notes
        except Exception as e:
            raise NotFoundException({
                "status": "error",
                "code": "SHARED_NOTES_FETCH_FAILED",
                "message": "Erreur lors de la récupération des notes partagées",
                "data": {
                    "user_id": utilisateur_id,
                    "skip": skip,
                    "limit": limit,
                    "error_details": str(e),
                    "action": "get_shared_notes"
                }
            })

    def get_note_shares(self, note_id: int, owner_id: int) -> List[Dict]:
        # Vérification de la note
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException({
                "status": "error",
                "code": "NOTE_NOT_FOUND",
                "message": f"La note avec l'ID {note_id} n'existe pas ou vous n'en êtes pas le propriétaire",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "action": "get_note_shares"
                }
            })

        try:
            shares = self.db.query(PartageNote).filter(
                PartageNote.note_id == note_id,
                PartageNote.utilisateur_id == owner_id
            ).all()

            result = []
            for share in shares:
                user = self.user_repo.get(share.partage_avec_utilisateur_id)
                if user:
                    result.append({
                        "email": user.email,
                        "user_id": user.id,
                        "shared_at": share.date_partage,
                        "permission": share.permission,
                        "status": "active"
                    })

            return {
                "status": "success",
                "code": "SHARES_RETRIEVED",
                "message": f"Liste des partages pour la note '{note.titre}'",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "total_shares": len(result),
                    "shares": result
                }
            }
        except Exception as e:
            raise ValidationException({
                "status": "error",
                "code": "SHARES_FETCH_FAILED",
                "message": "Erreur lors de la récupération des partages",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "error_details": str(e),
                    "action": "get_note_shares"
                }
            })

    def create_public_link(self, note_id: int, owner_id: int) -> Dict:
        # Vérification de la note
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException({
                "status": "error",
                "code": "NOTE_NOT_FOUND",
                "message": f"La note avec l'ID {note_id} n'existe pas ou vous n'en êtes pas le propriétaire",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "action": "create_public_link"
                }
            })

        try:
            # Génération du token si nécessaire
            if not note.token_publique:
                note.token_publique = str(uuid.uuid4())
                was_already_public = False
            else:
                was_already_public = note.visibilite == "public"
            
            # Change la visibilité en public
            note.visibilite = "public"
            self.db.commit()

            return {
                "status": "success",
                "code": "PUBLIC_LINK_CREATED" if not was_already_public else "PUBLIC_LINK_RETRIEVED",
                "message": f"Lien public {'créé' if not was_already_public else 'récupéré'} pour la note '{note.titre}'",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "public_url": f"/api/v1/sharing/public/{note.token_publique}",
                    "full_url": f"http://localhost:8000/api/v1/sharing/public/{note.token_publique}",
                    "token": note.token_publique,
                    "visibilite": "public",
                    "was_already_public": was_already_public
                }
            }
        except Exception as e:
            self.db.rollback()
            raise ValidationException({
                "status": "error",
                "code": "PUBLIC_LINK_CREATION_FAILED",
                "message": "Erreur lors de la création du lien public",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "error_details": str(e),
                    "action": "create_public_link"
                }
            })

    def revoke_public_link(self, note_id: int, owner_id: int) -> Dict:
        # Vérification de la note
        note = self.note_repo.get_user_note_by_id(note_id, owner_id)
        if not note:
            raise NotFoundException({
                "status": "error",
                "code": "NOTE_NOT_FOUND",
                "message": f"La note avec l'ID {note_id} n'existe pas ou vous n'en êtes pas le propriétaire",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "action": "revoke_public_link"
                }
            })

        if note.visibilite != "public" or not note.token_publique:
            raise ValidationException({
                "status": "error",
                "code": "NOT_PUBLIC",
                "message": f"La note '{note.titre}' n'est pas publique ou n'a pas de lien public",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "current_visibility": note.visibilite,
                    "has_token": bool(note.token_publique),
                    "action": "revoke_public_link"
                }
            })

        try:
            # Rendre la note privée
            note.visibilite = "prive"
            note.token_publique = None
            self.db.commit()

            return {
                "status": "success",
                "code": "PUBLIC_LINK_REVOKED",
                "message": f"Le lien public de la note '{note.titre}' a été révoqué avec succès",
                "data": {
                    "note_id": note_id,
                    "note_titre": note.titre,
                    "visibilite": "prive",
                    "revoked_at": "now"
                }
            }
        except Exception as e:
            self.db.rollback()
            raise ValidationException({
                "status": "error",
                "code": "PUBLIC_LINK_REVOCATION_FAILED",
                "message": "Erreur lors de la révocation du lien public",
                "data": {
                    "note_id": note_id,
                    "owner_id": owner_id,
                    "error_details": str(e),
                    "action": "revoke_public_link"
                }
            })

    def get_public_note_by_token(self, token: str):
        """Récupérer une note publique par son token"""
        if not token or len(token.strip()) == 0:
            raise ValidationException({
                "status": "error",
                "code": "INVALID_TOKEN",
                "message": "Le token public ne peut pas être vide",
                "data": {
                    "token": token,
                    "action": "get_public_note"
                }
            })
        
        try:
            note = self.note_repo.get_public_note_by_token(token)
            if not note:
                raise NotFoundException({
                    "status": "error",
                    "code": "PUBLIC_NOTE_NOT_FOUND",
                    "message": "Aucune note publique trouvée avec ce token ou la note n'est plus publique",
                    "data": {
                        "token": token,
                        "action": "get_public_note"
                    }
                })
            
            return note
        except Exception as e:
            if isinstance(e, (NotFoundException, ValidationException)):
                raise
            raise ValidationException({
                "status": "error",
                "code": "PUBLIC_NOTE_FETCH_FAILED",
                "message": "Erreur lors de la récupération de la note publique",
                "data": {
                    "token": token,
                    "error_details": str(e),
                    "action": "get_public_note"
                }
            })