import os
import wave
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class AudioTranscriptionService:
    def __init__(self):
        self._whisper_model = None
        self._whisper_type = None

    def _get_whisper_engine(self):
        """Lazy load faster-whisper or openai-whisper if installed locally."""
        if self._whisper_model is not None:
            return self._whisper_model, self._whisper_type

        # 1. Try faster-whisper
        try:
            from faster_whisper import WhisperModel
            logger.info("Initializing local faster-whisper model (base)...")
            self._whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
            self._whisper_type = "faster-whisper"
            return self._whisper_model, self._whisper_type
        except Exception as e:
            logger.info(f"faster-whisper not available: {e}")

        # 2. Try openai-whisper
        try:
            import whisper
            logger.info("Initializing local whisper model (base)...")
            self._whisper_model = whisper.load_model("base")
            self._whisper_type = "whisper"
            return self._whisper_model, self._whisper_type
        except Exception as e:
            logger.info(f"openai-whisper not available: {e}")

        return None, None

    def get_audio_duration(self, file_path: Path) -> Optional[float]:
        """Estimate or read audio duration in seconds."""
        try:
            if file_path.suffix.lower() == ".wav":
                with wave.open(str(file_path), "rb") as wf:
                    frames = wf.getnframes()
                    rate = wf.getframerate()
                    if rate > 0:
                        return round(frames / float(rate), 2)
        except Exception as e:
            logger.debug(f"Could not read wav header: {e}")
        return None

    def transcribe_audio(self, file_path: Path) -> Dict[str, Any]:
        """
        Transcribe audio using local open-source Whisper.
        If Whisper is not yet installed, provide an editable draft placeholder
        with clear instructions so the user can easily review and edit.
        """
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found at: {file_path}")

        duration = self.get_audio_duration(file_path)
        engine, engine_type = self._get_whisper_engine()

        if engine and engine_type == "faster-whisper":
            try:
                segments, info = engine.transcribe(str(file_path), beam_size=5)
                full_text = " ".join([seg.text.strip() for seg in segments])
                return {
                    "text": full_text,
                    "engine": "faster-whisper",
                    "language": info.language,
                    "duration": duration or round(info.duration, 2),
                    "status": "success"
                }
            except Exception as e:
                logger.error(f"Error during faster-whisper transcription: {e}")

        if engine and engine_type == "whisper":
            try:
                result = engine.transcribe(str(file_path))
                return {
                    "text": result.get("text", "").strip(),
                    "engine": "whisper",
                    "language": result.get("language", "en"),
                    "duration": duration,
                    "status": "success"
                }
            except Exception as e:
                logger.error(f"Error during whisper transcription: {e}")

        # Fallback when Whisper binaries are not yet installed
        filename = file_path.name
        draft_text = (
            f"[Voice Recording: {filename}]\n"
            f"Local Whisper model is not yet compiled on this host. "
            f"You can review this recording in the audio player and type or paste "
            f"your transcribed memories here, or run 'pip install faster-whisper' to enable automatic voice-to-text."
        )
        return {
            "text": draft_text,
            "engine": "manual-review-fallback",
            "language": "en",
            "duration": duration or 0.0,
            "status": "manual_review_needed"
        }

transcription_service = AudioTranscriptionService()
