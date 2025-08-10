import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database.database import get_db
from models.utilisateurs import Utilisateur
from utils.security import SECRET_KEY, ALGORITHM  

security = HTTPBearer()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Utilisateur:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials_exception.headers.get("Authorization", token)
        print(f"Token reçu: {token[:20]}...")  # Debug
        print(f"Utilisation SECRET_KEY: {SECRET_KEY[:10]}...")  # Debug
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Payload JWT décodé: {payload}")  # Debug
        
        user_id_str = payload.get("sub")
        if user_id_str is None:
            print("Aucun 'sub' trouvé dans le payload")
            raise credentials_exception
            
        try:
            user_id = int(user_id_str)
            print(f"User ID extrait: {user_id}")  # Debug
        except (ValueError, TypeError) as e:
            print(f"Erreur conversion user_id: {e}")
            raise credentials_exception
            
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        raise credentials_exception

    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not user:
        print(f"Utilisateur non trouvé avec ID: {user_id}")
        raise credentials_exception

    print(f"Utilisateur authentifié: {user.email}")  # Debug
    return user