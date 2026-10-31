from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RemembranceProfile
from app.schemas import (
    RemembranceGenerateRequest,
    RemembranceGenerateResponse,
    RemembranceProfileCreate,
    RemembranceProfileResponse
)
from app.services.remembrance import remembrance_service

router = APIRouter(prefix="/api/remembrance", tags=["Remembrance Studio"])

@router.post("/generate", response_model=RemembranceGenerateResponse)
def generate_remembrance_tribute(
    payload: RemembranceGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generate a heartfelt, dignified tribute message for a loved one."""
    result = remembrance_service.generate_tribute(
        db=db,
        person_name=payload.person_name,
        relationship=payload.relationship,
        birth_date=payload.birth_date,
        passing_date=payload.passing_date,
        biography=payload.biography,
        favorite_food=payload.favorite_food,
        favorite_music=payload.favorite_music,
        favorite_quote=payload.favorite_quote,
        selected_memory_ids=payload.selected_memory_ids
    )
    return RemembranceGenerateResponse(**result)

@router.post("/profiles", response_model=RemembranceProfileResponse)
def save_remembrance_profile(
    payload: RemembranceProfileCreate,
    db: Session = Depends(get_db)
):
    """Save a completed remembrance profile to the local database."""
    profile = RemembranceProfile(
        person_name=payload.person_name,
        relationship=payload.relationship,
        birth_date=payload.birth_date,
        passing_date=payload.passing_date,
        biography=payload.biography,
        favorite_food=payload.favorite_food,
        favorite_music=payload.favorite_music,
        favorite_quote=payload.favorite_quote,
        tribute_message=payload.tribute_message,
        photo_filename=payload.photo_filename
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/profiles", response_model=list[RemembranceProfileResponse])
def list_remembrance_profiles(db: Session = Depends(get_db)):
    """List all saved remembrance profiles."""
    return db.query(RemembranceProfile).order_by(RemembranceProfile.created_at.desc()).all()

@router.get("/profiles/{profile_id}", response_model=RemembranceProfileResponse)
def get_remembrance_profile(profile_id: str, db: Session = Depends(get_db)):
    """Fetch single profile by ID."""
    p = db.query(RemembranceProfile).filter(RemembranceProfile.id == profile_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Remembrance profile not found")
    return p

@router.get("/profiles/{profile_id}/printable")
def get_printable_html(profile_id: str, db: Session = Depends(get_db)):
    """Render a standalone, high-aesthetic printable HTML document."""
    p = db.query(RemembranceProfile).filter(RemembranceProfile.id == profile_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Remembrance profile not found")

    profile_dict = {
        "person_name": p.person_name,
        "relationship": p.relationship,
        "birth_date": p.birth_date,
        "passing_date": p.passing_date,
        "biography": p.biography,
        "favorite_food": p.favorite_food,
        "favorite_music": p.favorite_music,
        "favorite_quote": p.favorite_quote,
        "tribute_message": p.tribute_message
    }
    html_content = remembrance_service.generate_printable_html(profile_dict)
    return Response(content=html_content, media_type="text/html")
