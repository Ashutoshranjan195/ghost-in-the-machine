import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  Square,
  Upload,
  Calendar,
  User,
  Tag,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Memory, MemoryCreateInput } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemoryCreateInput, audioFile?: File) => Promise<void>;
  initialData?: Memory | null;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [personName, setPersonName] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Audio file upload & live recording
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDate(initialData.date || '');
      setPersonName(initialData.person_name || '');
      setTags(initialData.tags || '');
      setIsFavorite(initialData.is_favorite || false);
      setAudioFile(null);
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setPersonName('');
      setTags('');
      setIsFavorite(false);
      setAudioFile(null);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // Handle live microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([audioBlob], `recording_${Date.now()}.webm`, {
          type: 'audio/webm'
        });
        setAudioFile(recordedFile);
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setErrorMsg('Microphone access denied or unsupported in this browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and Story Narrative are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim(),
          date: date.trim() || undefined,
          person_name: personName.trim() || undefined,
          tags: tags.trim() || undefined,
          is_favorite: isFavorite
        },
        audioFile || undefined
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save memory.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#131420] border border-white/10 shadow-2xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg md:text-xl font-bold text-white">
                {initialData ? 'Edit Memory' : 'Preserve a Family Story'}
              </h2>
              <p className="text-xs text-zinc-400">
                Stored permanently on your local device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Memory Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Grandpa's 1968 Blue Chevy Truck"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Person & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Relative / Person Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Grandpa Joe"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Approximate Date or Era
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Summer 1978 or July 1978"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* Narrative Story */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Story Narrative &amp; Details *
            </label>
            <textarea
              rows={5}
              placeholder="Record the anecdote, dialogue, sensory memories (sounds, aromas, weather), and life lessons passed down..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs leading-relaxed text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tags (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="summer, truck, roadtrip, recipes"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Audio Recording or Upload */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/5 space-y-3">
            <span className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Spoken Audio Keepsake (Optional)
            </span>

            <div className="flex flex-wrap items-center gap-3">
              {/* Record Mic */}
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 text-purple-300 text-xs font-medium transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-purple-400" />
                  <span>Record Voice in Browser</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              {/* Upload file */}
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>

              {audioFile && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[180px]">{audioFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setAudioFile(null)}
                    className="text-zinc-500 hover:text-white ml-1 text-xs"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-0"
              />
              <span>Mark as Favorite Keeper</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Preserving...' : initialData ? 'Save Changes' : 'Preserve Memory'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
