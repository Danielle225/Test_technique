from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.utilisateurs import Utilisateur
from schemas.note_schema import NoteResponse
from services.partage_service import PartageService
from core.exceptions import NotFoundException, ValidationException

router = APIRouter()

@router.post("/notes/{note_id}/share/{user_email}", response_model=dict)
def share_note_with_user(
    note_id: int,
    user_email: str,
    db: Session = Depends(get_db),
):
    try:
        sharing_service = PartageService(db)
        result = sharing_service.share_note_with_user(note_id, user_email, Utilisateur.id)
        return result
    except (NotFoundException, ValidationException) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST if isinstance(e, ValidationException) else status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.delete("/notes/{note_id}/share/{user_email}")
def unshare_note_with_user(
    note_id: int,
    user_email: str,
    db: Session = Depends(get_db),
):
   
    try:
        sharing_service = PartageService(db)
        result = sharing_service.unshare_note_with_user(note_id, user_email, Utilisateur.id)
        return result
    except (NotFoundException, ValidationException) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST if isinstance(e, ValidationException) else status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/shared-with-me", response_model=List[NoteResponse])
def get_shared_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
   
    sharing_service = PartageService(db)
    notes = sharing_service.get_notes_shared_with_user(Utilisateur.id, skip, limit)
    return notes

@router.get("/notes/{note_id}/shared-with", response_model=List[dict])
def get_note_shares(
    note_id: int,
    db: Session = Depends(get_db),
):
   
    try:
        sharing_service = PartageService(db)
        shares = sharing_service.get_note_shares(note_id, Utilisateur.id)
        return shares
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/notes/{note_id}/public-link", response_model=dict)
def create_public_link(
    note_id: int,
    db: Session = Depends(get_db),
):
    
    try:
        sharing_service = PartageService(db)
        result = sharing_service.create_public_link(note_id, Utilisateur.id)
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/notes/{note_id}/public-link")
def revoke_public_link(
    note_id: int,
    db: Session = Depends(get_db),
):
    
    try:
        sharing_service = PartageService(db)
        result = sharing_service.revoke_public_link(note_id, Utilisateur.id)
        return result
    except NotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))