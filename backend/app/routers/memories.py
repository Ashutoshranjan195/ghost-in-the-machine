import os
import shutil
import uuid
from typing import Optional, List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Memory
from app.schemas import MemoryResponse, MemoryListResponse, MemoryCreate, MemoryUpdate, TranscribeResponse
from app.config import settings
from app.services.transcription import transcription_service

router = APIRouter(prefix="/api/memories", tags=["Memories"])

SAMPLE_MEMORIES = [
    {
        "title": "Grandpa Joe's Old Blue Chevy",
        "description": "Every Saturday morning in July, Grandpa would pull out the hose and wash his 1968 Chevrolet pickup. He'd let me turn the crank on the chrome windows and sit on the tailgate eating salted watermelon. He told stories about driving through the Appalachians with grandma right after they were married, before the interstate highways were ever paved.",
        "date": "July 1978",
        "tags": "grandpa, childhood, summer, chevy, truck",
        "person_name": "Grandpa Joe",
        "is_favorite": True
    },
    {
        "title": "Nani's Cardamom Chai & Monsoon Mornings",
        "description": "Whenever the first raindrops of the monsoon hit the courtyard tiles, Nani would crush fresh cardamom pods and fresh ginger in the stone mortar. She insisted that tea must simmer for exactly twelve minutes to marry the spices. She taught me that quiet pauses in a rainy afternoon are the greatest luxury a person can have.",
        "date": "August 1986",
        "tags": "nani, chai, monsoon, kitchen, lessons",
        "person_name": "Nani Savitri",
        "is_favorite": True
    },
    {
        "title": "The 1989 Jazz Festival Rainout",
        "description": "It poured buckets at the waterfront pavilion just as the brass quartet began. Instead of running, Uncle Leo took his trench coat and held it over the saxophone player while the crowd clapped along to 'Take Five'. We ended up eating soggy cider donuts in a crowded subway station, laughing until our ribs ached.",
        "date": "October 1989",
        "tags": "music, jazz, uncle leo, autumn, rain",
        "person_name": "Uncle Leo",
        "is_favorite": False
    },
    {
        "title": "Aunt Clara's Secret Apple Pie Recipe",
        "description": "Aunt Clara guarded her pie crust recipe like a state secret until her 80th birthday. The secret wasn't lard or butter alone—it was two tablespoons of ice-cold apple cider vinegar and grating the butter while frozen. 'Never handle the dough more than you'd hold a frightened bird,' she always said.",
        "date": "Thanksgiving 1994",
        "tags": "recipes, aunt clara, baking, thanksgiving, tradition",
        "person_name": "Aunt Clara",
        "is_favorite": False
    },
    {
        "title": "The Wooden Workshop on Elm Street",
        "description": "Dad spent hours in the basement workshop smelling of cedar sawdust and lemon wood polish. He built the pine bookshelf in my childhood bedroom with hand-carved dove joints. He engraved a tiny swallow bird on the underside of the lowest shelf where only a kid lying on the floor could ever see it.",
        "date": "Spring 1991",
        "tags": "father, woodworking, craftsmanship, childhood",
        "person_name": "Dad (Arthur)",
        "is_favorite": True
    }
]

@router.get("", response_model=MemoryListResponse)
def list_memories(
    q: Optional[str] = Query(None, description="Search term across title, tags, and description"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    person: Optional[str] = Query(None, description="Filter by person name"),
    favorite: Optional[bool] = Query(None, description="Filter favorites"),
    db: Session = Depends(get_db)
):
    """Retrieve memories with filtering, search, and sorting."""
    query = db.query(Memory)

    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Memory.title.ilike(search_fmt),
                Memory.description.ilike(search_fmt),
                Memory.tags.ilike(search_fmt),
                Memory.person_name.ilike(search_fmt),
                Memory.transcription.ilike(search_fmt)
            )
        )

    if tag:
        query = query.filter(Memory.tags.ilike(f"%{tag.strip()}%"))

    if person:
        query = query.filter(Memory.person_name.ilike(f"%{person.strip()}%"))

    if favorite is not None:
        query = query.filter(Memory.is_favorite == favorite)

    # Sort newest updated first
    items = query.order_by(Memory.updated_at.desc()).all()
    return MemoryListResponse(total=len(items), items=items)

@router.post("", response_model=MemoryResponse)
def create_memory(
    memory: MemoryCreate,
    db: Session = Depends(get_db)
):
    """Create a new memory in the vault."""
    db_mem = Memory(
        title=memory.title,
        description=memory.description,
        transcription=memory.transcription,
        date=memory.date,
        tags=memory.tags,
        person_name=memory.person_name,
        is_favorite=memory.is_favorite or False
    )
    db.add(db_mem)
    db.commit()
    db.refresh(db_mem)
    return db_mem

@router.get("/{memory_id}", response_model=MemoryResponse)
def get_memory(memory_id: str, db: Session = Depends(get_db)):
    """Fetch single memory by ID."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found in vault")
    return mem

@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: str,
    payload: MemoryUpdate,
    db: Session = Depends(get_db)
):
    """Update details of an existing memory."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found in vault")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(mem, field, val)

    db.commit()
    db.refresh(mem)
    return mem

@router.delete("/{memory_id}")
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    """Delete a memory and associated audio file if present."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found in vault")

    if mem.audio_filename:
        audio_path = settings.uploads_dir / mem.audio_filename
        if audio_path.exists():
            try:
                audio_path.unlink()
            except Exception:
                pass

    db.delete(mem)
    db.commit()
    return {"message": "Memory deleted successfully", "id": memory_id}

@router.post("/{memory_id}/upload-audio", response_model=MemoryResponse)
async def upload_audio_to_memory(
    memory_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload an audio recording to an existing memory."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    ext = Path(file.filename or "").suffix.lower()
    if not ext:
        ext = ".wav"

    safe_filename = f"audio_{memory_id[:8]}_{uuid.uuid4().hex[:6]}{ext}"
    target_path = settings.uploads_dir / safe_filename

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    duration = transcription_service.get_audio_duration(target_path)

    mem.audio_filename = safe_filename
    mem.audio_duration = duration
    db.commit()
    db.refresh(mem)
    return mem

@router.post("/{memory_id}/transcribe", response_model=TranscribeResponse)
def transcribe_memory_audio(
    memory_id: str,
    db: Session = Depends(get_db)
):
    """Transcribe the audio file attached to the memory using local Whisper."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    if not mem.audio_filename:
        raise HTTPException(status_code=400, detail="No audio file is attached to this memory.")

    audio_path = settings.uploads_dir / mem.audio_filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file missing from local storage.")

    result = transcription_service.transcribe_audio(audio_path)
    transcription_text = result.get("text", "")

    # Save to memory
    mem.transcription = transcription_text
    if result.get("duration"):
        mem.audio_duration = result.get("duration")
    db.commit()

    return TranscribeResponse(
        memory_id=mem.id,
        transcription=transcription_text,
        audio_filename=mem.audio_filename,
        status=result.get("status", "completed"),
        duration_seconds=mem.audio_duration
    )

@router.post("/seed", response_model=MemoryListResponse)
def seed_sample_memories(db: Session = Depends(get_db)):
    """Seed the vault with sample fictional family memories if empty or requested."""
    created = []
    for item in SAMPLE_MEMORIES:
        exists = db.query(Memory).filter(Memory.title == item["title"]).first()
        if not exists:
            mem = Memory(**item)
            db.add(mem)
            created.append(mem)

    db.commit()
    all_items = db.query(Memory).order_by(Memory.created_at.desc()).all()
    return MemoryListResponse(total=len(all_items), items=all_items)
