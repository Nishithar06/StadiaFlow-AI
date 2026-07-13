import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-stadium-border bg-[#F1F3F4] py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Information */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-800">
              StadiaFlow <span className="text-brand-primary">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            An orchestration platform designed to streamline fan directions, monitor gate queues, and coordinate dispatches at the FIFA World Cup 2026. Powered by Google Gemini.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2.5">
            <li>
              <a href="/#features" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                Stadium Features
              </a>
            </li>
            <li>
              <Link to="/dashboard" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                Traffic & Command Console
              </Link>
            </li>
            <li>
              <Link to="/chat" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
                AI Assistant Chat
              </Link>
            </li>
          </ul>
        </div>

        {/* Technical Stack */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Platform Stack</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li>Frontend: React, Tailwind CSS v4</li>
            <li>Backend: FastAPI (Python)</li>
            <li>Core AI: Google Gemini SDK</li>
            <li>Database: Simulated telemetry datastore</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500 text-center md:text-left">
          &copy; {currentYear} StadiaFlow AI. All rights reserved. Created for FIFA World Cup 2026 simulation.
        </p>
        <div className="flex gap-6 text-xs text-slate-400">
          <a href="#privacy" className="hover:text-slate-600">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-600">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
