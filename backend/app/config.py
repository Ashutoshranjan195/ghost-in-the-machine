import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    app_name: str = "Echoes — The Offline Memory Keeper"
    app_tagline: str = "Some voices deserve to live forever."
    version: str = "1.0.0"
    
    # Storage settings
    base_dir: Path = BASE_DIR
    data_dir: Path = DATA_DIR
    uploads_dir: Path = UPLOADS_DIR
    database_url: str = f"sqlite:///{DATA_DIR / 'echoes.db'}"
    
    # Local AI Settings
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    default_model: str = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    fallback_models: list[str] = ["qwen2.5:3b", "qwen2.5:7b", "gemma2:2b", "mistral:7b"]
    whisper_model: str = os.getenv("WHISPER_MODEL", "base")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    
    # Strict Offline and Privacy
    offline_mode_enforced: bool = True
    allow_external_apis: bool = False  # NEVER allow external paid APIs

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
