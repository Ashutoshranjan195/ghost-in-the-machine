import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatHistory
from app.schemas import AssistantChatRequest, AssistantChatResponse
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_memories(
    payload: AssistantChatRequest,
    db: Session = Depends(get_db)
):
    """
    RAG-powered conversational assistant. Answers strictly using memories stored in the local vault.
    Never hallucinates personal facts; provides source attribution.
    """
    # 1. Save user query in history
    user_msg = ChatHistory(role="user", content=payload.message)
    db.add(user_msg)
    db.commit()

    # 2. Execute RAG
    rag_result = rag_engine.answer_query(
        db=db,
        query=payload.message,
        model_override=payload.model_override
    )

    # 3. Save assistant reply in history
    sources_json = json.dumps(rag_result.get("sources", []))
    assistant_msg = ChatHistory(
        role="assistant",
        content=rag_result.get("answer", ""),
        sources=sources_json
    )
    db.add(assistant_msg)
    db.commit()

    return AssistantChatResponse(**rag_result)

@router.get("/history")
def get_chat_history(db: Session = Depends(get_db)):
    """Fetch past conversational turns."""
    messages = db.query(ChatHistory).order_by(ChatHistory.created_at.asc()).all()
    out = []
    for m in messages:
        sources_list = []
        if m.sources:
            try:
                sources_list = json.loads(m.sources)
            except Exception:
                sources_list = []
        out.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "sources": sources_list,
            "created_at": m.created_at
        })
    return out

@router.delete("/history")
def clear_chat_history(db: Session = Depends(get_db)):
    """Clear chat conversation history."""
    db.query(ChatHistory).delete()
    db.commit()
    return {"message": "Chat history cleared"}
