export interface Memory {
  id: string;
  title: string;
  description: string;
  transcription?: string | null;
  date?: string | null;
  tags?: string | null;
  person_name?: string | null;
  audio_filename?: string | null;
  audio_duration?: number | null;
  image_filename?: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryCreateInput {
  title: string;
  description: string;
  transcription?: string;
  date?: string;
  tags?: string;
  person_name?: string;
  is_favorite?: boolean;
}

export interface SourceCitation {
  id: string;
  title: string;
  person_name?: string | null;
  snippet: string;
  relevance_score: number;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  has_vault_context?: boolean;
  model_used?: string;
  created_at?: string;
}

export interface RemembranceProfile {
  id?: string;
  person_name: string;
  relationship?: string;
  birth_date?: string;
  passing_date?: string;
  biography?: string;
  favorite_food?: string;
  favorite_music?: string;
  favorite_quote?: string;
  tribute_message?: string;
  photo_filename?: string;
  created_at?: string;
}

export interface GhostStory {
  id?: string;
  title: string;
  content: string;
  horror_intensity: number;
  inspired_by_memories: string[];
  disclaimer: string;
  model_used?: string;
  created_at?: string;
}

export interface HealthStatus {
  status: string;
  app_name: string;
  version: string;
  database_ok: boolean;
  ollama_ok: boolean;
  ollama_url: string;
  active_model: string;
  available_models: string[];
  whisper_available: boolean;
  offline_mode_enforced: boolean;
  total_memories: number;
}
