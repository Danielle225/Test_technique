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
        print(f"Token reçu: {token[:20]}...")  
        print(f"Utilisation SECRET_KEY: {SECRET_KEY[:10]}...")  
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Payload JWT décodé: {payload}") 
        
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
            
        try:
            user_id = int(user_id_str)
        except (ValueError, TypeError) as e:
            print(f"Erreur conversion user_id: {e}")
            raise credentials_exception
            
    except JWTError as e:
        print(f"Erreur JWT: {e}")
        raise credentials_exception

    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if not user:
        raise credentials_exception

    return user