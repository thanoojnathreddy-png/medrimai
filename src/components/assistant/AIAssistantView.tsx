import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { aiAssistantService } from '../../services/aiAssistantService';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  Loader2,
  Trash2,
  Globe,
  ExternalLink,
  Search,
  Check,
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content: `Hello! I am your **MediSync Smart Medication Assistant** 👋\n\nI can help you review today's doses, examine your adherence trends, verify food instructions, and answer questions about your scheduled medication times.\n\n*Google Search Grounding is enabled to cross-reference up-to-date medical references and clinical guidelines.*`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'What medicines do I have today?',
    'Show my evening medicines.',
    'Which doses did I miss this week?',
    'Can Metformin interact with alcohol?',
    'What are Lisinopril side effects?',
    'Show my medication adherence.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await aiAssistantService.answerQuery(text, useSearchGrounding);
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
        isSearchGrounded: response.isSearchGrounded,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content:
            'Sorry, I encountered an issue retrieving that information. Please try again or consult your doctor.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_reset_${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history reset. How can I help you with your medications today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                MediSync AI Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Globe className="w-3 h-3 text-blue-500" />
                Google Search Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Natural-language schedule queries grounded in live records & Google Search data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Grounding Toggle */}
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              useSearchGrounding
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Toggle Google Search Grounding with gemini-3.5-flash"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding: {useSearchGrounding ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Compliance Banner */}
      <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200 shrink-0">
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Safety Notice:</strong> MediSync is a medication management and reminder tool, not a medical diagnosis system. Never change dosages without consulting a licensed physician.
        </span>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Verified Google Search Grounding Sources */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Grounded Sources & Medical Citations:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((src, sIdx) => (
                      <a
                        key={sIdx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline hover:border-blue-400 transition"
                      >
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <span
                className={`text-[10px] mt-2 block ${
                  m.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400 text-left'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting clinical records with Google Search Grounding...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask about your medicines, evening schedule, or drug interactions..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-95 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
