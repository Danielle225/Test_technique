# services/auth_service.py - Version simple avec votre fonction actuelle
from datetime import timedelta
from config import settings
from models.utilisateurs import Utilisateur
from database.database import SessionLocal
from repositories.utilisateur_repository import UserRepository
from schemas.auth_schema import LoginRequest
from utils.security import create_access_token, hash_password, verify_password
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any


class AuthService:

    def __init__(self, db: Session):
        self.db = db
        self.utilisateur_repository = UserRepository(db)

    def signup(self, user_data: dict) -> Dict[str, Any]:
        """Inscription d'un nouvel utilisateur"""
        existing_user = self.utilisateur_repository.get_by_email(user_data.email)
        if existing_user:
            raise ValueError("Cet email est déjà utilisé.")

        utilisateur = self.utilisateur_repository.create_user(user_data)

        # CORRECTION: Utiliser votre fonction actuelle avec le bon format
        access_token = create_access_token(
            data={"sub": str(utilisateur.id)}  # Format correct pour votre fonction
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": utilisateur.id,
                "email": utilisateur.email,
                "created_at": utilisateur.date_creation,
                "is_active": utilisateur.est_actif
            }
        }

    def login(self, login_data: LoginRequest) -> Dict[str, Any]:
        """Connexion d'un utilisateur existant"""
        utilisateur = self.utilisateur_repository.authenticate(login_data.email, login_data.mot_de_passe)
        if not utilisateur:
            raise ValueError("Identifiants invalides.")
        if not self.utilisateur_repository.is_active(utilisateur):
            raise ValueError("Utilisateur inactif.")

        # CORRECTION: Utiliser votre fonction actuelle avec le bon format
        access_token = create_access_token(
            data={"sub": str(utilisateur.id)}  # Format correct pour votre fonction
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": utilisateur.id,
                "email": utilisateur.email
            }
        }