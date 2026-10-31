import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Memory(Base):
    __tablename__ = "memories"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    transcription = Column(Text, nullable=True)
    date = Column(String(50), nullable=True)
    tags = Column(String(255), nullable=True, default="")
    person_name = Column(String(100), nullable=True, index=True)
    audio_filename = Column(String(255), nullable=True)
    audio_duration = Column(Float, nullable=True)
    image_filename = Column(String(255), nullable=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RemembranceProfile(Base):
    __tablename__ = "remembrance_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    person_name = Column(String(100), nullable=False)
    relationship = Column(String(100), nullable=True)
    birth_date = Column(String(50), nullable=True)
    passing_date = Column(String(50), nullable=True)
    biography = Column(Text, nullable=True)
    favorite_food = Column(String(255), nullable=True)
    favorite_music = Column(String(255), nullable=True)
    favorite_quote = Column(String(255), nullable=True)
    tribute_message = Column(Text, nullable=True)
    photo_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GhostStory(Base):
    __tablename__ = "ghost_stories"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    horror_intensity = Column(Integer, default=3)  # 1 to 5
    inspired_by_memories = Column(Text, nullable=True)  # JSON or comma-separated titles
    is_fiction = Column(Boolean, default=True)  # Must always be True
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)  # JSON string of source IDs/titles
    created_at = Column(DateTime, default=datetime.utcnow)
