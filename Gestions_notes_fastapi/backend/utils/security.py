from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))



if not SECRET_KEY:
    raise ValueError("SECRET_KEY doit être définie dans le fichier .env")

if len(SECRET_KEY) < 32:
    print(" ATTENTION: SECRET_KEY trop courte pour la production (< 32 caractères)")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    try:
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return token
    except Exception as error:
        print(f" Erreur lors de la création du token: {error}")
        raise

def decode_access_token(token: str):
    try:
        print(f" Décodage token: {token[:20]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:   
        print(f" Erreur JWT lors du décodage: {e}")
        return None