import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { 
  Send, Trash2, Sparkles, MessageSquare, Compass, ShieldAlert, 
  ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: "Hi! I'm StadiumPilot AI. Ask me anything about the stadium.",
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
    } catch (err) {
      setBackendHealthy(false);
    }
  };

  useEffect(() => {
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const clearChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        text: "Hi! I'm StadiumPilot AI. Ask me anything about the stadium.",
        source: 'system',
        confidence: 1.0,
        timestamp: new Date().toISOString()
      }
    ]);
    setErrorMsg('');
  };

  return (
    <div className="h-[calc(100vh-73px)] flex overflow-hidden bg-stadium-dark relative">
      
      {/* 1. Sidebar Panel (Hidden on Mobile, visible on Desktop) */}
      <aside className="hidden md:flex flex-col w-72 glass-panel border-r border-stadium-border p-6 flex-shrink-0 justify-between">
        <div className="space-y-8">
          {/* Back Home Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {/* Assistant Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏟️</span>
              <h2 className="text-lg font-black tracking-tight text-white">StadiumPilot AI</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Active assistant for the FIFA World Cup 2026 matches. Employs Gemini models or semantic telemetry lookup.
            </p>
          </div>

          {/* Quick Actions / Tips */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suggested Questions</h3>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.label)}
                  disabled={loading}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-white/5 hover:border-brand-primary/20 text-xs font-medium text-slate-300 hover:text-white transition-all duration-200"
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
          className="w-full py-3 rounded-xl border border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" /> Clear Conversation
        </button>
      </aside>

      {/* 2. Main Chat Area */}
      <section className="flex-1 flex flex-col h-full bg-slate-950/20">
        
        {/* Chat Status Bar */}
        <header className="px-6 py-3.5 border-b border-stadium-border flex items-center justify-between text-xs glass-panel-light z-10">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></div>
            <span className="font-bold text-white tracking-wide uppercase">Gemini Orchestrated Assistant</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span className="text-[10px] font-semibold text-slate-400">
                {backendHealthy ? 'Backend Connected' : 'Backend Offline'}
              </span>
            </div>
            {/* Clear conversation for mobile only */}
            <button 
              onClick={clearChat}
              className="md:hidden text-slate-400 hover:text-rose-400 p-1 transition-colors"
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
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-brand-primary/20 flex items-center justify-center flex-shrink-0 text-brand-primary font-bold text-sm">
                    🤖
                  </div>
                )}

                <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]">
                  {/* Bubble content */}
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-brand-primary text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900/90 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Metadata & Routing Badges */}
                  {msg.role === 'assistant' && msg.source && msg.source !== 'system' && (
                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        Source: 
                        <span className={`font-semibold capitalize ${msg.source === 'gemini' ? 'text-blue-400' : 'text-amber-400'}`}>
                          {msg.source}
                        </span>
                      </span>
                      <span>•</span>
                      <span>Confidence: {Math.round(msg.confidence * 100)}%</span>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center flex-shrink-0 text-brand-primary font-bold text-sm">
                    👤
                  </div>
                )}
              </div>
            ))}

            {/* Simulated typing animation */}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                  🤖
                </div>
                <div className="bg-slate-900/90 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-primary/70 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-brand-primary/70 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-brand-primary/70 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested prompts on Mobile (Horizontal scroll) */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-6 pb-2.5 max-w-full scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt.label)}
              disabled={loading}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-white/5 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <span>{prompt.icon}</span>
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Input container */}
        <div className="p-4 sm:p-6 border-t border-stadium-border bg-slate-950/30">
          <div className="max-w-3xl mx-auto space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about gates, food, restrooms, or simulate emergencies..."
                disabled={loading}
                className="flex-1 bg-slate-900/70 border border-stadium-border hover:border-white/10 focus:border-brand-primary rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-5 rounded-xl bg-brand-primary hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-sm gap-2 transition-all duration-200 active:scale-95 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-500">
              StadiumPilot AI World Cup assistant. Direct queries are mapped semantically against telemetry directories.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}
