import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageSquareCode, ShieldAlert, Activity, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-emerald-400 text-slate-900 font-black shadow-lg shadow-emerald-500/25">
            ⚽
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              StadiumPilot
            </span>
            <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded bg-brand-secondary text-slate-900 uppercase">
              AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm font-medium text-slate-300 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-primary" /> Amenities
          </a>
          <a href="/#crowd-telemetry" className="text-sm font-medium text-slate-300 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Live Traffic
          </a>
          <a href="/#emergency-dispatcher" className="text-sm font-medium text-slate-300 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> SafeStadium
          </a>
          <Link to="/chat" className="text-sm font-medium text-slate-300 hover:text-brand-primary transition-colors flex items-center gap-1.5">
            <MessageSquareCode className="w-4 h-4 text-blue-400" /> Assistant Play
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link 
            to="/chat"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 hover:bg-emerald-500 text-brand-primary hover:text-slate-900 border border-brand-primary/20 hover:border-transparent transition-all shadow-md duration-300"
          >
            Launch Assistant
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 p-4 rounded-2xl glass-panel flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <a 
            href="/#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-base font-medium text-slate-300 hover:text-brand-primary rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <Compass className="w-5 h-5 text-brand-primary" /> Amenities Directory
          </a>
          <a 
            href="/#crowd-telemetry" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-base font-medium text-slate-300 hover:text-brand-primary rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <Activity className="w-5 h-5 text-emerald-400" /> Live Telemetry
          </a>
          <a 
            href="/#emergency-dispatcher" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-base font-medium text-slate-300 hover:text-brand-primary rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Emergency Alerts
          </a>
          <Link 
            to="/chat" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-base font-medium text-slate-300 hover:text-brand-primary rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
          >
            <MessageSquareCode className="w-5 h-5 text-blue-400" /> Assistant Sandbox
          </Link>
          <div className="h-px bg-slate-800 my-1"></div>
          <Link 
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-3 rounded-xl font-bold bg-brand-primary text-slate-900 transition-colors"
          >
            Launch Assistant
          </Link>
        </div>
      )}
    </nav>
  );
}
