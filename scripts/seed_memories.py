"""
Standalone CLI script to seed sample memories into local SQLite database.
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.database import init_db, SessionLocal
from app.models import Memory
from app.routers.memories import SAMPLE_MEMORIES

def main():
    print("Initializing Echoes database tables...")
    init_db()
    db = SessionLocal()
    try:
        count = 0
        for item in SAMPLE_MEMORIES:
            exists = db.query(Memory).filter(Memory.title == item["title"]).first()
            if not exists:
                mem = Memory(**item)
                db.add(mem)
                count += 1
        db.commit()
        print(f"Successfully seeded {count} sample memories into the vault!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
