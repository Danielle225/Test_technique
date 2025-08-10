from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class VisibilityEnum(str, Enum):
    prive = "prive"
    partage = "partage"
    public = "public"

class TagResponse(BaseModel):
    id: int
    nom: str
    
    class Config:
        from_attributes = True

class NoteBase(BaseModel):
    titre: str = Field(..., min_length=1, max_length=255, description="Titre de la note")
    contenu: str = Field(..., min_length=1, description="Contenu de la note (Markdown autorisé)")
    visibilite: VisibilityEnum = Field(default=VisibilityEnum.prive, description="Visibilité de la note")

class NoteCreate(NoteBase):
    tags: Optional[List[str]] = Field(default=[], description="Liste des tags (optionnel)")

class NoteUpdate(BaseModel):
    titre: Optional[str] = Field(None, min_length=1, max_length=255)
    contenu: Optional[str] = Field(None, min_length=1)
    visibilite: Optional[VisibilityEnum] = None
    tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: int
    owner_id: int 
    date_creation: datetime
    date_modification: Optional[datetime]
    
    token_publique: Optional[str]
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True

class NoteList(BaseModel):
    notes: List[NoteResponse]
    total: int
    page: int
    per_page: int
    pages: int

class PublicNoteResponse(BaseModel):
    id: int
    titre: str
    contenu: str
    date_creation: datetime
    date_modification: Optional[datetime]
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True