import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Star,
  Mic,
  Calendar,
  User,
  Tag,
  Trash2,
  Edit3,
  Download,
  LayoutGrid,
  List,
  Sparkles,
  FileText
} from 'lucide-react';
import { Memory } from '../types';

interface VaultViewProps {
  memories: Memory[];
  onSelectMemory: (mem: Memory) => void;
  onOpenCreateModal: () => void;
  onEditMemory: (mem: Memory) => void;
  onDeleteMemory: (id: string) => void;
  onToggleFavorite: (mem: Memory) => void;
  onSeedSampleMemories: () => void;
  onExportMemory: (id: string, format: 'markdown' | 'json') => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  memories,
  onSelectMemory,
  onOpenCreateModal,
  onEditMemory,
  onDeleteMemory,
  onToggleFavorite,
  onSeedSampleMemories,
  onExportMemory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique tags from all memories
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    memories.forEach((m) => {
      if (m.tags) {
        m.tags.split(',').forEach((t) => {
          const cleaned = t.trim().toLowerCase();
          if (cleaned) tagSet.add(cleaned);
        });
      }
    });
    return Array.from(tagSet).slice(0, 10);
  }, [memories]);

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.person_name && m.person_name.toLowerCase().includes(q)) ||
        (m.tags && m.tags.toLowerCase().includes(q)) ||
        (m.transcription && m.transcription.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Tag filter
      if (selectedTag === 'all') return true;
      if (selectedTag === 'favorites') return m.is_favorite;
      if (selectedTag === 'audio') return Boolean(m.audio_filename);
      return (m.tags || '').toLowerCase().includes(selectedTag);
    });
  }, [memories, searchQuery, selectedTag]);

  return (
    <div className="space-y-6 py-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
            Memory Vault
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Browse, search, and preserve family anecdotes and spoken histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {memories.length === 0 && (
            <button
              onClick={onSeedSampleMemories}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Seed Sample Memories</span>
            </button>
          )}

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Preserve New Story</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#13141f] border border-white/5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memories by keyword, person, date, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              selectedTag === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            All Stories ({memories.length})
          </button>

          <button
            onClick={() => setSelectedTag('favorites')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              selectedTag === 'favorites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setSelectedTag('audio')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors ${
              selectedTag === 'audio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Mic className="w-3 h-3 text-purple-400" />
            <span>With Audio</span>
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg shrink-0 capitalize transition-colors ${
                selectedTag === tag
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Collection */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#13141f] border border-dashed border-zinc-800">
          <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
          <h3 className="text-white font-medium text-base">No memories found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No stories matched "${searchQuery}". Try another search term or reset your filters.`
              : 'Your vault is ready for its first treasured family story.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {memories.length === 0 ? (
              <button
                onClick={onSeedSampleMemories}
                className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs font-medium"
              >
                Load Sample Stories
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('all');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="group rounded-2xl bg-[#13141f] border border-white/5 hover:border-amber-500/30 hover:bg-[#161825] transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-amber-400/80" />
                      {mem.date || 'Era unknown'}
                    </span>
                    {mem.audio_filename && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px]">
                        <Mic className="w-2.5 h-2.5" /> Voice
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(mem);
                    }}
                    className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
                    title={mem.is_favorite ? 'Favorited' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        mem.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectMemory(mem)}
                  className="font-heading font-semibold text-white text-base group-hover:text-amber-300 cursor-pointer transition-colors line-clamp-1"
                >
                  {mem.title}
                </h3>

                {/* Person */}
                {mem.person_name && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/80 mt-1">
                    <User className="w-3 h-3 text-amber-400" />
                    <span>{mem.person_name}</span>
                  </div>
                )}

                {/* Narrative Preview */}
                <p
                  onClick={() => onSelectMemory(mem)}
                  className="text-xs text-zinc-400 mt-2.5 line-clamp-3 leading-relaxed cursor-pointer"
                >
                  {mem.description}
                </p>

                {/* Tags */}
                {mem.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {mem.tags.split(',').slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="px-5 py-3 border-t border-white/5 bg-[#0f1019] flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectMemory(mem)}
                  className="text-amber-400 hover:text-amber-300 font-medium text-[11px]"
                >
                  Read &amp; Listen &rarr;
                </button>

                <div className="flex items-center gap-2 text-zinc-400">
                  <button
                    onClick={() => onExportMemory(mem.id, 'markdown')}
                    className="hover:text-white p-1"
                    title="Export as Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditMemory(mem)}
                    className="hover:text-amber-300 p-1"
                    title="Edit Story"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    className="hover:text-rose-400 p-1"
                    title="Delete Story"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => onSelectMemory(mem)}
              className="group cursor-pointer p-4 rounded-xl bg-[#13141f] border border-white/5 hover:border-amber-500/30 hover:bg-[#161825] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(mem);
                  }}
                  className="p-1"
                >
                  <Star
                    className={`w-4 h-4 ${
                      mem.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                    }`}
                  />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-semibold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {mem.title}
                    </h4>
                    {mem.audio_filename && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[9px] font-mono">
                        AUDIO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                    {mem.person_name && <span>{mem.person_name}</span>}
                    {mem.date && <span>&bull; {mem.date}</span>}
                    <span className="line-clamp-1 max-w-xs">{mem.description}</span>
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-2 self-end sm:self-center text-zinc-400 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onExportMemory(mem.id, 'markdown')}
                  className="p-1 hover:text-white"
                  title="Export Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEditMemory(mem)}
                  className="p-1 hover:text-amber-300"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1 hover:text-rose-400"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
