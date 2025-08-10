from typing import Optional
from sqlalchemy.orm import Session
from models.utilisateurs import Utilisateur
from schemas.utilisateur_schema import UserCreate, UserUpdate
from repositories.base import BaseRepository
from utils.security import hash_password, verify_password

class UserRepository(BaseRepository[Utilisateur, UserCreate, UserUpdate]):
    def __init__(self, db: Session):
        super().__init__(Utilisateur, db)

    def get_by_email(self, email: str) -> Optional[Utilisateur]:
        """Obtenir un utilisateur par email"""
        return self.db.query(Utilisateur).filter(Utilisateur.email == email).first()

    def create_user(self, user_create: UserCreate) -> Utilisateur:
        """Créer un nouvel utilisateur avec mot de passe hashé"""
        hashed_password = hash_password(user_create.mot_de_passe)
        db_user = Utilisateur(
            email=user_create.email,
            mot_de_passe=hashed_password
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def authenticate(self, email: str, mot_de_passe: str) -> Optional[Utilisateur]:
        """Authentifier un utilisateur"""
        utilisateur = self.get_by_email(email)
        if not utilisateur or not verify_password(mot_de_passe, utilisateur.mot_de_passe):
            return None
        return utilisateur

    def is_active(self, utilisateur: Utilisateur) -> bool:
        """Vérifier si l'utilisateur est actif"""
        return utilisateur.est_actif

