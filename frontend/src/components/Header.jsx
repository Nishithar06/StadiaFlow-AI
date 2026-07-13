import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageSquare, ShieldAlert, Activity, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="flat-nav sticky top-0 z-50 px-6 py-3.5 bg-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo - Google Enterprise style */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary text-white font-bold shadow-sm">
            SF
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-800">
              StadiaFlow
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary uppercase">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/navigation" className="text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-slate-400" /> Wayfinding Map
          </Link>
          <Link to="/dashboard" className="text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-400" /> Operations Console
          </Link>
          <Link to="/chat" className="text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate-400" /> AI Assistant
          </Link>
        </div>

        {/* Desktop CTA - Clean Material button */}
        <div className="hidden md:block">
          <Link 
            to="/chat"
            className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-primary hover:bg-blue-600 text-white transition-all shadow-sm duration-200"
          >
            Launch Assistant
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer - Flat white panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-xl border border-stadium-border bg-white flex flex-col gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <Link 
            to="/navigation" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-xs font-bold text-slate-600 hover:text-brand-primary rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
          >
            <Compass className="w-4 h-4 text-slate-400" /> Wayfinding Map
          </Link>
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-xs font-bold text-slate-600 hover:text-brand-primary rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
          >
            <Activity className="w-4 h-4 text-slate-400" /> Operations Command
          </Link>
          <Link 
            to="/chat" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-xs font-bold text-slate-600 hover:text-brand-primary rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3"
          >
            <MessageSquare className="w-4 h-4 text-slate-400" /> AI Assistant Sandbox
          </Link>
          <div className="h-px bg-slate-100 my-1"></div>
          <Link 
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2.5 rounded-lg text-xs font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors shadow-sm"
          >
            Launch Assistant
          </Link>
        </div>
      )}
    </nav>
  );
}
