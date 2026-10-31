import logging
import json
import requests
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self._cached_available_models: List[str] = []

    def check_health(self) -> Dict[str, Any]:
        """Check if local Ollama daemon is reachable and list installed models."""
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                self._cached_available_models = models
                return {
                    "is_running": True,
                    "models": models,
                    "url": self.base_url
                }
        except Exception as e:
            logger.warning(f"Ollama connection check failed: {e}")
            
        return {
            "is_running": False,
            "models": [],
            "url": self.base_url
        }

    def get_best_available_model(self, requested_model: Optional[str] = None) -> Optional[str]:
        """
        Determine which local model to use.
        Prioritizes:
        1. Requested model if available.
        2. Configured default model (e.g. llama3.2:3b) if available.
        3. Fallback locally installed models (e.g. qwen2.5:3b, gemma2:2b).
        4. Any model currently installed in Ollama.
        """
        health = self.check_health()
        installed = health.get("models", [])
        if not installed:
            return None

        # Clean tags (e.g. 'llama3.2:3b' or 'llama3.2:latest')
        def matches(target: str, installed_name: str) -> bool:
            return (
                target == installed_name
                or installed_name.startswith(f"{target}:")
                or target.startswith(f"{installed_name}:")
                or target.split(":")[0] == installed_name.split(":")[0]
            )

        if requested_model:
            for m in installed:
                if matches(requested_model, m):
                    return m

        # Check configured default
        for m in installed:
            if matches(settings.default_model, m):
                return m

        # Check configured fallbacks
        for fallback in settings.fallback_models:
            for m in installed:
                if matches(fallback, m):
                    return m

        # Return first installed model
        return installed[0]

    def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Execute inference using the local Ollama instance.
        Never calls any remote API.
        """
        best_model = self.get_best_available_model(model)
        
        if not best_model:
            # Check if Ollama is even running
            health = self.check_health()
            if not health["is_running"]:
                error_msg = (
                    f"Local AI inference is offline. Ollama daemon is not responding at {self.base_url}.\n"
                    "To start it locally:\n"
                    "1. Install Ollama from https://ollama.com\n"
                    "2. Run: ollama serve\n"
                    "3. Pull a model: ollama pull llama3.2:3b (or ollama pull qwen2.5:3b)"
                )
            else:
                error_msg = (
                    f"Ollama is running at {self.base_url}, but no compatible local models were found.\n"
                    "Please download a local model using:\n"
                    "  ollama pull llama3.2:3b\n"
                    "or\n"
                    "  ollama pull qwen2.5:3b"
                )
            raise ConnectionError(error_msg)

        payload = {
            "model": best_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        if system:
            payload["system"] = system

        try:
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120
            )
            if resp.status_code == 200:
                result = resp.json()
                return {
                    "text": result.get("response", "").strip(),
                    "model": best_model,
                    "total_duration": result.get("total_duration")
                }
            else:
                raise RuntimeError(
                    f"Ollama returned HTTP {resp.status_code}: {resp.text}"
                )
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to communicate with local Ollama: {str(e)}")

ollama_client = OllamaClient()
