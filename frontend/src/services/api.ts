import {
  HealthStatus,
  Memory,
  MemoryCreateInput,
  ChatMessage,
  GhostStory,
  RemembranceProfile
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: HTTP ${res.status}`);
  return res.json();
}

export async function fetchMemories(params?: {
  q?: string;
  tag?: string;
  person?: string;
  favorite?: boolean;
}): Promise<{ total: number; items: Memory[] }> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.tag) query.set('tag', params.tag);
  if (params?.person) query.set('person', params.person);
  if (params?.favorite !== undefined) query.set('favorite', String(params.favorite));

  const url = `${API_BASE}/memories${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch memories');
  return res.json();
}

export async function createMemory(payload: MemoryCreateInput): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create memory');
  return res.json();
}

export async function updateMemory(id: string, payload: Partial<MemoryCreateInput>): Promise<Memory> {
  const res = await fetch(`${API_BASE}/memories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update memory');
  return res.json();
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/memories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete memory');
}

export async function uploadAudio(id: string, file: File): Promise<Memory> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/memories/${id}/upload-audio`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload audio');
  return res.json();
}

export async function transcribeAudio(id: string): Promise<{ transcription: string; status: string }> {
  const res = await fetch(`${API_BASE}/memories/${id}/transcribe`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to transcribe audio');
  return res.json();
}

export async function seedSampleMemories(): Promise<{ total: number; items: Memory[] }> {
  const res = await fetch(`${API_BASE}/memories/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed sample memories');
  return res.json();
}

export async function askAssistant(message: string, modelOverride?: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, model_override: modelOverride })
  });
  if (!res.ok) throw new Error('Failed to communicate with assistant');
  const data = await res.json();
  return {
    role: 'assistant',
    content: data.answer,
    sources: data.sources,
    has_vault_context: data.has_vault_context,
    model_used: data.model_used
  };
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE}/assistant/history`);
  if (!res.ok) return [];
  return res.json();
}

export async function clearChatHistory(): Promise<void> {
  await fetch(`${API_BASE}/assistant/history`, { method: 'DELETE' });
}

export async function generateGhostStory(
  memoryIds: string[],
  horrorIntensity: number,
  settingMood: string
): Promise<GhostStory> {
  const res = await fetch(`${API_BASE}/ghost-story/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memory_ids: memoryIds,
      horror_intensity: horrorIntensity,
      setting_mood: settingMood
    })
  });
  if (!res.ok) throw new Error('Failed to generate ghost story');
  return res.json();
}

export async function generateRemembranceTribute(payload: {
  person_name: string;
  relationship?: string;
  birth_date?: string;
  passing_date?: string;
  biography?: string;
  favorite_food?: string;
  favorite_music?: string;
  favorite_quote?: string;
  selected_memory_ids?: string[];
}): Promise<{ tribute_message: string; suggested_title: string; model_used: string }> {
  const res = await fetch(`${API_BASE}/remembrance/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate remembrance tribute');
  return res.json();
}

export async function saveRemembranceProfile(payload: RemembranceProfile): Promise<RemembranceProfile> {
  const res = await fetch(`${API_BASE}/remembrance/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save profile');
  return res.json();
}

export async function fetchRemembranceProfiles(): Promise<RemembranceProfile[]> {
  const res = await fetch(`${API_BASE}/remembrance/profiles`);
  if (!res.ok) return [];
  return res.json();
}

export async function exportMemory(id: string, format: 'markdown' | 'json' = 'markdown'): Promise<{
  memory_id: string;
  title: string;
  markdown_content: string;
  json_data: any;
}> {
  const res = await fetch(`${API_BASE}/export/${id}?format=${format}`);
  if (!res.ok) throw new Error('Failed to export memory');
  return res.json();
}

export async function updateSettings(payload: {
  selected_model?: string;
  ollama_base_url?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
