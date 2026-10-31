import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Cpu,
  ShieldCheck,
  Download,
  Sparkles,
  RefreshCw,
  HardDrive,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { HealthStatus } from '../types';
import { updateSettings, seedSampleMemories } from '../services/api';

interface SettingsViewProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  onReloadMemories: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshHealth,
  onReloadMemories
}) => {
  const [selectedModel, setSelectedModel] = useState<string>(health?.active_model || 'llama3.2:3b');
  const [ollamaUrl, setOllamaUrl] = useState<string>(health?.ollama_url || 'http://127.0.0.1:11434');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);

  const handleSaveSettings = async () => {
    setIsUpdating(true);
    try {
      await updateSettings({
        selected_model: selectedModel,
        ollama_base_url: ollamaUrl
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
      onRefreshHealth();
    } catch (err: any) {
      alert(`Settings update error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedSampleMemories();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 2500);
      onReloadMemories();
      onRefreshHealth();
    } catch (err: any) {
      alert(`Seeding error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-amber-400" />
          <span>System Settings &bull; Local AI &amp; Privacy</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 mt-1">
          Configure local models, manage offline vault storage, and verify zero-telemetry enforcement.
        </p>
      </div>

      {/* Model Selection Card */}
      <div className="p-6 rounded-3xl bg-[#131420] border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-white">Local LLM Configuration</h2>
              <p className="text-xs text-zinc-400">Select open-weight models pulled into Ollama</p>
            </div>
          </div>

          <button
            onClick={onRefreshHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Daemon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Ollama Host URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Active Model Selection
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {health?.available_models && health.available_models.length > 0 ? (
                health.available_models.map((m) => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m} (Installed locally)
                  </option>
                ))
              ) : (
                <>
                  <option value="llama3.2:3b">llama3.2:3b (Recommended)</option>
                  <option value="qwen2.5:3b">qwen2.5:3b</option>
                  <option value="gemma2:2b">gemma2:2b</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.ollama_ok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>
              {health?.ollama_ok
                ? `Ollama online (${health.available_models.length} models detected)`
                : 'Ollama is unreachable. High-accuracy local BM25 fallback is active.'}
            </span>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            {updateSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>
      </div>

      {/* Vault Storage & Backup Card */}
      <div className="p-6 rounded-3xl bg-[#131420] border border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-white">Vault Data &amp; Backups</h2>
            <p className="text-xs text-zinc-400">Export or seed entire family memories vault</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Download JSON */}
          <a
            href="/api/export/all/json"
            download="echoes_vault_backup.json"
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800 text-xs text-white transition-all text-center"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download Full JSON Backup</span>
          </a>

          {/* Download Markdown */}
          <a
            href="/api/export/all/markdown"
            download="echoes_complete_memories.md"
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800 text-xs text-white transition-all text-center"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Download All as Markdown</span>
          </a>

          {/* Seed Sample Stories */}
          <button
            onClick={handleSeed}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:bg-purple-900/50 text-xs text-purple-200 transition-all text-center"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{seedSuccess ? 'Seeded Successfully!' : 'Seed Sample Memories'}</span>
          </button>
        </div>
      </div>

      {/* Privacy Manifesto Card */}
      <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-800/30 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-heading font-semibold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>The Echoes Privacy Guarantee</span>
        </div>
        <p className="text-xs text-emerald-200/80 leading-relaxed">
          Family memories are intimate, emotional, and precious. Echoes was engineered from line 1 with a strict Offline-First architecture. All vector indices, audio transcriptions, and neural RAG generation run 100% on your local CPU/GPU through Ollama and SQLite. No telemetry is collected. No data leaves your machine.
        </p>
      </div>
    </div>
  );
};
