import React, { useState } from 'react';
import {
  Ghost,
  Terminal,
  Skull,
  Flame,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Sliders,
  Moon,
  Wind
} from 'lucide-react';
import { Memory, GhostStory } from '../types';
import { generateGhostStory } from '../services/api';

interface GhostStoryViewProps {
  memories: Memory[];
}

const INTENSITY_LABELS: Record<number, { name: string; desc: string; color: string }> = {
  1: {
    name: 'Cozy Twilight',
    desc: 'Mild mystery, creaking floorboards, warm autumn dusk, nostalgic shadows.',
    color: 'text-emerald-400'
  },
  2: {
    name: 'Eerie Whispers',
    desc: 'Flickering candlelight, sudden drafts, tick of an antique pendulum.',
    color: 'text-amber-400'
  },
  3: {
    name: 'Midnight Haunting',
    desc: 'Classic gothic ghost story, phantom footsteps, stormy night, suspenseful chill.',
    color: 'text-orange-400'
  },
  4: {
    name: 'Dark Apparition',
    desc: 'High dread, cold spots, shadows stretching impossibly, psychological terror.',
    color: 'text-purple-400'
  },
  5: {
    name: 'Gothic Nightmare',
    desc: 'Heart-pounding dread, uncanny spectral unraveling, bone-chilling supernatural intensity.',
    color: 'text-rose-500'
  }
};

const MOODS = [
  { id: 'midnight_storm', label: 'Midnight Thunderstorm', icon: Wind },
  { id: 'abandoned_attic', label: 'Dusty Attic & Antique Radio', icon: Moon },
  { id: 'winter_cabin', label: 'Snowbound Cabin in Pines', icon: Flame },
  { id: 'foggy_crossroads', label: 'Autumn Twilight Fog', icon: Skull }
];

export const GhostStoryView: React.FC<GhostStoryViewProps> = ({ memories }) => {
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [horrorIntensity, setHorrorIntensity] = useState<number>(3);
  const [selectedMood, setSelectedMood] = useState<string>('midnight_storm');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStory, setCurrentStory] = useState<GhostStory | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const handleToggleMemory = (id: string) => {
    setSelectedMemoryIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedMemoryIds.length === 0) {
      alert('Please select at least one memory to serve as inspirational motifs.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateGhostStory(
        selectedMemoryIds,
        horrorIntensity,
        selectedMood
      );
      setCurrentStory(res);
    } catch (err: any) {
      alert(`Ghost story error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!currentStory) return;
    navigator.clipboard.writeText(
      `# ${currentStory.title}\n\n${currentStory.content}\n\n---\n${currentStory.disclaimer}`
    );
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      {/* Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="leading-snug">
          <strong className="font-semibold text-amber-300">ARTISTIC CREATIVE TRACK:</strong>{' '}
          Ghost Story Mode weaves props, artifacts, and atmosphere from your memories into fictional gothic campfire fiction. Echoes never claims real spirits or spirit communication.
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-3xl bg-[#12131d] border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Ghost className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Ghost in the Machine</h2>
              <p className="text-xs text-zinc-400">Configure horror intensity &amp; motifs</p>
            </div>
          </div>

          {/* Memory Motif Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              1. Select Memory Motifs ({selectedMemoryIds.length} chosen)
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              {memories.length === 0 ? (
                <p className="text-xs text-zinc-500 p-2">
                  No memories in vault. Please add a memory first.
                </p>
              ) : (
                memories.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-800 cursor-pointer text-xs text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemoryIds.includes(m.id)}
                      onChange={() => handleToggleMemory(m.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-amber-500"
                    />
                    <span className="truncate">{m.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Horror Intensity Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-300 uppercase tracking-wider">
                2. Horror Intensity
              </span>
              <span className={`font-mono font-bold ${INTENSITY_LABELS[horrorIntensity].color}`}>
                Level {horrorIntensity}/5 &bull; {INTENSITY_LABELS[horrorIntensity].name}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={horrorIntensity}
              onChange={(e) => setHorrorIntensity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-400 mt-1 italic">
              {INTENSITY_LABELS[horrorIntensity].desc}
            </p>
          </div>

          {/* Atmosphere Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              3. Atmosphere &amp; Setting
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/50 text-purple-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span className="truncate">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedMemoryIds.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Skull className="w-4 h-4" />
            <span>{isGenerating ? 'Channeling Gothic Tale...' : 'Generate Spooky Tale'}</span>
          </button>
        </div>

        {/* Right CRT Terminal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#090a10] border border-zinc-800 shadow-2xl relative overflow-hidden crt-scanlines">
          {/* Terminal Title Bar */}
          <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#0e0f17] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                ghost-terminal://echoes-machine-v1.0
              </span>
            </div>

            {currentStory && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-300 font-mono"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tale</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Terminal Screen Body */}
          <div className="p-6 md:p-8 font-mono text-xs md:text-sm text-emerald-300 leading-relaxed overflow-y-auto max-h-[520px] space-y-4">
            {isGenerating ? (
              <div className="space-y-3 py-16 text-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto">
                  <Ghost className="w-5 h-5 animate-bounce" />
                </div>
                <p className="text-amber-300 font-mono text-xs">
                  &gt; [SYSTEM]: Inverting memories into gothic motifs...
                </p>
                <p className="text-zinc-500 font-mono text-[11px]">
                  Simulating rain-streaked attics, clock chimes, and creaking timber...
                </p>
              </div>
            ) : currentStory ? (
              <div className="space-y-4">
                <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[10px] uppercase font-mono tracking-widest text-center">
                  &#9888; FICTIONAL GOTHIC TALE &bull; LEVEL {currentStory.horror_intensity} INTENSITY
                </div>

                <h3 className="font-heading text-lg md:text-xl font-bold text-amber-300 border-b border-zinc-800 pb-2">
                  {currentStory.title}
                </h3>

                <div className="text-zinc-300 whitespace-pre-line font-serif leading-relaxed text-sm">
                  {currentStory.content}
                </div>

                <div className="pt-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono">
                  &gt; Motifs synthesized: {currentStory.inspired_by_memories.join(', ')}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-zinc-500">
                <Terminal className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                <p className="font-mono text-xs">
                  &gt; Awaiting prompt. Select memories and launch generator.
                </p>
                <p className="text-[11px] opacity-70">
                  The machine transforms keepsakes into atmospheric ghost fiction.
                </p>
              </div>
            )}
          </div>

          {/* Terminal Status Bar */}
          <div className="px-5 py-2.5 border-t border-zinc-800/80 bg-[#0e0f17] flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>OFFLINE LOCAL INFERENCE</span>
            <span>NO SPIRIT MEDIUMSHIP &bull; ARTISTIC TALES ONLY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
