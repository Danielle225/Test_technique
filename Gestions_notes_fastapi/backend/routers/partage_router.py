from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.utilisateurs import Utilisateur
from core.auth import get_current_user
from schemas.note_schema import NoteResponse
from core.exceptions import NotFoundException, ValidationException

from services.partage_service import PartageService

SERVER_ERROR_MESSAGE = "Erreur interne du serveur"

router = APIRouter()

@router.post("/{note_id}/share/{user_email}", response_model=dict)
def share_note_with_user(
    note_id: int,
    user_email: str,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    try:
        print(f"DB object: {db}")  
        sharing_service = PartageService(db)
        result = sharing_service.share_note_with_user(note_id, user_email, current_user.id)
        return result
    except (NotFoundException, ValidationException) as e:
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']
        
        print(f"Error details: {e}")  
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST if isinstance(e, ValidationException) else status.HTTP_404_NOT_FOUND,
            detail=error_message  
        )
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.delete("/notes/{note_id}/share/{user_email}")
def unshare_note_with_user(
    note_id: int,
    user_email: str,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    try:
        sharing_service = PartageService(db)
        result = sharing_service.unshare_note_with_user(note_id, user_email, current_user.id)
        return result
    except (NotFoundException, ValidationException) as e:
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']

        print(f"Error details: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST if isinstance(e, ValidationException) else status.HTTP_404_NOT_FOUND,
            detail=error_message
        )
    except Exception as e:
        print(f"Unexpected error: {e}")  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.get("/notes/{note_id}/shared-with", response_model=List[dict])
def get_note_shares(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    try:
        sharing_service = PartageService(db)
        shares = sharing_service.get_note_shares(note_id, current_user.id)
        return shares
    except (NotFoundException, ValidationException) as e:
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']
        
        print(f"Error details: {e}")  
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if isinstance(e, NotFoundException) else status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    except Exception as e:
        print(f"Unexpected error: {e}")  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.post("/notes/{note_id}/public-link", response_model=dict)
def create_public_link(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Créer un lien public pour une note (authentification requise)"""
    try:
        sharing_service = PartageService(db)
        result = sharing_service.create_public_link(note_id, current_user.id)
        return result
    except (NotFoundException, ValidationException) as e:
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']
        
        print(f"Error details: {e}")  
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if isinstance(e, NotFoundException) else status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    except Exception as e:
        print(f"Unexpected error: {e}")  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.delete("/notes/{note_id}/public-link")
def revoke_public_link(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    try:
        sharing_service = PartageService(db)
        result = sharing_service.revoke_public_link(note_id, current_user.id)
        return result
    except (NotFoundException, ValidationException) as e:
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']
        
        print(f"Error details: {e}") 
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if isinstance(e, NotFoundException) else status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    except Exception as e:
        print(f"Unexpected error: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.get("/public/{token}", response_model=NoteResponse)
def get_public_note(
    token: str,
    db: Session = Depends(get_db)
):
    try:
        sharing_service = PartageService(db)
        note = sharing_service.get_public_note_by_token(token)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note publique non trouvée"
            )
        return note
    except (NotFoundException, ValidationException) as e:
        # Extraction du message
        error_message = str(e)
        if isinstance(e.args[0], dict) and 'message' in e.args[0]:
            error_message = e.args[0]['message']
        
        print(f"Error details: {e}")  
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND if isinstance(e, NotFoundException) else status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    except Exception as e:
        print(f"Unexpected error: {e}")  
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SERVER_ERROR_MESSAGE
        )

@router.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    """Test de connexion à la base de données"""
    try:
        # Simple test
        result = db.execute("SELECT 1").fetchone()
        return {"db_status": "OK", "result": result}
    except Exception as e:
        return {"db_status": "ERROR", "error": str(e)}