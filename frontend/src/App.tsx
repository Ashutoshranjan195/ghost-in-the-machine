import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchHealth,
  fetchMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  uploadAudio,
  seedSampleMemories,
  exportMemory
} from './services/api';
import { Memory, HealthStatus, MemoryCreateInput } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VaultView } from './components/VaultView';
import { AssistantView } from './components/AssistantView';
import { RemembranceView } from './components/RemembranceView';
import { GhostStoryView } from './components/GhostStoryView';
import { SettingsView } from './components/SettingsView';
import { MemoryModal } from './components/MemoryModal';
import { MemoryDetailModal } from './components/MemoryDetailModal';
import { Flame } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (e) {
      console.warn('Backend not responding yet', e);
    }
  }, []);

  const loadMemories = useCallback(async () => {
    try {
      const res = await fetchMemories();
      setMemories(res.items);
      // Auto-seed if completely empty on first launch
      if (res.items.length === 0) {
        try {
          const seeded = await seedSampleMemories();
          setMemories(seeded.items);
        } catch (seedErr) {
          console.log('Auto-seed bypassed', seedErr);
        }
      }
    } catch (e) {
      console.warn('Could not load memories', e);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    loadMemories();
  }, [loadHealth, loadMemories]);

  const handleCreateOrUpdateMemory = async (
    data: MemoryCreateInput,
    audioFile?: File
  ) => {
    if (editingMemory) {
      await updateMemory(editingMemory.id, data);
      if (audioFile) {
        await uploadAudio(editingMemory.id, audioFile);
      }
      setEditingMemory(null);
      await loadMemories();
    } else {
      const created = await createMemory(data);
      if (audioFile) {
        await uploadAudio(created.id, audioFile);
      }
      await loadMemories();
    }
    loadHealth();
  };

  const handleDeleteMemory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this preserved memory?')) {
      await deleteMemory(id);
      await loadMemories();
      loadHealth();
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
    }
  };

  const handleToggleFavorite = async (mem: Memory) => {
    try {
      const updated = await updateMemory(mem.id, { is_favorite: !mem.is_favorite });
      setMemories((prev) => prev.map((m) => (m.id === mem.id ? updated : m)));
      if (selectedMemory?.id === mem.id) {
        setSelectedMemory(updated);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleSeedSamples = async () => {
    const res = await seedSampleMemories();
    setMemories(res.items);
    loadHealth();
  };

  const handleExportMemory = async (id: string, format: 'markdown' | 'json') => {
    try {
      const res = await exportMemory(id, format);
      const blob = new Blob(
        [format === 'markdown' ? res.markdown_content : JSON.stringify(res.json_data, null, 2)],
        { type: format === 'markdown' ? 'text/markdown' : 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.title.replace(/\s+/g, '_').toLowerCase()}.${format === 'markdown' ? 'md' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleSelectMemoryById = (id: string) => {
    const found = memories.find((m) => m.id === id);
    if (found) {
      setSelectedMemory(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c12] text-zinc-200 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => {
          setEditingMemory(null);
          setIsCreateModalOpen(true);
        }}
        health={health}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            health={health}
            memories={memories}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenCreateModal={() => {
              setEditingMemory(null);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {activeTab === 'vault' && (
          <VaultView
            memories={memories}
            onSelectMemory={(mem) => setSelectedMemory(mem)}
            onOpenCreateModal={() => {
              setEditingMemory(null);
              setIsCreateModalOpen(true);
            }}
            onEditMemory={(mem) => {
              setEditingMemory(mem);
              setIsCreateModalOpen(true);
            }}
            onDeleteMemory={handleDeleteMemory}
            onToggleFavorite={handleToggleFavorite}
            onSeedSampleMemories={handleSeedSamples}
            onExportMemory={handleExportMemory}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView
            health={health}
            onSelectMemoryById={handleSelectMemoryById}
          />
        )}

        {activeTab === 'remembrance' && (
          <RemembranceView memories={memories} />
        )}

        {activeTab === 'ghost' && (
          <GhostStoryView memories={memories} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            health={health}
            onRefreshHealth={loadHealth}
            onReloadMemories={loadMemories}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-[#08090e] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 candle-flame" />
            <span className="font-heading font-semibold text-zinc-300">ECHOES</span>
            <span>&bull; &ldquo;Some voices deserve to live forever.&rdquo;</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Hacktoberfest 2026 Ghost in the Machine</span>
            <span>100% Offline AI</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      <MemoryModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingMemory(null);
        }}
        onSubmit={handleCreateOrUpdateMemory}
        initialData={editingMemory}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onEdit={(mem) => {
          setEditingMemory(mem);
          setIsCreateModalOpen(true);
        }}
        onDelete={handleDeleteMemory}
        onToggleFavorite={handleToggleFavorite}
        onExport={handleExportMemory}
        onRefreshMemory={(updated) => {
          setSelectedMemory(updated);
          setMemories((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }}
      />
    </div>
  );
}

export default App;
