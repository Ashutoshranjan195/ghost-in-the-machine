from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- Memory Schemas -----------------
class MemoryBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Memory title")
    description: str = Field(..., min_length=1, description="Memory story narrative or text")
    transcription: Optional[str] = Field(None, description="Transcribed audio text")
    date: Optional[str] = Field(None, max_length=50, description="Approximate or exact date of memory")
    tags: Optional[str] = Field(None, max_length=255, description="Comma-separated tags")
    person_name: Optional[str] = Field(None, max_length=100, description="Person associated with the story")
    is_favorite: Optional[bool] = Field(False, description="Favorite toggle")

class MemoryCreate(MemoryBase):
    pass

class MemoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    transcription: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[str] = None
    person_name: Optional[str] = None
    is_favorite: Optional[bool] = None

class MemoryResponse(MemoryBase):
    id: str
    audio_filename: Optional[str] = None
    audio_duration: Optional[float] = None
    image_filename: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MemoryListResponse(BaseModel):
    total: int
    items: List[MemoryResponse]

# ----------------- Transcription -----------------
class TranscribeResponse(BaseModel):
    memory_id: str
    transcription: str
    audio_filename: str
    status: str
    duration_seconds: Optional[float] = None

# ----------------- Assistant (RAG) -----------------
class SourceCitation(BaseModel):
    id: str
    title: str
    person_name: Optional[str] = None
    snippet: str
    relevance_score: float

class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User question about preserved memories")
    model_override: Optional[str] = None

class AssistantChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    has_vault_context: bool
    model_used: str

# ----------------- Remembrance Studio -----------------
class RemembranceGenerateRequest(BaseModel):
    person_name: str
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    passing_date: Optional[str] = None
    biography: Optional[str] = None
    favorite_food: Optional[str] = None
    favorite_music: Optional[str] = None
    favorite_quote: Optional[str] = None
    selected_memory_ids: Optional[List[str]] = None

class RemembranceProfileCreate(BaseModel):
    person_name: str
    relationship: Optional[str] = None
    birth_date: Optional[str] = None
    passing_date: Optional[str] = None
    biography: Optional[str] = None
    favorite_food: Optional[str] = None
    favorite_music: Optional[str] = None
    favorite_quote: Optional[str] = None
    tribute_message: Optional[str] = None
    photo_filename: Optional[str] = None

class RemembranceProfileResponse(RemembranceProfileCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RemembranceGenerateResponse(BaseModel):
    tribute_message: str
    suggested_title: str
    model_used: str

# ----------------- Ghost Story Mode -----------------
class GhostStoryGenerateRequest(BaseModel):
    memory_ids: List[str] = Field(..., min_length=1, description="Memories to draw inspiration from")
    horror_intensity: int = Field(3, ge=1, le=5, description="Intensity level 1 (Cozy Twilight) to 5 (Gothic Dread)")
    setting_mood: Optional[str] = Field("midnight_storm", description="Mood or setting theme")

class GhostStoryResponse(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    horror_intensity: int
    inspired_by_memories: List[str]
    disclaimer: str = "FICTIONAL STORY ONLY — Generated as an artistic creative homage inspired by memory motifs. Echoes never claims real spirits or supernatural communication."
    model_used: str

# ----------------- Health & Settings -----------------
class ModelInfo(BaseModel):
    name: str
    size: Optional[str] = None
    is_active: bool = False

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database_ok: bool
    ollama_ok: bool
    ollama_url: str
    active_model: str
    available_models: List[str]
    whisper_available: bool
    offline_mode_enforced: bool
    total_memories: int

class SettingsUpdateRequest(BaseModel):
    selected_model: Optional[str] = None
    ollama_base_url: Optional[str] = None

class ExportResponse(BaseModel):
    memory_id: str
    title: str
    markdown_content: str
    json_data: dict
