import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Star,
  Mic,
  Play,
  Pause,
  Download,
  Edit3,
  Trash2,
  FileText,
  Volume2,
  Sparkles,
  Check
} from 'lucide-react';
import { Memory } from '../types';
import { transcribeAudio, updateMemory } from '../services/api';

interface MemoryDetailModalProps {
  memory: Memory | null;
  onClose: () => void;
  onEdit: (mem: Memory) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (mem: Memory) => void;
  onExport: (id: string, format: 'markdown' | 'json') => void;
  onRefreshMemory: (updated: Memory) => void;
}

export const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  memory,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onExport,
  onRefreshMemory
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!memory) return null;

  const audioUrl = memory.audio_filename ? `/uploads/${memory.audio_filename}` : null;

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const res = await transcribeAudio(memory.id);
      const updated = { ...memory, transcription: res.transcription };
      onRefreshMemory(updated);
    } catch (err: any) {
      alert(`Transcription error: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveTranscript = async () => {
    try {
      const updated = await updateMemory(memory.id, { transcription: transcriptDraft });
      onRefreshMemory(updated);
      setIsEditingTranscript(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#131420] border border-white/10 shadow-2xl p-6 md:p-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {memory.date || 'Era unknown'}
              </span>
              {memory.person_name && (
                <span className="flex items-center gap-1 text-amber-300">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  {memory.person_name}
                </span>
              )}
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-white">
              {memory.title}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(memory)}
              className="p-2 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
              title="Toggle favorite"
            >
              <Star
                className={`w-5 h-5 ${
                  memory.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player Card (if audio present) */}
        {audioUrl && (
          <div className="my-5 p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-purple-300 font-mono">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Spoken Keepsake Audio Recording</span>
              </div>
              {!memory.transcription && (
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[11px] font-medium transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}</span>
                </button>
              )}
            </div>

            <audio controls src={audioUrl} className="w-full h-10 rounded-lg filter invert" />
          </div>
        )}

        {/* Narrative Story Section */}
        <div className="my-6 space-y-3">
          <h3 className="font-heading text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Story Narrative
          </h3>
          <div className="p-5 rounded-2xl bg-[#0f1019] border border-white/5 text-zinc-200 text-sm leading-relaxed whitespace-pre-line font-sans">
            {memory.description}
          </div>
        </div>

        {/* Audio Transcription Section */}
        {memory.transcription && (
          <div className="my-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-purple-400" />
                <span>Audio Transcript</span>
              </h3>
              {!isEditingTranscript ? (
                <button
                  onClick={() => {
                    setTranscriptDraft(memory.transcription || '');
                    setIsEditingTranscript(true);
                  }}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Transcript</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingTranscript(false)}
                    className="text-[11px] text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTranscript}
                    className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-amber-500 text-zinc-950 font-medium"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingTranscript ? (
              <textarea
                rows={4}
                value={transcriptDraft}
                onChange={(e) => setTranscriptDraft(e.target.value)}
                className="w-full p-3.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white leading-relaxed focus:outline-none focus:border-amber-500/50"
              />
            ) : (
              <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-800/20 text-purple-200 text-xs leading-relaxed italic">
                "{memory.transcription}"
              </div>
            )}
            {saveSuccess && (
              <p className="text-[11px] text-emerald-400 font-mono">Transcript updated locally!</p>
            )}
          </div>
        )}

        {/* Tags */}
        {memory.tags && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/5">
            <span className="text-xs text-zinc-400 mr-1">Tags:</span>
            {memory.tags.split(',').map((t, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300"
              >
                #{t.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport(memory.id, 'markdown')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={() => onExport(memory.id, 'json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onDelete(memory.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
