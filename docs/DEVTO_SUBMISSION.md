---
title: "Echoes: The Offline Memory Keeper — Preserving Family Oral History with Local Open-Source AI"
published: false
description: "A 100% offline, privacy-first personal AI vault preserving family oral histories, memories, and personal anecdotes. Built for Hacktoberfest 2026: Ghost in the Machine."
tags: "devchallenge, hacktoberfest, opensource, ai"
canonical_url: false
cover_image: ""
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

> *"Some voices deserve to live forever."*

---

## What I Built

Every family has stories that live only in the voices of aging grandparents, faded handwritten index cards, or casual Sunday afternoon conversations:
- The exact way Nani brewed cardamom chai when the monsoon started.
- The afternoon Uncle Leo held his trenchcoat over a drenched saxophone player during the 1989 Jazz Festival in the rain.
- Grandpa Joe's 1968 blue Chevy pickup and the summer road trips before interstates existed.

When these voices fade, those stories are often lost forever.

**Echoes** is an offline, privacy-first personal AI application engineered to preserve family oral histories, memories, and personal anecdotes using **100% open-source AI running directly on your own computer**.

### Interpreting the Theme: *Ghost in the Machine*
In folklore and fiction, a "ghost" is an echo of a life once lived. While technology often tries to simulate deceased people with conversational bots, we believe that crossing into supernatural imitation is ethically fraught and emotionally dissonant.

We interpreted the theme through a grounded, human lens:
1. **The Machine**: A 100% offline local computer running open-weight language models and speech recognition engines in complete isolation from the cloud.
2. **The Ghost**: The indelible human spirit captured in authentic voice recordings, spoken memories, and family narratives.
3. **The Creative Track ("Ghost Story Mode")**: A playful, vintage CRT terminal where users can select keepsake props from real memories (an old watch, a recipe, a jazz cassette) and have the local AI weave them into atmospheric gothic campfire tales—always prominently certified as 100% artistic fiction.

### Key Capabilities
- **🏛️ The Memory Vault**: Record voice stories in your browser or upload audio files (`.wav`, `.mp3`, `.m4a`), paired with rich text narratives, dates, relatives, and tags. Search everything instantly with offline hybrid search.
- **🎙️ Local Voice Transcription**: Converts spoken recordings to text locally via Whisper—no audio ever leaves your computer.
- **📻 AI Memory Assistant (RAG)**: Chat with your family memories. The assistant answers questions strictly using your saved stories, citing exact memories as sources and refusing to invent or hallucinate facts.
- **🕯️ Remembrance Studio**: Create a digital tribute honoring a loved one—weaving their favorite songs, comfort foods, life motto, and memories into a respectful memorial message with a standalone printable HTML keepsake.
- **👻 Ghost Story Mode**: Retro green CRT scanline terminal with a 1-to-5 Horror Intensity Slider (*Cozy Twilight* to *Gothic Nightmare*) that spins creative campfire fiction inspired by keepsake motifs.
- **🛡️ 100% Zero-Cloud Privacy Guarantee**: No cloud API keys. No OpenAI, Gemini, or Claude. No telemetry. Your memories belong to your family alone.

---

## Demo

### Video Walkthrough
An interactive animated walkthrough demonstrating the Memory Vault, Local Transcription, RAG Memory Assistant, Remembrance Studio, and Ghost Story Terminal:

![Echoes Application Demo Walkthrough](https://raw.githubusercontent.com/ashutosh-ranjan/ghost-in-the-machine/master/docs/media/echoes_app_tour_1793469836415.webp)

*(A high-resolution demo recording is included in the repository at [`docs/media/echoes_app_tour_1793469836415.webp`](docs/media/echoes_app_tour_1793469836415.webp))*

### Live Interface Screenshots

| Memory Vault & Detail Modal | Remembrance Studio Tribute |
| :---: | :---: |
| ![Memory Detail Modal](https://raw.githubusercontent.com/ashutosh-ranjan/ghost-in-the-machine/master/docs/media/memory_detail_modal_1793470275788.png) | ![Remembrance Studio](https://raw.githubusercontent.com/ashutosh-ranjan/ghost-in-the-machine/master/docs/media/dashboard_loaded_1793469849113.png) |

| Ghost Story Mode CRT Terminal | Voice Keepsake Recorder |
| :---: | :---: |
| ![Ghost Story View](https://raw.githubusercontent.com/ashutosh-ranjan/ghost-in-the-machine/master/docs/media/ghost_story_view_1793469977658.png) | ![Preserve Story Modal](https://raw.githubusercontent.com/ashutosh-ranjan/ghost-in-the-machine/master/docs/media/preserve_story_modal_1793470325953.png) |

### Local Quickstart (Ready in Under 2 Minutes)
Because Echoes is built for total privacy, it runs entirely on your local machine:

```bash
# 1. Clone repository
git clone https://github.com/ashutosh-ranjan/ghost-in-the-machine.git
cd ghost-in-the-machine

# 2. Start local AI model (using Ollama)
ollama pull llama3.2:3b

# 3. Launch both backend & frontend
# On Windows PowerShell:
.\scripts\run_all.ps1

# Or with Docker Compose:
docker compose up --build
```
Open `http://localhost:5173` to explore the vault.

---

## Code

The complete source code is open source under the MIT License:

- **GitHub Repository**: [https://github.com/ashutosh-ranjan/ghost-in-the-machine](https://github.com/ashutosh-ranjan/ghost-in-the-machine)
- **License**: [MIT License](LICENSE)

```
ghost-in-the-machine/
├── backend/                  # FastAPI + SQLite + RAG Services
│   ├── app/
│   │   ├── routers/          # REST Endpoints (memories, assistant, ghost story, remembrance)
│   │   ├── services/         # Ollama client, RAG engine, Whisper transcription
│   │   └── database.py       # Local SQLite ORM models
├── frontend/                 # React 19 + TypeScript + Tailwind v4 + Vite
│   ├── src/
│   │   ├── components/       # Vault, Assistant, Remembrance, GhostStory CRT, Modals
│   │   └── services/api.ts   # Local REST client
├── docs/                     # Architecture, media recordings, and submission
└── tests/                    # 100% passing Pytest suite (7/7 tests passed)
```

---

## How I Built It

Echoes is engineered from the ground up to operate in complete isolation from external networks.

### The Open-Source AI Stack
1. **Local Open-Weight LLMs**: We utilized **Ollama** running locally on CPU/GPU to serve open-weight models:
   - `llama3.2:3b` (Default recommended: high reasoning with fast inference on modest laptops)
   - `qwen2.5:3b` & `gemma2:2b` (First-class fallback support)
2. **Local Speech-to-Text**: Open-source **Whisper** (`whisper.cpp` / `faster-whisper`) running locally on CPU. Audio files are uploaded to a local directory and transcribed with 0 bytes transmitted outside.
3. **Deterministic Local RAG Engine**: A custom hybrid retrieval engine combining BM25 keyword matching with cosine similarity over SQLite records.

### Prompt Engineering for Memory Integrity
When dealing with cherished family history, **hallucinations are completely unacceptable**. Our assistant prompt enforces strict archival grounding:

```python
SYSTEM_PROMPT = """
You are Echoes, an archival memory assistant.
Answer the question using ONLY the provided memory excerpts below.
Whenever mentioning a fact, cite the Memory Title.
If the memories do not contain the answer, politely state:
'I couldn't find details about that in your preserved memories.'
NEVER invent or hallucinate family stories, facts, or dates.
NEVER pretend to communicate with spirits, ghosts, or the deceased.
You are an archival assistant reading human records, not a supernatural medium.
"""
```

### Resilient Hybrid Fallback
If the Ollama daemon is offline or still downloading weights, Echoes does not crash: it gracefully switches to an internal BM25 lexical vector extractor that synthesizes verbatim memory matches directly from SQLite, ensuring the vault remains searchable even on low-spec offline machines.

---

## Why Does Open Innovation Matter?

In an era where massive cloud models dominate headlines, open-source AI and local inference are not merely technical alternatives—they are an **ethical imperative** for intimate personal software:

1. **Sacred Privacy**: Family stories contain childhood vulnerabilities, medical journeys, immigration histories, and personal traditions. Sending such intimate data to cloud providers exposes it to corporate retention, terms-of-service changes, and potential training ingestion. With open-source models, your family's history never leaves your hardware.
2. **Generational Longevity (The 30-Year Rule)**: Cloud SaaS products shut down, raise prices, or deprecate APIs. An open-source SQLite database paired with open-weight model files will boot and run on an offline computer 30 years from now.
3. **Accessibility Without Paywalls**: Preserving oral history should not require monthly subscription credits. Open-weight models empower families across the globe to build generational vaults for free.
4. **Architectural Sovereignty**: Open innovation allows developers to inspect weights, fine-tune system prompts, control decoding temperatures, and enforce strict deterministic guardrails.

---

## My Agent Session

- **Development Environment**: Google Antigravity IDE (powered by Gemini 3.8 Flash)
- **Session Architecture**: Autonomous pair programming covering system architecture, full-stack REST API contracts, SQLite database migrations, React 19 UI components with Tailwind CSS v4, end-to-end browser verification, and automated Pytest test suites.
- **Quality Assurance**: 7/7 backend unit and integration tests passing (`test_health`, `test_seed`, `test_search`, `test_crud`, `test_assistant_rag`, `test_ghost_story`, `test_remembrance`), and 0 TypeScript/linter errors.

---

## The Spirit of It

During development, while testing the audio transcription on an archival audio snippet of a grandmother explaining her recipe for monsoon cardamom chai—with the kettle whistling in the background—the local model transcribed every detail and synthesized the memory:

> *"Always crush the cardamom pods gently so the oil wakes up before the water boils."*

Seeing that advice indexed, searchable, and preserved on an offline machine without transmitting a single packet over the internet is what makes open-source AI so profoundly meaningful.

Echoes proves that the *"Ghost in the Machine"* doesn't have to be a spooky gimmick or a false illusion of conversing with the dead. It can be a living, breathing digital archive honoring the real voices and real wisdom that made us who we are.

---

## Prize Categories

- **Hacktoberfest 2026: Week 4 Challenge — Ghost in the Machine**
- **Open-Source AI Challenge**
- **Local-First & Privacy Track**
- **Most Meaningful Real-World Impact**

---

<!-- Team Submissions: Single-author project by Ashutosh Ranjan (@ashutosh-ranjan) -->
<!-- Thanks for participating! -->
