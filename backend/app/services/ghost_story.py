import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Memory, GhostStory
from app.services.ollama_client import ollama_client

logger = logging.getLogger(__name__)

INTENSITY_DESCRIPTIONS = {
    1: "Cozy Twilight: Gentle mystery, wistful nostalgia, creaking floorboards, warm shadows, no violence.",
    2: "Eerie Whispers: Flickering candlelight, unexplained wind, tick of an antique clock, uncanny atmospheric tension.",
    3: "Midnight Haunting: Classic gothic ghost story, phantom footsteps, lingering silhouettes, stormy night, suspenseful chill.",
    4: "Dark Apparition: High dread, cold spots, shadows stretching impossibly, eerie music playing from empty rooms, psychological terror.",
    5: "Gothic Nightmare: Heart-pounding terror, spectral unraveling of reality, breathless dread, bone-chilling supernatural intensity."
}

class GhostStoryService:
    def generate_story(
        self,
        db: Session,
        memory_ids: List[str],
        intensity: int = 3,
        setting_mood: str = "midnight_storm"
    ) -> Dict[str, Any]:
        """
        Generate a fictional spooky story inspired by selected memory motifs.
        Enforces clear fictional attribution and never claims real spirit contact.
        """
        intensity = max(1, min(5, intensity))
        memories = db.query(Memory).filter(Memory.id.in_(memory_ids)).all()

        if not memories:
            raise ValueError("No valid memories selected to inspire the ghost story.")

        titles = [m.title for m in memories]
        motifs = []
        for m in memories:
            motifs.append(f"- {m.title} (Motifs: {m.tags or 'keepsake, old times'}): {m.description[:200]}")

        motifs_text = "\n".join(motifs)
        intensity_guide = INTENSITY_DESCRIPTIONS.get(intensity, INTENSITY_DESCRIPTIONS[3])

        system_prompt = (
            "You are a master storyteller of gothic fiction, ghost tales, and campfire horror.\n"
            "MANDATORY REQUIREMENT: This is 100% FICTION. It is a creative horror story inspired by old keepsakes, "
            "locations, and artifacts mentioned in preserved memories.\n"
            "STRICT RULES:\n"
            "1. Craft an original, spine-tingling fictional ghost story.\n"
            "2. Never claim real persons are trapped spirits or suffering. Treat family memories as nostalgic creative anchors.\n"
            "3. Weave in the props, artifacts, and atmosphere from the provided memories.\n"
            "4. Match the requested Horror Intensity Level strictly.\n"
            "5. Give your story an eerie, evocative title formatted on the first line as 'TITLE: <Story Title>'."
        )

        user_prompt = (
            f"Write a gothic ghost story inspired by these memory artifacts:\n"
            f"{motifs_text}\n\n"
            f"Setting & Mood: {setting_mood}\n"
            f"Horror Intensity Level ({intensity}/5): {intensity_guide}\n\n"
            f"Write the fictional spooky story now:"
        )

        try:
            inference = ollama_client.generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.8
            )
            raw_text = inference["text"]
            
            # Extract title if model followed format
            title = f"The Legend of {titles[0]}"
            content = raw_text
            lines = raw_text.splitlines()
            if lines and lines[0].startswith("TITLE:"):
                title = lines[0].replace("TITLE:", "").strip()
                content = "\n".join(lines[1:]).strip()
            elif lines and lines[0].startswith("# "):
                title = lines[0].replace("#", "").strip()
                content = "\n".join(lines[1:]).strip()

            # Save to database
            ghost_story = GhostStory(
                title=title,
                content=content,
                horror_intensity=intensity,
                inspired_by_memories=", ".join(titles),
                is_fiction=True
            )
            db.add(ghost_story)
            db.commit()
            db.refresh(ghost_story)

            return {
                "id": ghost_story.id,
                "title": title,
                "content": content,
                "horror_intensity": intensity,
                "inspired_by_memories": titles,
                "disclaimer": (
                    "FICTIONAL STORY ONLY — Generated as an artistic creative homage inspired by memory motifs. "
                    "Echoes never claims real spirits or supernatural communication."
                ),
                "model_used": inference["model"]
            }
        except Exception as e:
            logger.warning(f"Ollama offline ({e}), generating atmospheric offline ghost story.")
            # Offline creative gothic fallback
            fallback_title = f"The Whispers of {titles[0]}"
            fallback_content = (
                f"The grandfather clock in the dim hallway struck midnight, its heavy brass pendulum slicing "
                f"through the silence of an autumn gale. Outside, the rain drummed violently against the rain-streaked "
                f"windowpanes, casting dancing skeletal shadows across the floorboards.\n\n"
                f"In the corner of the attic sat the relics of yesteryear—reminders of '{titles[0]}'. "
                f"They say that memory is an anchor between what was and what might linger. As the lightning "
                f"illuminated the room in a single blinding flash of violet light, an antique radio on the cedar chest "
                f"slowly crackled to life on its own. Through the sea of static came a melody from fifty winters ago, "
                f"drifting like cold mist down the stairs...\n\n"
                f"A solitary rocking chair in the parlor began to sway, rhythmic and deliberate, as if an unseen reader "
                f"had just paused their book to listen to the storm.\n\n"
                f"*(Note: Generated via local atmospheric generator. Start local Ollama for dynamic neural story generation.)*"
            )
            ghost_story = GhostStory(
                title=fallback_title,
                content=fallback_content,
                horror_intensity=intensity,
                inspired_by_memories=", ".join(titles),
                is_fiction=True
            )
            db.add(ghost_story)
            db.commit()
            db.refresh(ghost_story)

            return {
                "id": ghost_story.id,
                "title": fallback_title,
                "content": fallback_content,
                "horror_intensity": intensity,
                "inspired_by_memories": titles,
                "disclaimer": (
                    "FICTIONAL STORY ONLY — Generated as an artistic creative homage inspired by memory motifs. "
                    "Echoes never claims real spirits or supernatural communication."
                ),
                "model_used": "local-gothic-engine"
            }

ghost_story_service = GhostStoryService()
