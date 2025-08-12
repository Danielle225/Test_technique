from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.auth import get_current_user
from database.database import get_db
from models.utilisateurs import Utilisateur
from schemas.auth_schema import LoginRequest, Token
from schemas.utilisateur_schema import UserCreate, UserResponse
from services.auth_service import AuthService
from core.exceptions import AuthenticationException, ValidationException

router = APIRouter()

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
   
    try:
        auth_service = AuthService(db)
        return auth_service.signup(user_data)
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=dict)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    
    try:
        auth_service = AuthService(db)
        return auth_service.login(login_data)
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/logout")
def logout():
   
    return {"message": "Déconnexion réussie. Supprimez le token côté client."}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer les informations de l'utilisateur connecté"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "date_creation": current_user.date_creation,
        "est_actif": current_user.est_actif
    }

