from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Memory
from app.schemas import HealthResponse, SettingsUpdateRequest
from app.config import settings
from app.services.ollama_client import ollama_client
from app.services.transcription import transcription_service

router = APIRouter(prefix="/api", tags=["System Health & Settings"])

@router.get("/health", response_model=HealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    """System health check and local AI model status."""
    # 1. Database check
    db_ok = True
    total_memories = 0
    try:
        total_memories = db.query(Memory).count()
    except Exception:
        db_ok = False

    # 2. Ollama check
    ollama_info = ollama_client.check_health()
    ollama_ok = ollama_info.get("is_running", False)
    models = ollama_info.get("models", [])
    active_model = ollama_client.get_best_available_model(settings.default_model) or "None (Ollama offline)"

    # 3. Whisper check
    whisper_engine, whisper_type = transcription_service._get_whisper_engine()
    whisper_avail = whisper_engine is not None

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        app_name=settings.app_name,
        version=settings.version,
        database_ok=db_ok,
        ollama_ok=ollama_ok,
        ollama_url=settings.ollama_base_url,
        active_model=active_model,
        available_models=models,
        whisper_available=whisper_avail,
        offline_mode_enforced=True,
        total_memories=total_memories
    )

@router.get("/settings")
def get_settings():
    """Get active configuration parameters."""
    ollama_info = ollama_client.check_health()
    return {
        "app_name": settings.app_name,
        "version": settings.version,
        "ollama_base_url": settings.ollama_base_url,
        "default_model": settings.default_model,
        "active_model": ollama_client.get_best_available_model(settings.default_model),
        "available_models": ollama_info.get("models", []),
        "offline_mode_enforced": True,
        "allow_external_apis": False
    }

@router.post("/settings")
def update_settings(payload: SettingsUpdateRequest):
    """Change active local model or Ollama URL dynamically."""
    if payload.selected_model:
        settings.default_model = payload.selected_model
    if payload.ollama_base_url:
        settings.ollama_base_url = payload.ollama_base_url
        ollama_client.base_url = payload.ollama_base_url.rstrip("/")

    return {
        "message": "Settings updated successfully",
        "default_model": settings.default_model,
        "ollama_base_url": settings.ollama_base_url,
        "active_model": ollama_client.get_best_available_model(settings.default_model)
    }
