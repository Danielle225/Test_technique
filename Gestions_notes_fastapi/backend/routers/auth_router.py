from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
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

