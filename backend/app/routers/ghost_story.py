from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GhostStory
from app.schemas import GhostStoryGenerateRequest, GhostStoryResponse
from app.services.ghost_story import ghost_story_service

router = APIRouter(prefix="/api/ghost-story", tags=["Ghost Story Mode"])

@router.post("/generate", response_model=GhostStoryResponse)
def generate_ghost_story(
    payload: GhostStoryGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a fictional gothic ghost story inspired by selected memory motifs.
    Clearly attributed as creative fiction with adjustable horror intensity.
    """
    try:
        story = ghost_story_service.generate_story(
            db=db,
            memory_ids=payload.memory_ids,
            intensity=payload.horror_intensity,
            setting_mood=payload.setting_mood or "midnight_storm"
        )
        return GhostStoryResponse(**story)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ghost story generation error: {str(e)}")

@router.get("/list")
def list_ghost_stories(db: Session = Depends(get_db)):
    """List previously generated fictional stories."""
    stories = db.query(GhostStory).order_by(GhostStory.created_at.desc()).all()
    out = []
    for s in stories:
        out.append({
            "id": s.id,
            "title": s.title,
            "content": s.content,
            "horror_intensity": s.horror_intensity,
            "inspired_by_memories": (s.inspired_by_memories or "").split(", "),
            "disclaimer": "FICTIONAL STORY ONLY — Generated as an artistic creative homage inspired by memory motifs.",
            "created_at": s.created_at
        })
    return out

@router.get("/{story_id}")
def get_ghost_story(story_id: str, db: Session = Depends(get_db)):
    """Retrieve a single ghost story by ID."""
    story = db.query(GhostStory).filter(GhostStory.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return {
        "id": story.id,
        "title": story.title,
        "content": story.content,
        "horror_intensity": story.horror_intensity,
        "inspired_by_memories": (story.inspired_by_memories or "").split(", "),
        "disclaimer": "FICTIONAL STORY ONLY — Generated as an artistic creative homage inspired by memory motifs.",
        "created_at": story.created_at
    }
