import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio,
  Send,
  Sparkles,
  ShieldCheck,
  Cpu,
  Trash2,
  ArrowRight,
  Flame
} from 'lucide-react';
import { ChatMessage, HealthStatus } from '../types';
import { askAssistant, fetchChatHistory, clearChatHistory } from '../services/api';

interface AssistantViewProps {
  health: HealthStatus | null;
  onSelectMemoryById: (id: string) => void;
}

const STARTER_PROMPTS = [
  "What vehicle did Grandpa Joe wash on summer mornings?",
  "What was Nani's philosophy on brewing cardamom chai?",
  "Tell me about the 1989 Jazz Festival in the rain.",
  "What was Aunt Clara's secret for making pie crust?"
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  health,
  onSelectMemoryById
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(health?.active_model || '');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const history = await fetchChatHistory();
      if (history.length > 0) {
        setMessages(history);
      }
    } catch (e) {
      console.warn('Could not load chat history', e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    if (health?.active_model && !selectedModel) {
      setSelectedModel(health.active_model);
    }
  }, [health, loadHistory, selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputText).trim();
    if (!q || isLoading) return;

    const userTurn: ChatMessage = {
      role: 'user',
      content: q
    };

    setMessages((prev) => [...prev, userTurn]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await askAssistant(q, selectedModel || undefined);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      const errorTurn: ChatMessage = {
        role: 'assistant',
        content: `Unable to query memories: ${err.message || 'Local AI service unavailable.'}`
      };
      setMessages((prev) => [...prev, errorTurn]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    await clearChatHistory();
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#13141f] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold text-white">AI Memory Assistant</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-mono">
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Strict retrieval over local vault. Never hallucinates personal family memories.
            </p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              {health?.available_models && health.available_models.length > 0 ? (
                health.available_models.map((m) => (
                  <option key={m} value={m} className="bg-zinc-900 text-white">
                    {m}
                  </option>
                ))
              ) : (
                <option value="default" className="bg-zinc-900 text-white">
                  {health?.active_model || 'Local Model'}
                </option>
              )}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/40 text-zinc-400 hover:text-rose-300 transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="min-h-[460px] max-h-[580px] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-[#0f1019] border border-white/5 space-y-6">
        {messages.length === 0 ? (
          <div className="py-12 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-white text-base">
                Ask anything about your family memories
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Echoes searches your preserved stories and voice recordings, synthesizing answers with exact source attribution.
              </p>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="p-3 rounded-xl bg-[#141522] border border-white/5 hover:border-amber-500/30 hover:bg-[#1a1b2b] text-xs text-zinc-300 hover:text-white transition-all text-left flex items-start justify-between group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 shrink-0 ml-2 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-full border border-white/5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline RAG Engine &bull; Zero External AI Calls</span>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-sm shadow-md'
                    : 'bg-[#151726] border border-white/10 text-zinc-200 rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono mb-2 uppercase tracking-wider">
                    <Flame className="w-3 h-3 candle-flame" />
                    <span>Echoes Vault Assistant</span>
                    {msg.model_used && (
                      <span className="opacity-60 font-mono">({msg.model_used})</span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line font-sans">{msg.content}</div>

                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                    <span className="block text-[10px] uppercase font-mono tracking-wider text-amber-300/80">
                      Grounded in Saved Memories ({msg.sources.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src) => (
                        <div
                          key={src.id}
                          onClick={() => onSelectMemoryById(src.id)}
                          className="group cursor-pointer p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 hover:border-amber-500/40 hover:bg-zinc-800 transition-all text-left"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-white group-hover:text-amber-300">
                            <span className="truncate max-w-[170px]">{src.title}</span>
                            <span className="text-[9px] font-mono text-zinc-400">
                              match: {src.relevance_score}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-normal">
                            {src.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#151726] border border-white/10 text-xs text-amber-300 animate-pulse w-fit">
            <Radio className="w-4 h-4 animate-spin text-amber-400" />
            <span>Consulting local memories via RAG...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <input
          type="text"
          placeholder="Ask a question about your saved family memories..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="w-full pl-5 pr-14 py-3.5 bg-[#13141f] border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 shadow-lg"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-zinc-950 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
