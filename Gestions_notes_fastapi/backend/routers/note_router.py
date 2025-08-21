from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session

from database.database import get_db
from models.utilisateurs import Utilisateur
from core.auth import get_current_user
from schemas.note_schema import NoteCreate, NoteUpdate, NoteResponse, NoteList, PublicNoteResponse
from services.note_service import NoteService
from core.exceptions import NotFoundException

router = APIRouter()

@router.post("/notes/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Créer une nouvelle note"""
    note_service = NoteService(db)
    note = note_service.create_note(note_data, utilisateur_id=current_user.id)
    return note

@router.get("/notes/", response_model=List[NoteResponse])
def get_my_notes(
    skip: int = Query(0, ge=0, description="Nombre d'éléments à ignorer"),
    limit: int = Query(100, ge=1, le=100, description="Nombre d'éléments à retourner"),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer toutes mes notes"""
    note_service = NoteService(db)
    notes = note_service.get_user_notes(current_user.id, skip, limit)
    return notes

@router.get("/notes/search/", response_model=List[NoteResponse])
def search_notes(
    query: str = Query(..., min_length=1, description="Terme de recherche"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Rechercher dans mes notes"""
    note_service = NoteService(db)
    notes = note_service.search_notes(current_user.id, query, skip, limit)
    return notes

@router.get("/notes/filter/visibility/{visibilite}", response_model=List[NoteResponse])
def filter_by_visibility(
    visibilite: str,  
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    if visibilite not in ["prive", "public"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La visibilité doit être 'prive' ou 'public'"
        )
    
    note_service = NoteService(db)
    notes = note_service.filter_notes_by_visibilite(current_user.id, visibilite, skip, limit)
    return notes

@router.get("/notes/filter/tag/{tag_nom}", response_model=List[NoteResponse])
def filter_by_tag(
    tag_nom: str,  
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Filtrer mes notes par tag"""
    note_service = NoteService(db)
    notes = note_service.filter_notes_by_tag(current_user.id, tag_nom, skip, limit)
    return notes

@router.get("/notes/public/{token}", response_model=PublicNoteResponse)
def get_public_note(
    token: str,  # CORRECTION: Paramètre simple
    db: Session = Depends(get_db)
):
    """Récupérer une note publique (pas d'authentification requise)"""
    note_service = NoteService(db)
    note = note_service.get_public_note_by_token(token)

    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note publique non trouvée"
        )
    
    return note

@router.get("/notes/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,  
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer une note spécifique"""
    try:
        note_service = NoteService(db)
        print(f"DEBUG: from route note {note_id} for user {current_user.id}")
        note = note_service.get_note_by_id(note_id, current_user.id)
        print(f"DEBUG: Retrieved note {note_id} for user {current_user.id}")
        print(type(note))  # DEBUG: Check type of note
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,  
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Mettre à jour une note"""
    try:
        note_service = NoteService(db)
        note = note_service.update_note(note_id, note_data, current_user.id)
        return note
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,  
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Supprimer une note"""
    try:
        note_service = NoteService(db)
        note_service.delete_note(note_id, current_user.id)
        return None
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))