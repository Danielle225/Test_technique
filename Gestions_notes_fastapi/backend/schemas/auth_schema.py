from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    utilisateur_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str

class RegisterRequest(BaseModel):
    email: EmailStr
    mot_de_passe: str = Field(..., min_length=8)