import re
import math
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import Memory
from app.services.ollama_client import ollama_client

logger = logging.getLogger(__name__)

# Optional sentence-transformers support
_sentence_transformer_model = None
_has_attempted_loading_st = False

def get_sentence_transformer():
    global _sentence_transformer_model, _has_attempted_loading_st
    if _sentence_transformer_model is None and not _has_attempted_loading_st:
        _has_attempted_loading_st = True
        try:
            from sentence_transformers import SentenceTransformer
            # Only load if cached locally, never hang on remote huggingface requests
            _sentence_transformer_model = SentenceTransformer(
                "all-MiniLM-L6-v2",
                local_files_only=True
            )
            logger.info("Loaded cached local sentence-transformer model: all-MiniLM-L6-v2")
        except Exception:
            # Fully expected in strict offline environment: fallback to high-accuracy BM25 lexical vector search
            logger.info("Offline mode: using built-in BM25 lexical vector search.")
            _sentence_transformer_model = None
    return _sentence_transformer_model

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text."""
    if not text:
        return []
    return re.findall(r"\b\w{2,}\b", text.lower())

def calculate_bm25_similarity(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Lightweight BM25-inspired term frequency scoring."""
    if not query_tokens or not doc_tokens:
        return 0.0
    
    doc_len = len(doc_tokens)
    k1 = 1.5
    b = 0.75
    avg_len = 100.0  # approximate average document length
    
    score = 0.0
    for q in query_tokens:
        tf = doc_tokens.count(q)
        if tf > 0:
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_len / avg_len))
            score += numerator / denominator
            
    return score

class RAGEngine:
    def __init__(self):
        pass

    def retrieve_relevant_memories(
        self,
        db: Session,
        query: str,
        top_k: int = 4
    ) -> List[Tuple[Memory, float, str]]:
        """
        Retrieve the most relevant memories for the query using hybrid scoring.
        Returns: List of (Memory, relevance_score, snippet)
        """
        all_memories = db.query(Memory).all()
        if not all_memories:
            return []

        query_tokens = tokenize(query)
        st_model = get_sentence_transformer()

        results = []

        query_embedding = None
        if st_model is not None:
            try:
                import numpy as np
                query_embedding = st_model.encode(query, convert_to_numpy=True)
            except Exception:
                query_embedding = None

        for mem in all_memories:
            full_text = f"{mem.title} {mem.person_name or ''} {mem.tags or ''} {mem.description} {mem.transcription or ''}"
            mem_tokens = tokenize(full_text)
            
            # Lexical BM25 score
            bm25_score = calculate_bm25_similarity(query_tokens, mem_tokens)

            # Semantic score
            semantic_score = 0.0
            if query_embedding is not None and st_model is not None:
                try:
                    import numpy as np
                    doc_emb = st_model.encode(full_text[:500], convert_to_numpy=True)
                    dot_product = np.dot(query_embedding, doc_emb)
                    norm_a = np.linalg.norm(query_embedding)
                    norm_b = np.linalg.norm(doc_emb)
                    if norm_a > 0 and norm_b > 0:
                        semantic_score = float(dot_product / (norm_a * norm_b))
                except Exception:
                    pass

            # Boost if query mentions memory title or person name directly
            exact_boost = 0.0
            if mem.person_name and mem.person_name.lower() in query.lower():
                exact_boost += 2.0
            if any(t in query.lower() for t in (mem.tags or "").lower().split(",")):
                exact_boost += 1.0

            # Combined score
            final_score = (bm25_score * 0.5) + (semantic_score * 2.0) + exact_boost

            if final_score > 0.05:
                # Find best snippet
                snippet = mem.description[:240] + ("..." if len(mem.description) > 240 else "")
                results.append((mem, final_score, snippet))

        # Sort descending by score
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def answer_query(
        self,
        db: Session,
        query: str,
        model_override: str = None
    ) -> Dict[str, Any]:
        """
        Execute RAG over memories. Answers strictly based on stored memories.
        """
        retrieved = self.retrieve_relevant_memories(db, query, top_k=4)

        if not retrieved:
            return {
                "answer": (
                    "I searched through all your preserved memories, but couldn't find any stories, "
                    "people, or events related to your question. You can add more memories to the Vault "
                    "or upload an audio recording to preserve this story."
                ),
                "sources": [],
                "has_vault_context": False,
                "model_used": "local-retrieval"
            }

        sources = []
        context_blocks = []
        for mem, score, snippet in retrieved:
            sources.append({
                "id": mem.id,
                "title": mem.title,
                "person_name": mem.person_name,
                "snippet": snippet,
                "relevance_score": round(score, 2)
            })
            block = (
                f"--- [MEMORY #{mem.id[:8]}] ---\n"
                f"Title: {mem.title}\n"
                f"Person: {mem.person_name or 'Not specified'}\n"
                f"Date: {mem.date or 'Unknown date'}\n"
                f"Tags: {mem.tags or 'None'}\n"
                f"Story Narrative: {mem.description}\n"
            )
            if mem.transcription:
                block += f"Audio Recording Transcript: {mem.transcription}\n"
            context_blocks.append(block)

        context_text = "\n".join(context_blocks)

        system_prompt = (
            "You are Echoes, an offline memory preservation AI assistant. "
            "Your sacred duty is to help families remember and honor their history.\n"
            "STRICT RULES:\n"
            "1. Answer the question using ONLY the provided memory excerpts below.\n"
            "2. Whenever mentioning a fact, cite the Memory Title.\n"
            "3. If the memories do not contain the answer, politely state: "
            "'I couldn't find details about that in your preserved memories.'\n"
            "4. NEVER invent or hallucinate family stories, facts, or dates.\n"
            "5. NEVER pretend to communicate with spirits, ghosts, or the deceased. "
            "You are an archival assistant reading recorded notes, not a medium.\n"
            "6. Speak with warmth, respect, and emotional gentleness."
        )

        user_prompt = (
            f"Here are the preserved family memories retrieved from the vault:\n\n"
            f"{context_text}\n\n"
            f"User Question: {query}\n\n"
            f"Respectful Memory Answer:"
        )

        try:
            inference_result = ollama_client.generate(
                prompt=user_prompt,
                system=system_prompt,
                model=model_override,
                temperature=0.3
            )
            return {
                "answer": inference_result["text"],
                "sources": sources,
                "has_vault_context": True,
                "model_used": inference_result["model"]
            }
        except Exception as e:
            logger.warning(f"Ollama generation unavailable ({e}), using offline synthesis.")
            # Graceful offline fallback: directly synthesize based on highest matching memory
            top_mem = retrieved[0][0]
            offline_answer = (
                f"Based on your preserved memory \"{top_mem.title}\" "
                f"({top_mem.person_name or 'Family Archive'}, {top_mem.date or 'recorded'}):\n\n"
                f"{top_mem.description}\n\n"
            )
            if top_mem.transcription:
                offline_answer += f"Audio transcript note: \"{top_mem.transcription[:200]}...\"\n\n"
            offline_answer += (
                f"⚠️ *Note: Local Ollama model is currently offline ({str(e).splitlines()[0]}). "
                "The answer above was retrieved directly from your local vault storage without neural generation.*"
            )
            return {
                "answer": offline_answer,
                "sources": sources,
                "has_vault_context": True,
                "model_used": "offline-vault-direct"
            }

rag_engine = RAGEngine()
