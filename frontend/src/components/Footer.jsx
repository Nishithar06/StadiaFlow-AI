import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-900 bg-slate-950/40 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Information */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold tracking-tight text-white">
              StadiumPilot <span className="text-brand-primary">AI</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Revolutionizing the matchday experience for fans, stewards, and first responders at the FIFA World Cup 2026. Built on state-of-the-art telemetry and Gemini AI models.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2.5">
            <li>
              <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                Stadium Features
              </a>
            </li>
            <li>
              <a href="#crowd-telemetry" className="text-sm text-slate-400 hover:text-white transition-colors">
                Traffic & Wait Times
              </a>
            </li>
            <li>
              <a href="#emergency-dispatcher" className="text-sm text-slate-400 hover:text-white transition-colors">
                Safety Alerts
              </a>
            </li>
          </ul>
        </div>

        {/* Technical Stack */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Stack</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Frontend: React, Tailwind CSS</li>
            <li>Backend: FastAPI (Python)</li>
            <li>Core AI: Google Gemini SDK</li>
            <li>Mock Datastores: JSON Telemetries</li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900/60 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500 text-center md:text-left">
          &copy; {currentYear} StadiumPilot AI. Created for FIFA World Cup 2026 stadium orchestration. All mock telemetry simulated.
        </p>
        <div className="flex gap-6 text-xs text-slate-500">
          <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
