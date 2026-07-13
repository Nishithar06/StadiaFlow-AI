import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  MessageSquare, Compass, ShieldAlert, Sparkles, Send, 
  RefreshCw, AlertTriangle, AlertCircle, CheckCircle, Clock, Users, ArrowRight 
} from 'lucide-react';

export default function LandingPage() {
  // System states
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI Assistant States
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am StadiumPilot AI. Ask me about gates, seating, concessions, or try typing "emergency" to see the safety fallback.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Live telemetry states (fetched from backend if available, otherwise fallback to local)
  const [checkpoints, setCheckpoints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [refreshingCrowd, setRefreshingCrowd] = useState(false);

  // Emergency Form States
  const [formData, setFormData] = useState({
    type: 'medical',
    severity: 'medium',
    location: '',
    description: ''
  });
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [emergencySuccess, setEmergencySuccess] = useState(false);

  // Initial Fetches
  const fetchTelemetry = async () => {
    try {
      const health = await api.getHealth();
      setBackendHealthy(true);

      const crowdData = await api.getCrowdStatus();
      setCheckpoints(crowdData.checkpoints || []);

      const emergencyData = await api.getEmergencyReports();
      setEmergencies(emergencyData || []);

      const locationData = await api.getLocations();
      setLocations(locationData || []);
    } catch (err) {
      console.warn('Backend server is not running or unreachable. Running in local demo fallback mode.', err);
      setBackendHealthy(false);
      // Fallback local mock data so the landing page works even if backend is offline
      setCheckpoints([
        { id: 'gate-1', name: 'Gate A (North Entrance)', status: 'normal', wait_time_minutes: 8, density_level: 'medium', flow_rate_per_min: 32, current_queue_size: 250 },
        { id: 'gate-2', name: 'Gate B (East Entrance)', status: 'congested', wait_time_minutes: 22, density_level: 'high', flow_rate_per_min: 18, current_queue_size: 750 },
        { id: 'gate-3', name: 'Gate C (South Entrance)', status: 'normal', wait_time_minutes: 4, density_level: 'low', flow_rate_per_min: 40, current_queue_size: 80 }
      ]);
      setEmergencies([
        { id: 'incident-101', type: 'medical', severity: 'high', location: 'Section 104, Row 12, Seat 4', description: 'Spectator experiencing heat exhaustion symptoms and dizziness.', status: 'dispatched', reported_at: new Date().toISOString() },
        { id: 'incident-102', type: 'spill_hazard', severity: 'medium', location: 'Concourse near Gate B', description: 'Large beverage spill causing slipping hazard on smooth concrete floor.', status: 'pending', reported_at: new Date().toISOString() }
      ]);
      setLocations([
        { id: 'gate-1', name: 'Gate A (North Entrance)', type: 'gate', section: '101', description: 'Main entrance from North Parking lot.', amenities: ['Ticket Office'] },
        { id: 'concession-1', name: 'Vanguard Stadium Burgers', type: 'concession', section: '108', description: 'Gourmet burgers.', amenities: ['Mobile Ordering'] },
        { id: 'first-aid-1', name: 'Main First Aid Station', type: 'first_aid', section: '112', description: 'Staffed medical bay.', amenities: ['Defibrillator'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Send message to Gemini Endpoint
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = userInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserInput('');
    setSendingChat(true);

    try {
      let reply;
      if (backendHealthy) {
        const result = await api.postChatMessage(userMsg);
        reply = result.response;
      } else {
        // Mock Response simulation if backend is not running
        await new Promise(resolve => setTimeout(resolve, 800));
        const promptLower = userMsg.toLowerCase();
        if (promptLower.includes('gate') || promptLower.includes('entrance')) {
          reply = "*(Local Offline Fallback)* **StadiumPilot AI**: Gate A (North) has a 8 min wait; Gate B (East) is congested (22 min wait). Gate C (South) is clear (4 min wait). We recommend Gate C!";
        } else if (promptLower.includes('emergency') || promptLower.includes('hurt') || promptLower.includes('accident')) {
          reply = "⚠️ *(Local Offline Fallback)* **EMERGENCY DETECTED**: Please notify the nearest stadium staff member immediately! First Aid is located at **Section 112**.";
        } else {
          reply = `*(Local Offline Fallback)* **StadiumPilot AI**: I received your query: "${userMsg}". Connect the FastAPI backend to chat with Gemini!`;
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to server. Please ensure the backend is running.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Submit Emergency Incident
  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.description) return;
    setSubmittingEmergency(true);
    setEmergencySuccess(false);

    try {
      if (backendHealthy) {
        const newIncident = await api.postEmergencyReport(formData);
        setEmergencies(prev => [newIncident, ...prev]);
      } else {
        // Offline Mock
        await new Promise(resolve => setTimeout(resolve, 600));
        const newIncident = {
          id: `incident-mock-${Math.floor(Math.random() * 1000)}`,
          type: formData.type,
          severity: formData.severity,
          location: formData.location,
          description: formData.description,
          status: 'pending',
          reported_at: new Date().toISOString()
        };
        setEmergencies(prev => [newIncident, ...prev]);
      }
      setEmergencySuccess(true);
      setFormData({ type: 'medical', severity: 'medium', location: '', description: '' });
      setTimeout(() => setEmergencySuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEmergency(false);
    }
  };

  // Refresh crowd status from API
  const handleRefreshCrowd = async () => {
    setRefreshingCrowd(true);
    try {
      if (backendHealthy) {
        const crowdData = await api.getCrowdStatus();
        setCheckpoints(crowdData.checkpoints || []);
      } else {
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingCrowd(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      
      {/* Backend Status indicator */}
      <div className="bg-slate-950 py-1.5 px-6 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${backendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
          {backendHealthy ? (
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wide">
              Backend Connected
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold tracking-wide">
              Backend Offline
            </span>
          )}
        </div>
        <div className="text-slate-500 font-semibold tracking-wider uppercase hidden sm:block">
          FIFA World Cup 2026 Sandbox
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 text-center overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[80px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-light text-xs font-semibold text-brand-primary mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Tournament Operations
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            StadiumPilot AI
            <span className="block mt-2 text-2xl sm:text-4xl font-bold bg-gradient-to-r from-brand-primary via-emerald-400 to-brand-secondary bg-clip-text text-transparent">
              Smart Stadium Assistant for FIFA World Cup 2026
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            An advanced modular orchestration platform designed to streamline fan directions, monitor live gate queues, and coordinate safety dispatches with state-of-the-art AI.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#ai-playground" 
              className="px-6 py-3.5 rounded-xl font-bold bg-brand-primary hover:bg-emerald-400 text-slate-950 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 group"
            >
              Interactive AI Assistant <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a 
              href="#crowd-telemetry" 
              className="px-6 py-3.5 rounded-xl font-bold glass-panel hover:bg-slate-800 text-white transition-colors"
            >
              Live Crowd Telemetry
            </a>
            <a 
              href="#emergency-dispatcher" 
              className="px-6 py-3.5 rounded-xl font-bold bg-amber-500/10 hover:bg-amber-500/20 text-brand-secondary border border-amber-500/20 transition-colors"
            >
              Safety Dispatch Desk
            </a>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 w-full space-y-24 flex-1">
        
        {/* Core Capabilities Grid */}
        <section id="features" className="space-y-8 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white">System Architecture Overview</h2>
            <p className="text-sm text-slate-400">
              Three modular pipelines structured to improve venue flows and ensure crowd security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">1. Contextual AI Assistant</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Dual-tier architecture reading static stadium directories from local data storage and feeding queries through customized Gemini system prompts for natural guidance.
                </p>
              </div>
              <a href="#ai-playground" className="text-sm font-semibold text-blue-400 flex items-center gap-1 mt-6 hover:underline">
                Open AI Play Sandbox &rarr;
              </a>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">2. Crowd Traffic Control</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real-time telemetry tracking flow rates, wait times, and checkpoint capacities. Generates automatic redirect flags to distribute traffic evenly across stadium gates.
                </p>
              </div>
              <a href="#crowd-telemetry" className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mt-6 hover:underline">
                View Gate Monitors &rarr;
              </a>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">3. Triage & Dispatch Desk</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Live report collection portal. Classifies severity (High, Medium, Low) and suggests appropriate responder units (medical, security, janitorial) for immediate resolution.
                </p>
              </div>
              <a href="#emergency-dispatcher" className="text-sm font-semibold text-brand-secondary flex items-center gap-1 mt-6 hover:underline">
                Access Safety Desk &rarr;
              </a>
            </div>

          </div>
        </section>

        {/* 1. Live Crowd Telemetry Dashboard Section */}
        <section id="crowd-telemetry" className="scroll-mt-20">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl glow-primary space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand-primary" /> Live Checkpoint Telemetry
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Simulated live visitor entry queue status for stadium safety team.
                </p>
              </div>
              <button 
                onClick={handleRefreshCrowd}
                disabled={refreshingCrowd}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/5 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingCrowd ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {checkpoints.map(check => (
                <div key={check.id} className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-slate-200">{check.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      check.status === 'congested' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {check.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Est. Wait</span>
                      <span className="text-xl font-bold text-white flex items-center gap-1 mt-0.5">
                        <Clock className="w-4 h-4 text-brand-secondary" /> {check.wait_time_minutes} min
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Flow Rate</span>
                      <span className="text-xl font-bold text-white mt-0.5 block">
                        {check.flow_rate_per_min} <span className="text-[10px] font-normal text-slate-400">/min</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Queue Density: {check.density_level}</span>
                      <span>{check.current_queue_size} fans</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          check.density_level === 'high' ? 'bg-rose-500' : check.density_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((check.current_queue_size / 800) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Interactive AI Assistant Playground Section */}
        <section id="ai-playground" className="scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Context Sidebar */}
            <div className="glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" /> Assistant Context
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Telemetry context currently visible to the Gemini model:
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Concessions</div>
                  {locations.filter(l => l.type === 'concession').map(loc => (
                    <div key={loc.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs flex justify-between">
                      <div>
                        <span className="font-semibold text-slate-200">{loc.name}</span>
                        <span className="block text-[10px] text-slate-400">{loc.description}</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded self-center text-slate-300">
                        Sec {loc.section}
                      </span>
                    </div>
                  ))}

                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Facilities</div>
                  {locations.filter(l => l.type === 'first_aid' || l.type === 'restroom').map(loc => (
                    <div key={loc.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs flex justify-between">
                      <div>
                        <span className="font-semibold text-slate-200">{loc.name}</span>
                        <span className="block text-[10px] text-slate-400">{loc.description}</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded self-center text-slate-300">
                        Sec {loc.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-xs text-slate-400 leading-relaxed">
                📢 Try asking the AI: 
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                  <li>"Which gate is fastest to enter?"</li>
                  <li>"Where can I buy a burger?"</li>
                  <li>"What should I do in an emergency?"</li>
                </ul>
              </div>
            </div>

            {/* Chat Play area */}
            <div className="lg:col-span-2 glass-panel rounded-3xl glow-secondary flex flex-col h-[480px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-brand-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white">StadiumPilot AI Sandbox</span>
                    <span className="block text-[10px] text-slate-400">Powered by Gemini AI instructions</span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-primary text-slate-950 font-medium rounded-tr-none' 
                        : 'bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/80 border border-white/5 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-primary" /> Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question about the stadium..."
                  className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/40 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={sendingChat || !userInput.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-primary hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-colors active:scale-95 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* 3. Safety Dispatch desk Section */}
        <section id="emergency-dispatcher" className="scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Live Incidents Log */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" /> Active Emergency Dispatch
                  </h2>
                  <p className="text-xs text-slate-400">
                    Incidents reported by fans and staff in real-time.
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {emergencies.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">No active incidents reported.</div>
                  ) : (
                    emergencies.map(inc => (
                      <div key={inc.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200 flex items-center gap-1.5">
                            {inc.severity === 'high' ? (
                              <AlertCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {inc.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase ${
                            inc.status === 'resolved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                              : inc.status === 'dispatched'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{inc.description}</p>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>📍 Location: {inc.location}</span>
                          <span>Time: {new Date(inc.reported_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span>Simulation utilizes crowd_status.json and emergency_reports.json</span>
                <span className="font-bold text-slate-400">Security Command Center</span>
              </div>
            </div>

            {/* Submit Incident Form */}
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Report New Incident</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Report issues to dispatch immediately. Mock updates stadium JSON logs.
                </p>
              </div>

              <form onSubmit={handleEmergencySubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  >
                    <option value="medical">Medical emergency</option>
                    <option value="spill_hazard">Liquid spill / Slip hazard</option>
                    <option value="crowd_disorder">Altercation / Crowd disturbance</option>
                    <option value="maintenance">Facilities issue / Damage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, severity: sev }))}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                          formData.severity === sev 
                            ? 'bg-white/10 text-white border-brand-primary/50' 
                            : 'bg-transparent text-slate-400 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Section 108, Row 5"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary placeholder-slate-650"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Incident Description</label>
                  <textarea 
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what occurred clearly..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary placeholder-slate-650 resize-none"
                  ></textarea>
                </div>

                {emergencySuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Incident logged and dispatched!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingEmergency}
                  className="w-full py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white text-xs transition-colors flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {submittingEmergency ? 'Filing Report...' : 'File Dispatch Ticket'}
                </button>

              </form>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
