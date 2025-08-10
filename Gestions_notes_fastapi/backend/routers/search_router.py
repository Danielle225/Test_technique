from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.database import get_db
from models.utilisateurs import Utilisateur
from schemas.note_schema import NoteResponse
from services.note_service import NoteService
from repositories.tag_repository import TagRepository

router = APIRouter()

@router.get("/notes", response_model=List[NoteResponse])
def search_notes(
    q: str = Query(..., min_length=1, description="Terme de recherche"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    
    note_service = NoteService(db)
    notes = note_service.search_notes(Utilisateur.id, q, skip, limit)
    return notes

@router.get("/notes/filter/visibility/{visibilite}", response_model=List[NoteResponse])
def filter_notes_by_visibility(
    visibilite: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Filtrer mes notes par statut de visibilité
    """
    if visibilite not in ["prive", "partage", "public"]:
        raise HTTPException(status_code=400, detail="Visibilité invalide")
    
    note_service = NoteService(db)
    notes = note_service.filter_notes_by_visibility(Utilisateur.id, visibilite, skip, limit)
    return notes

@router.get("/notes/filter/tag/{tag_nom}", response_model=List[NoteResponse])
def filter_notes_by_tag(
    tag_nom: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Filtrer mes notes par tag
    """
    note_service = NoteService(db)
    notes = note_service.filter_notes_by_tag(Utilisateur.id, tag_nom, skip, limit)
    return notes

@router.get("/tags", response_model=List[dict])
def get_my_popular_tags(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
   
    tag_repository = TagRepository(db)
    tags_with_count = tag_repository.get_popular_tags(Utilisateur.id, limit)
    
    return [
        {"nom": tag.nom, "count": count}
        for tag, count in tags_with_count
    ]

@router.get("/tags/autocomplete")
def autocomplete_tags(
    q: str = Query(..., min_length=1, description="Début du nom du tag"),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
   
    tag_repository = TagRepository(db)
    tags = tag_repository.search_tags(q, limit)
    return [{"nom": tag.nom} for tag in tags]