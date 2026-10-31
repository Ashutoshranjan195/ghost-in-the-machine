import json
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Memory
from app.schemas import ExportResponse

router = APIRouter(prefix="/api/export", tags=["Export"])

@router.get("/{memory_id}", response_model=ExportResponse)
def export_memory(
    memory_id: str,
    format: str = Query("markdown", pattern="^(markdown|json)$"),
    db: Session = Depends(get_db)
):
    """Export an individual memory in Markdown or JSON format."""
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    json_dict = {
        "id": mem.id,
        "title": mem.title,
        "person_name": mem.person_name,
        "date": mem.date,
        "tags": [t.strip() for t in (mem.tags or "").split(",") if t.strip()],
        "description": mem.description,
        "transcription": mem.transcription,
        "is_favorite": mem.is_favorite,
        "created_at": mem.created_at.isoformat() if mem.created_at else None,
        "updated_at": mem.updated_at.isoformat() if mem.updated_at else None
    }

    md_lines = [
        f"# {mem.title}",
        "",
        f"**Person:** {mem.person_name or 'Not specified'}  ",
        f"**Date:** {mem.date or 'Not recorded'}  ",
        f"**Tags:** {mem.tags or 'None'}  ",
        "",
        "## Story",
        mem.description,
        ""
    ]
    if mem.transcription:
        md_lines.extend([
            "## Audio Recording Transcription",
            mem.transcription,
            ""
        ])

    md_lines.append(f"---\n*Preserved in Echoes Offline Vault on {mem.created_at.strftime('%Y-%m-%d')}*")
    md_content = "\n".join(md_lines)

    return ExportResponse(
        memory_id=mem.id,
        title=mem.title,
        markdown_content=md_content,
        json_data=json_dict
    )

@router.get("/all/json")
def export_all_json(db: Session = Depends(get_db)):
    """Export complete vault database as a downloadable JSON backup."""
    memories = db.query(Memory).all()
    out = []
    for m in memories:
        out.append({
            "id": m.id,
            "title": m.title,
            "person_name": m.person_name,
            "date": m.date,
            "tags": m.tags,
            "description": m.description,
            "transcription": m.transcription,
            "audio_filename": m.audio_filename,
            "is_favorite": m.is_favorite,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })
    json_bytes = json.dumps({"echoes_vault_backup": out, "total_records": len(out)}, indent=2)
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=echoes_vault_backup.json"}
    )

@router.get("/all/markdown")
def export_all_markdown(db: Session = Depends(get_db)):
    """Export complete vault memories as a consolidated Markdown file."""
    memories = db.query(Memory).order_by(Memory.date.asc()).all()
    md_docs = [
        "# Echoes: Family Memory Vault",
        "*Some voices deserve to live forever.*",
        "",
        "---",
        ""
    ]
    for m in memories:
        md_docs.extend([
            f"## {m.title}",
            f"**Recorded For:** {m.person_name or 'Family Archive'} | **Timeframe:** {m.date or 'Unknown'} | **Tags:** `{m.tags or ''}`",
            "",
            m.description,
            ""
        ])
        if m.transcription:
            md_docs.extend([
                "**Spoken Transcript:**",
                f"> {m.transcription}",
                ""
            ])
        md_docs.append("---\n")

    full_md = "\n".join(md_docs)
    return Response(
        content=full_md,
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=echoes_complete_memories.md"}
    )
