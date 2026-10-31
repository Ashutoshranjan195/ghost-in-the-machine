import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.main import app
from app.database import Base, engine, get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    # Ensure fresh schema
    Base.metadata.create_all(bind=engine)
    yield

def test_health_endpoint():
    """Verify system health, DB status, and offline mode enforcement."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["database_ok"] is True
    assert data["offline_mode_enforced"] is True
    assert "version" in data
    assert "active_model" in data

def test_seed_and_list_memories():
    """Verify seeding pre-populated fictional memories and retrieving them."""
    # Seed
    seed_resp = client.post("/api/memories/seed")
    assert seed_resp.status_code == 200
    seed_data = seed_resp.json()
    assert seed_data["total"] >= 5

    # List
    list_resp = client.get("/api/memories")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert list_data["total"] >= 5
    assert len(list_data["items"]) >= 5

def test_search_memories():
    """Test searching memories by keyword."""
    # Search for 'Chevy'
    resp = client.get("/api/memories?q=Chevy")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 1
    assert "Chevy" in data["items"][0]["title"]

def test_create_and_delete_memory():
    """Verify creating, fetching, updating, and deleting a memory."""
    payload = {
        "title": "Summer Camp at Crystal Lake",
        "description": "We spent two weeks learning how to steer old canvas canoes and roast marshmallows over the pine embers.",
        "date": "July 1995",
        "tags": "camp, summer, outdoors",
        "person_name": "Cousin Toby",
        "is_favorite": True
    }
    create_resp = client.post("/api/memories", json=payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    mem_id = created["id"]
    assert created["title"] == payload["title"]

    # Fetch
    get_resp = client.get(f"/api/memories/{mem_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["person_name"] == "Cousin Toby"

    # Update
    update_resp = client.put(f"/api/memories/{mem_id}", json={"person_name": "Toby Miller"})
    assert update_resp.status_code == 200
    assert update_resp.json()["person_name"] == "Toby Miller"

    # Export
    export_resp = client.get(f"/api/export/{mem_id}")
    assert export_resp.status_code == 200
    export_data = export_resp.json()
    assert "# Summer Camp at Crystal Lake" in export_data["markdown_content"]

    # Delete
    del_resp = client.delete(f"/api/memories/{mem_id}")
    assert del_resp.status_code == 200

    # Ensure 404 after delete
    get_after = client.get(f"/api/memories/{mem_id}")
    assert get_after.status_code == 404

def test_assistant_chat_rag():
    """Test AI assistant retrieval and strict factual grounding."""
    # Ask a question related to Grandpa Joe's truck
    query = {"message": "What kind of vehicle did Grandpa Joe wash in the summer?"}
    chat_resp = client.post("/api/assistant/chat", json=query)
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    assert "answer" in chat_data
    assert len(chat_data["sources"]) > 0
    # Must cite Grandpa Joe's Old Blue Chevy
    titles = [s["title"] for s in chat_data["sources"]]
    assert any("Chevy" in t for t in titles)

def test_ghost_story_generation():
    """Test ghost story generation with horror intensity and mandatory fiction disclaimer."""
    # First get a memory ID
    list_resp = client.get("/api/memories")
    items = list_resp.json()["items"]
    assert len(items) > 0
    mem_ids = [items[0]["id"]]

    payload = {
        "memory_ids": mem_ids,
        "horror_intensity": 3,
        "setting_mood": "midnight_storm"
    }
    story_resp = client.post("/api/ghost-story/generate", json=payload)
    assert story_resp.status_code == 200
    data = story_resp.json()
    assert "title" in data
    assert "content" in data
    assert data["horror_intensity"] == 3
    assert "FICTIONAL STORY ONLY" in data["disclaimer"]

def test_remembrance_tribute_generation():
    """Test generating a respectful remembrance tribute."""
    payload = {
        "person_name": "Eleanor Vance",
        "relationship": "Grandmother",
        "birth_date": "1932",
        "passing_date": "2018",
        "biography": "A lifelong schoolteacher who loved wildflower gardening and classical radio.",
        "favorite_food": "Lemon chiffon cake",
        "favorite_music": "Debussy's Clair de Lune",
        "favorite_quote": "Always leave a little room in your heart for the unimaginable."
    }
    resp = client.post("/api/remembrance/generate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "tribute_message" in data
    assert "Eleanor" in data["tribute_message"]
