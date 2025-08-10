from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    mot_de_passe: str = Field(..., min_length=8, description="Mot de passe (min 8 caractères)")

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    mot_de_passe: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: int
    est_actif: bool
    date_creation: datetime
    
    class Config:
        from_attributes = True

class UserInDB(UserBase):
    id: int
    mot_de_passe: str
    est_actif: bool
    date_creation: datetime
    date_modification: Optional[datetime]
    
    class Config:
        from_attributes = True