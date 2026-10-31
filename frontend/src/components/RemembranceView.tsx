import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Flame,
  Printer,
  Sparkles,
  User,
  Music,
  Utensils,
  Quote,
  Check
} from 'lucide-react';
import { Memory, RemembranceProfile } from '../types';
import {
  generateRemembranceTribute,
  saveRemembranceProfile,
  fetchRemembranceProfiles
} from '../services/api';

interface RemembranceViewProps {
  memories: Memory[];
}

export const RemembranceView: React.FC<RemembranceViewProps> = ({ memories }) => {
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [passingDate, setPassingDate] = useState('');
  const [biography, setBiography] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [favoriteMusic, setFavoriteMusic] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);

  const [tributeMessage, setTributeMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<RemembranceProfile[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadProfiles = useCallback(async () => {
    try {
      const data = await fetchRemembranceProfiles();
      setSavedProfiles(data);
    } catch (e) {
      console.warn('Could not load profiles', e);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSelectProfile = (p: RemembranceProfile) => {
    setPersonName(p.person_name || '');
    setRelationship(p.relationship || '');
    setBirthDate(p.birth_date || '');
    setPassingDate(p.passing_date || '');
    setBiography(p.biography || '');
    setFavoriteFood(p.favorite_food || '');
    setFavoriteMusic(p.favorite_music || '');
    setFavoriteQuote(p.favorite_quote || '');
    setTributeMessage(p.tribute_message || '');
  };

  const handleToggleMemory = (id: string) => {
    setSelectedMemoryIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!personName.trim()) {
      alert('Please enter the name of the person being honored.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateRemembranceTribute({
        person_name: personName,
        relationship: relationship || undefined,
        birth_date: birthDate || undefined,
        passing_date: passingDate || undefined,
        biography: biography || undefined,
        favorite_food: favoriteFood || undefined,
        favorite_music: favoriteMusic || undefined,
        favorite_quote: favoriteQuote || undefined,
        selected_memory_ids: selectedMemoryIds.length > 0 ? selectedMemoryIds : undefined
      });
      setTributeMessage(res.tribute_message);
    } catch (err: any) {
      alert(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!personName.trim() || !tributeMessage.trim()) {
      alert('Please generate or enter a tribute message before saving.');
      return;
    }
    setIsSaving(true);
    try {
      await saveRemembranceProfile({
        person_name: personName,
        relationship,
        birth_date: birthDate,
        passing_date: passingDate,
        biography,
        favorite_food: favoriteFood,
        favorite_music: favoriteMusic,
        favorite_quote: favoriteQuote,
        tribute_message: tributeMessage
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      loadProfiles();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPrintable = () => {
    const profile = {
      person_name: personName || 'Honored One',
      relationship,
      birth_date: birthDate,
      passing_date: passingDate,
      favorite_food: favoriteFood,
      favorite_music: favoriteMusic,
      favorite_quote: favoriteQuote,
      tribute_message: tributeMessage
    };

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remembrance: ${profile.person_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
          body { font-family: 'Lora', serif; padding: 40px; background: #0c0d12; color: #e2e4ec; max-width: 800px; margin: auto; }
          h1 { font-family: 'Cinzel', serif; color: #f59e0b; text-align: center; margin-bottom: 4px; }
          .sub { text-align: center; color: #94a3b8; font-size: 14px; margin-bottom: 28px; }
          .candle { text-align: center; font-size: 32px; margin-bottom: 12px; }
          .quote { border-left: 3px solid #f59e0b; padding-left: 16px; margin: 24px 0; font-style: italic; color: #fbbf24; }
          .tribute { font-size: 16px; line-height: 1.8; color: #cbd5e1; white-space: pre-line; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px; background: #13141f; padding: 16px; border-radius: 8px; border: 1px solid #272a3a; font-size: 13px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #272a3a; padding-top: 16px; }
          @media print {
            body { background: #fff; color: #111; padding: 0; }
            h1 { color: #b45309; }
            .grid { background: #f8fafc; border: 1px solid #e2e8f0; }
            .tribute { color: #1f2937; }
            .quote { border-left-color: #d97706; color: #92400e; }
          }
        </style>
      </head>
      <body>
        <div class="candle">🕯️</div>
        <h1>${profile.person_name}</h1>
        <div class="sub">${profile.relationship || 'Beloved Family Member'} &bull; ${profile.birth_date || ''} ${profile.passing_date ? `— ${profile.passing_date}` : ''}</div>
        ${profile.favorite_quote ? `<div class="quote">"${profile.favorite_quote}"</div>` : ''}
        <div class="tribute">${profile.tribute_message}</div>
        <div class="grid">
          ${profile.favorite_food ? `<div><strong>Favorite Dish:</strong> ${profile.favorite_food}</div>` : ''}
          ${profile.favorite_music ? `<div><strong>Beloved Song:</strong> ${profile.favorite_music}</div>` : ''}
        </div>
        <div class="footer">Preserved with Echoes &bull; The Offline Memory Keeper</div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Remembrance Studio</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
          Digital Remembrance Page
        </h1>
        <p className="text-xs md:text-sm text-zinc-400">
          Create an emotional, dignified memorial honoring a loved one’s legacy. Never claims supernatural communication; focuses purely on love and legacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5 p-6 rounded-3xl bg-[#131420] border border-white/5">
          <h2 className="font-heading text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Honoree Details</span>
          </h2>

          {savedProfiles.length > 0 && (
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-1.5">
                Saved Memorial Keepsakes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {savedProfiles.map((p) => (
                  <button
                    key={p.id || p.person_name}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      personName === p.person_name
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-medium'
                        : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {p.person_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Savitri Devi or Grandpa Joe"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Grandmother, Father, Mentor"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Birth Year / Date
              </label>
              <input
                type="text"
                placeholder="e.g. 1928"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Passing Year / Era
              </label>
              <input
                type="text"
                placeholder="e.g. 2014 or Present"
                value={passingDate}
                onChange={(e) => setPassingDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Favorite Comfort Food</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cardamom ginger chai & samosas"
                value={favoriteFood}
                onChange={(e) => setFavoriteFood(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span>Beloved Melody / Song</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Classic jazz or old ghazals"
                value={favoriteMusic}
                onChange={(e) => setFavoriteMusic(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-amber-400" />
              <span>Words They Lived By / Favorite Saying</span>
            </label>
            <input
              type="text"
              placeholder='e.g. "Some pauses in a rainy day are life’s sweetest luxury."'
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Short Life Summary / Passions
            </label>
            <textarea
              rows={3}
              placeholder="A quiet schoolteacher who spent five decades cultivating dahlias and storytelling..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Select memories from vault */}
          {memories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Weave Linked Memories from Vault ({selectedMemoryIds.length} selected)
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                {memories.map((m) => (
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
                    <span className="text-[10px] text-zinc-400">({m.person_name || 'Family'})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !personName.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Tribute...' : 'Generate Respectful Tribute'}</span>
            </button>
          </div>
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#181926] to-[#10111a] border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6 candle-flame" />
              </div>
            </div>

            <div>
              <h3 className="font-heading text-2xl font-bold text-amber-400">
                {personName || 'Honored One'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {relationship || 'Beloved Kin'} &bull; {birthDate || 'Past'} {passingDate ? `— ${passingDate}` : ''}
              </p>
            </div>

            {favoriteQuote && (
              <div className="p-3 rounded-xl bg-amber-500/10 border-l-2 border-amber-400 text-xs italic text-amber-200 text-left">
                "{favoriteQuote}"
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#0d0e16]/80 border border-white/5 text-xs text-zinc-300 leading-relaxed text-left max-h-[300px] overflow-y-auto whitespace-pre-line font-sans">
              {tributeMessage || (
                <span className="text-zinc-500 italic">
                  Fill in the details on the left and click "Generate Respectful Tribute" to craft a loving memorial message with your local AI.
                </span>
              )}
            </div>

            {(favoriteFood || favoriteMusic) && (
              <div className="grid grid-cols-2 gap-2 text-left text-[11px] p-3 rounded-xl bg-zinc-900/60 border border-white/5">
                {favoriteFood && (
                  <div>
                    <span className="text-amber-400 block font-mono text-[9px] uppercase">Comfort Dish</span>
                    <span className="text-zinc-300">{favoriteFood}</span>
                  </div>
                )}
                {favoriteMusic && (
                  <div>
                    <span className="text-purple-400 block font-mono text-[9px] uppercase">Melody</span>
                    <span className="text-zinc-300">{favoriteMusic}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={handleOpenPrintable}
              disabled={!tributeMessage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / HTML View</span>
            </button>

            <button
              onClick={handleSaveProfile}
              disabled={!tributeMessage || isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 text-xs font-semibold shadow-md transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save to Vault</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
