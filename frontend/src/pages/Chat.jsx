import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Send, Trash2, Sparkles, MessageSquare, Compass, ShieldAlert, 
  ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Hi! I'm StadiaFlow AI. Ask me anything about the stadium.",
      source: 'system',
      confidence: 1.0,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [backendHealthy, setBackendHealthy] = useState(false);

  const messagesEndRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Suggested prompt definitions
  const SUGGESTED_PROMPTS = [
    { label: 'Where is Gate B?', icon: '🚪' },
    { label: 'Nearest restroom', icon: '🚻' },
    { label: 'Vegetarian food', icon: '🥗' },
    { label: 'Fastest exit', icon: '🏃‍♂️' },
    { label: 'Medical center', icon: '🏥' }
  ];

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Check backend status on page load
  const checkStatus = async () => {
    try {
      await api.getHealth();
      setBackendHealthy(true);
    } catch {
      setBackendHealthy(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStatus();
  }, []);

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;
    setErrorMsg('');

    // Add user message
    const userMsg = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.postChat(messageText);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: response.reply,
        source: response.source,
        confidence: response.confidence,
        timestamp: response.timestamp
      }]);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch response. Please verify backend connection.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Sorry, I am having trouble connecting to the backend. Please check if the FastAPI server is online.",
        source: 'error',
        confidence: 0.0,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('query');
    if (initialQuery) {
      // Clear parameter so page reloads don't loop/re-trigger
      searchParams.delete('query');
      setSearchParams(searchParams);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSend(initialQuery);
    }
  }, [searchParams, setSearchParams]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        text: "Hi! I'm StadiaFlow AI. Ask me anything about the stadium.",
        source: 'system',
        confidence: 1.0,
        timestamp: new Date().toISOString()
      }
    ]);
    setErrorMsg('');
  };

  return (
    <div className="h-[calc(100vh-73px)] flex overflow-hidden bg-white relative">
      
      {/* 1. Sidebar Panel - Light Workspace style */}
      <aside className="hidden md:flex flex-col w-72 bg-[#F8F9FA] border-r border-stadium-border p-6 flex-shrink-0 justify-between">
        <div className="space-y-8">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          {/* Title info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏟️</span>
              <h2 className="text-base font-bold tracking-tight text-slate-800">StadiaFlow AI</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              FIFA World Cup 2026 support workspace. Leverages Gemini context instruction libraries.
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suggested Queries</h3>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.label)}
                  disabled={loading}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-primary/30 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-150 shadow-sm"
                >
                  <span className="mr-2">{prompt.icon}</span>
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Chat CTA */}
        <button
          onClick={clearChat}
          className="w-full py-3 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50/30 text-slate-500 hover:text-rose-600 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Trash2 className="w-4 h-4" /> Clear Chat Session
        </button>
      </aside>

      {/* 2. Main Chat Panel */}
      <section className="flex-1 flex flex-col h-full bg-[#FAF9F6]/20">
        
        {/* Status Bar Header */}
        <header className="px-6 py-3.5 border-b border-stadium-border bg-white flex items-center justify-between text-xs z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
            <span className="font-bold text-slate-700 tracking-wide uppercase">AI Assistant console</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-500">
                {backendHealthy ? 'Backend Connected' : 'Backend Offline'}
              </span>
            </div>
            <button 
              onClick={clearChat}
              className="md:hidden text-slate-400 hover:text-rose-600 p-1 transition-colors"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-150`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-brand-secondary font-bold text-xs shadow-sm">
                    🤖
                  </div>
                )}

                <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]">
                  {/* message bubble */}
                  <div className={`p-4 rounded-xl text-xs leading-relaxed shadow-sm whitespace-pre-line border ${
                    msg.role === 'user'
                      ? 'bg-blue-50 text-slate-800 border-blue-100 rounded-tr-none font-medium'
                      : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text ? msg.text.replace(/\*\*/g, '').replace(/\*/g, '') : ''}
                  </div>

                  {/* badges details */}
                  {msg.role === 'assistant' && msg.source && msg.source !== 'system' && (
                    <div className="flex items-center gap-2 px-1 text-[9px] text-slate-400 font-semibold uppercase">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-400" />
                        Source: 
                        <span className={`font-bold capitalize ${msg.source === 'gemini' ? 'text-blue-600' : 'text-amber-600'}`}>
                          {msg.source}
                        </span>
                      </span>
                      <span>•</span>
                      <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-brand-primary font-bold text-xs shadow-sm">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Pulsing Loading Indicators */}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-secondary font-bold text-xs shadow-sm">
                  🤖
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Mobile prompt lists */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-6 pb-2.5 max-w-full scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt.label)}
              disabled={loading}
              className="flex-shrink-0 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1.5 shadow-sm"
            >
              <span>{prompt.icon}</span>
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Text Input area */}
        <div className="p-4 sm:p-6 border-t border-stadium-border bg-white shadow-md">
          <div className="max-w-3xl mx-auto space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5 font-semibold animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                id="assistant-chat-input"
                aria-label="Assistant Chat Message Input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about gates, concessions, seating, or try typing 'emergency'..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-brand-primary rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                aria-label="Send message to assistant"
                disabled={loading || !input.trim()}
                className="px-4 rounded-lg bg-brand-primary hover:bg-blue-600 text-white flex items-center justify-center font-bold text-xs gap-1.5 transition-all active:scale-98 disabled:opacity-40 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-semibold">
              StadiaFlow command telemetry indexing. AI responses are generated using Gemini system directives.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}
