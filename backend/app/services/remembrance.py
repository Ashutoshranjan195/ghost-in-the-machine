import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models import Memory
from app.services.ollama_client import ollama_client

logger = logging.getLogger(__name__)

class RemembranceService:
    def generate_tribute(
        self,
        db: Session,
        person_name: str,
        relationship: Optional[str] = None,
        birth_date: Optional[str] = None,
        passing_date: Optional[str] = None,
        biography: Optional[str] = None,
        favorite_food: Optional[str] = None,
        favorite_music: Optional[str] = None,
        favorite_quote: Optional[str] = None,
        selected_memory_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize a respectful, dignified, and loving remembrance tribute.
        """
        memory_excerpts = []
        if selected_memory_ids:
            memories = db.query(Memory).filter(Memory.id.in_(selected_memory_ids)).all()
            for m in memories:
                memory_excerpts.append(f"- \"{m.title}\": {m.description[:180]}")

        memories_text = "\n".join(memory_excerpts) if memory_excerpts else "No specific vault memories linked."

        system_prompt = (
            "You are a compassionate writer specializing in family tributes, eulogies, and remembrance memoirs. "
            "Your tone is warm, deeply respectful, poetic, and comforting.\n"
            "STRICT RULES:\n"
            "1. Honor the person's life, warmth, and the joy they brought.\n"
            "2. Seamlessly weave in their cherished loves: their favorite foods, music, quotes, and memories.\n"
            "3. Do not invent supernatural claims or speak from beyond the grave. Focus on legacy, love, and living memory.\n"
            "4. Keep it between 3 to 5 heartfelt paragraphs."
        )

        user_prompt = (
            f"Please write a beautiful remembrance tribute for:\n"
            f"Name: {person_name}\n"
            f"Relationship: {relationship or 'Beloved Family Member'}\n"
            f"Life Years: {birth_date or '?'} — {passing_date or 'Present'}\n"
            f"Biography: {biography or 'A life filled with kindness and quiet grace.'}\n"
            f"Favorite Comfort Food: {favorite_food or 'Home-cooked warmth'}\n"
            f"Favorite Music: {favorite_music or 'Soft melodies of their era'}\n"
            f"Words They Lived By: \"{favorite_quote or 'Kindness costs nothing.'}\"\n"
            f"Cherished Memories from Vault:\n{memories_text}\n\n"
            f"Write the tribute message now:"
        )

        suggested_title = f"In Loving Memory of {person_name}"

        try:
            inference = ollama_client.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.5
            )
            return {
                "tribute_message": inference["text"],
                "suggested_title": suggested_title,
                "model_used": inference["model"]
            }
        except Exception as e:
            logger.warning(f"Ollama offline ({e}), generating thoughtful offline remembrance tribute.")
            offline_tribute = (
                f"We gather in quiet reverence to honor the life and gentle spirit of {person_name} "
                f"({birth_date or 'Cherished'} — {passing_date or 'Forever Remembered'}).\n\n"
                f"{biography or 'A presence that brought comfort to everyone who walked through their door, ' + person_name + ' left an indelible mark on our hearts.'}\n\n"
                f"To remember them is to recall the small, beautiful textures of their days—the warmth of {favorite_food or 'their favorite meals shared around the table'}, "
                f"and the familiar comfort of {favorite_music or 'songs that filled the afternoon air'}. "
                f"They taught us that life's truest wealth is found not in grand triumphs, but in the quiet kindness we leave behind in the hearts of others.\n\n"
                f"As their favorite words reminded us: \"{favorite_quote or 'Some voices deserve to live forever.'}\" "
                f"Though the years move forward, their love remains an unshakeable compass in our lives."
            )
            return {
                "tribute_message": offline_tribute,
                "suggested_title": suggested_title,
                "model_used": "offline-tribute-engine"
            }

    def generate_printable_html(self, profile_data: Dict[str, Any]) -> str:
        """
        Generate a standalone, self-contained printable HTML page with candlelit midnight styling.
        """
        name = profile_data.get("person_name", "Beloved One")
        relationship = profile_data.get("relationship", "Family Member")
        birth = profile_data.get("birth_date", "")
        passing = profile_data.get("passing_date", "")
        tribute = profile_data.get("tribute_message", "").replace("\n", "<br/><br/>")
        food = profile_data.get("favorite_food", "")
        music = profile_data.get("favorite_music", "")
        quote = profile_data.get("favorite_quote", "")
        photo_url = profile_data.get("photo_url", "")

        photo_html = ""
        if photo_url:
            photo_html = f'<div class="photo-frame"><img src="{photo_url}" alt="{name}"/></div>'

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Remembrance: {name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
  body {{
    background: #0f1015;
    color: #e2e4ec;
    font-family: 'Lora', serif;
    margin: 0;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
  }}
  .card {{
    max-width: 800px;
    width: 100%;
    background: #171822;
    border: 1px solid #323547;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    position: relative;
  }}
  .candle-glow {{
    text-align: center;
    font-size: 32px;
    margin-bottom: 8px;
  }}
  h1 {{
    font-family: 'Cinzel', serif;
    color: #f59e0b;
    text-align: center;
    margin: 0 0 8px 0;
    font-size: 32px;
    letter-spacing: 1px;
  }}
  .subtitle {{
    text-align: center;
    color: #94a3b8;
    font-size: 16px;
    margin-bottom: 28px;
  }}
  .photo-frame {{
    text-align: center;
    margin-bottom: 32px;
  }}
  .photo-frame img {{
    max-width: 240px;
    max-height: 240px;
    border-radius: 50%;
    border: 3px solid #d97706;
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
  }}
  .quote-box {{
    background: #1f2130;
    border-left: 4px solid #f59e0b;
    padding: 16px 24px;
    font-style: italic;
    color: #fbbf24;
    margin-bottom: 32px;
    border-radius: 0 8px 8px 0;
  }}
  .tribute-text {{
    font-size: 17px;
    line-height: 1.8;
    color: #cbd5e1;
    margin-bottom: 32px;
  }}
  .details-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: #13141c;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #272a3a;
  }}
  .detail-item strong {{
    color: #f59e0b;
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }}
  .footer {{
    text-align: center;
    color: #64748b;
    font-size: 12px;
    margin-top: 40px;
    border-top: 1px solid #272a3a;
    padding-top: 20px;
  }}
  @media print {{
    body {{ background: #fff; color: #111; }}
    .card {{ border: none; box-shadow: none; background: #fff; color: #111; padding: 0; }}
    h1 {{ color: #b45309; }}
    .quote-box {{ background: #fef3c7; color: #92400e; border-color: #d97706; }}
    .details-grid {{ background: #f8fafc; border: 1px solid #e2e8f0; }}
    .tribute-text {{ color: #1f2937; }}
  }}
</style>
</head>
<body>
<div class="card">
  <div class="candle-glow">🕯️</div>
  <h1>{name}</h1>
  <div class="subtitle">{relationship} &bull; {birth} {f"— {passing}" if passing else ""}</div>
  {photo_html}
  {f'<div class="quote-box">"{quote}"</div>' if quote else ""}
  <div class="tribute-text">{tribute}</div>
  <div class="details-grid">
    {f'<div class="detail-item"><strong>Comfort Dish</strong>{food}</div>' if food else ""}
    {f'<div class="detail-item"><strong>Beloved Melody</strong>{music}</div>' if music else ""}
  </div>
  <div class="footer">
    Preserved with Echoes &bull; The Offline Memory Keeper &bull; "Some voices deserve to live forever."
  </div>
</div>
</body>
</html>"""
        return html

remembrance_service = RemembranceService()
