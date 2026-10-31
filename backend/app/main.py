import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import health, memories, assistant, ghost_story, remembrance, export

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("echoes")

app = FastAPI(
    title=settings.app_name,
    description="Privacy-first offline AI application to preserve family memories, stories, and histories.",
    version=settings.version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for audio playback and profile photos
app.mount("/uploads", StaticFiles(directory=str(settings.uploads_dir)), name="uploads")

# Include Routers
app.include_router(health.router)
app.include_router(memories.router)
app.include_router(assistant.router)
app.include_router(ghost_story.router)
app.include_router(remembrance.router)
app.include_router(export.router)

@app.on_event("startup")
def on_startup():
    logger.info("Starting Echoes Memory Keeper Backend...")
    logger.info(f"Database Path: {settings.database_url}")
    logger.info(f"Ollama Target URL: {settings.ollama_base_url}")
    logger.info(f"Offline Mode Enforced: {settings.offline_mode_enforced}")
    init_db()
    logger.info("Database tables verified.")

@app.get("/")
def root():
    return {
        "app": settings.app_name,
        "tagline": settings.app_tagline,
        "version": settings.version,
        "status": "online",
        "offline_mode": True,
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
