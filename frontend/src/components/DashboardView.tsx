import React from 'react';
import {
  Flame,
  Sparkles,
  Radio,
  Heart,
  Ghost,
  Mic,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Clock,
  User
} from 'lucide-react';
import { HealthStatus, Memory } from '../types';

interface DashboardViewProps {
  health: HealthStatus | null;
  memories: Memory[];
  onNavigate: (tab: string) => void;
  onSelectMemory: (mem: Memory) => void;
  onOpenCreateModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  health,
  memories,
  onNavigate,
  onSelectMemory,
  onOpenCreateModal
}) => {
  const audioCount = memories.filter((m) => m.audio_filename).length;
  const recentMemories = memories.slice(0, 3);

  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/10 via-[#141522] to-[#0d0e16] p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-4">
            <Flame className="w-3.5 h-3.5 text-amber-400 candle-flame" />
            <span>Hacktoberfest 2026 &bull; Ghost in the Machine</span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Some voices deserve to <span className="text-amber-400 italic">live forever</span>.
          </h1>

          <p className="mt-4 text-zinc-300 text-base md:text-lg leading-relaxed">
            Echoes is a privacy-first family memory vault. Preserve spoken stories, cherished recipes, and personal histories locally on your machine using open-source AI. No telemetry, no paid APIs, no clouds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Preserve a Memory</span>
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 font-medium text-sm transition-all"
            >
              <Radio className="w-4 h-4 text-purple-400" />
              <span>Ask the Memory Assistant</span>
            </button>
            <button
              onClick={() => onNavigate('remembrance')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 font-medium text-sm transition-all"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Remembrance Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model & Privacy Status Banner */}
      <div className={`rounded-2xl p-4 border transition-all ${
        health?.ollama_ok
          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
          : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${health?.ollama_ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">
                {health?.ollama_ok ? (
                  <span>Local Open-Source AI Active &bull; <span className="font-mono">{health.active_model}</span></span>
                ) : (
                  <span>Local AI Daemon Notice</span>
                )}
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {health?.ollama_ok
                  ? `Inference running locally via Ollama (${health.ollama_url}). All memories remain strictly on your device.`
                  : "Ollama daemon is currently offline. High-accuracy local BM25 vault search is active. To enable neural RAG: start Ollama (`ollama serve`)."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              Configure AI Models
            </button>
          </div>
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#13141f] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Total Memories</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-white">{memories.length}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Preserved stories & keepsakes</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#13141f] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Audio Stories</span>
            <Mic className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-white">{audioCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Local voice recordings saved</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#13141f] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Active Model</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-mono font-bold text-white truncate">
            {health?.active_model || 'Local Search'}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Open-weight local inference</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#13141f] border border-white/5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase font-mono tracking-wider">Privacy Engine</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-mono font-bold text-emerald-400">100% Offline</div>
          <p className="text-[11px] text-zinc-400 mt-1">Zero external API dependencies</p>
        </div>
      </div>

      {/* Feature Navigation Pillars */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-white mb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('vault')}
            className="group cursor-pointer p-6 rounded-2xl bg-[#13141f] border border-white/5 hover:border-amber-500/40 hover:bg-[#181927] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-white text-base group-hover:text-amber-300 transition-colors">
              Memory Vault
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Store narratives with dates, tags, and relatives. Upload audio notes and preserve precious family keepsakes.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 font-medium">
              <span>Explore Vault</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('assistant')}
            className="group cursor-pointer p-6 rounded-2xl bg-[#13141f] border border-white/5 hover:border-purple-500/40 hover:bg-[#181927] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-white text-base group-hover:text-purple-300 transition-colors">
              Memory Assistant
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Ask natural questions about family stories. Uses strict local RAG retrieval with citations—never invents facts.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 font-medium">
              <span>Ask Questions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('remembrance')}
            className="group cursor-pointer p-6 rounded-2xl bg-[#13141f] border border-white/5 hover:border-rose-500/40 hover:bg-[#181927] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-white text-base group-hover:text-rose-300 transition-colors">
              Remembrance Studio
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Honor loved ones with dignity. Weave their favorite music, food, and sayings into a printable memorial page.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-rose-400 font-medium">
              <span>Create Memorial</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('ghost')}
            className="group cursor-pointer p-6 rounded-2xl bg-[#13141f] border border-white/5 hover:border-cyan-500/40 hover:bg-[#181927] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
              <Ghost className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">
              Ghost Story Mode
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              The Hacktoberfest creative track. Spin spooky gothic campfire tales inspired by selected memory motifs.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-cyan-400 font-medium">
              <span>Enter Terminal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Memories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-white">Recent Preserved Stories</h2>
          <button
            onClick={() => onNavigate('vault')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            View All ({memories.length}) &rarr;
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#13141f] border border-dashed border-zinc-800">
            <p className="text-zinc-400 text-sm">Your vault is currently empty.</p>
            <button
              onClick={onOpenCreateModal}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 transition-colors"
            >
              Preserve your first memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => onSelectMemory(mem)}
                className="group cursor-pointer p-5 rounded-2xl bg-[#13141f] border border-white/5 hover:border-amber-500/30 hover:bg-[#161824] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400/80" />
                      {mem.date || 'Historic memory'}
                    </span>
                    {mem.audio_filename && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px]">
                        <Mic className="w-2.5 h-2.5" /> Audio
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-semibold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                    {mem.title}
                  </h4>

                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                    {mem.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <User className="w-3 h-3 text-zinc-400" />
                    {mem.person_name || 'Family Archive'}
                  </span>
                  <span className="text-amber-400/80 group-hover:text-amber-300 text-[11px] font-medium">
                    Read Story &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
