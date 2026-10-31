# Echoes Technical Architecture

## 1. System Philosophy
Echoes is designed as an **air-gapped, zero-telemetry, local-first** memory preservation platform. All data ingestion, vector indexing, neural inference, and file storage occur strictly on the user's host machine.

```
+-------------------------------------------------------------+
|                      User Browser                           |
|  - React 19 / TypeScript / Vite / Tailwind CSS v4           |
|  - Web Audio MediaRecorder (microphone capture)             |
|  - Local state & UI transitions via Framer Motion           |
+------------------------------+------------------------------+
                               |
                        HTTP / REST APIs
                               |
+------------------------------v------------------------------+
|                     FastAPI Backend                         |
|  - RESTful Endpoints (/api/memories, /api/assistant, etc.)  |
|  - Safe file upload verification & static file serving      |
|  - CORS & threading control                                 |
+---------------+-----------------------------+---------------+
                |                             |
+---------------v---------------+ +-----------v---------------+
|        Local Storage          | |      Local AI Inference    |
|  - SQLite (data/echoes.db)    | |  - Ollama Daemon (:11434) |
|  - Audio files (data/uploads) | |  - Llama 3.2 3B / Qwen 2.5 |
|  - JSON & Markdown Backups    | |  - Whisper / faster-whisper|
+-------------------------------+ +---------------------------+
```

## 2. Hybrid RAG Pipeline
Retrieval Augmented Generation in Echoes uses a two-tier strategy:

1. **BM25 Lexical Matching**: High precision for exact dates ("1978", "Thanksgiving 1994"), specific names ("Uncle Leo", "Savitri"), and unique artifacts ("blue Chevy", "apple cider vinegar").
2. **Cosine Semantic Embedding**: When SentenceTransformers or cached local models are active, dense vector representations provide semantic generalization.
3. **Strict Non-Hallucination Guardrails**: Prompts enforce that answers are derived purely from retrieved memory text. If no matching memories are found, the model politely reports that the information does not exist in the vault.

## 3. Storage Schema
The database uses SQLite with WAL (Write-Ahead Logging) mode and three primary entities:
- `memories`: Stores memory titles, narratives, audio filenames, dates, tags, and whisper transcriptions.
- `remembrance_profiles`: Stores honoree metadata, biographies, favorite foods/songs/quotes, and generated eulogy tributes.
- `ghost_stories`: Stores generated fictional campfire stories with assigned horror intensity levels (1-5) and source memory links.
- `chat_history`: Stores conversational context turns.

## 4. Privacy & Offline Verification
- No third-party network requests are initiated by the backend.
- No analytics or telemetry hooks.
- All models run on local CPU or GPU using Ollama and local PyTorch / Whisper runtimes.
