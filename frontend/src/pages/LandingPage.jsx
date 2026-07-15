import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  MessageSquare, Compass, ShieldAlert, Sparkles, Send, 
  RefreshCw, AlertTriangle, AlertCircle, CheckCircle, Clock, Users, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  // System states
  const [backendHealthy, setBackendHealthy] = useState(false);

  // AI Assistant States
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I am StadiaFlow AI. Ask me about gates, seating, concessions, or try typing 'emergency' to see the safety fallback." }
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
      await api.getHealth();
      setBackendHealthy(true);

      const crowdData = await api.getCrowdStatus();
      setCheckpoints(crowdData.checkpoints || []);

      const emergencyData = await api.getEmergencyReports();
      setEmergencies(emergencyData || []);

      const locationData = await api.getLocations();
      setLocations(locationData || []);
    } catch (err) {
      console.warn('Backend server offline. Running in local demo fallback mode.', err);
      setBackendHealthy(false);
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
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTelemetry();
  }, []);

  // Send message to Gemini Endpoint (Feature 1 chat API)
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
        const result = await api.postChat(userMsg);
        reply = result.reply;
      } else {
        await new Promise(resolve => setTimeout(resolve, 850));
        const promptLower = userMsg.toLowerCase();
        if (promptLower.includes('gate') || promptLower.includes('entrance')) {
          reply = "*(Offline Simulation)* Gate B (East Entrance) is congested with a 22-minute wait. Gates A (North) and C (South) are operating normally with wait times of 8 and 4 minutes respectively.";
        } else if (promptLower.includes('emergency') || promptLower.includes('hurt') || promptLower.includes('accident')) {
          reply = "⚠️ *(Offline Simulation)* **EMERGENCY ASSISTANCE LOGGED**: Please contact nearby security officers immediately. First Aid is at Section 112.";
        } else {
          reply = `*(Offline Simulation)* I received your message: "${userMsg}". Connect the FastAPI backend to interact with Gemini.`;
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to server. Please verify backend is running.' }]);
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

  const handleRefreshCrowd = async () => {
    setRefreshingCrowd(true);
    try {
      if (backendHealthy) {
        const crowdData = await api.getCrowdStatus();
        setCheckpoints(crowdData.checkpoints || []);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingCrowd(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col bg-[#F8F9FA]">
      
      {/* Backend Status banner */}
      <div className="bg-white py-2.5 px-6 border-b border-gray-200 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {backendHealthy ? (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Backend Connected
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Backend Offline
            </span>
          )}
        </div>
        <div className="text-slate-400 font-bold uppercase tracking-wider hidden sm:block text-[10px]">
          FIFA World Cup 2026 Sandbox
        </div>
      </div>

      {/* Hero Section - Pure white bg, clean layout */}
      <section className="relative bg-white pt-20 pb-20 px-6 text-center border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-brand-primary mb-6 border border-blue-100">
            <Sparkles className="w-3.5 h-3.5" /> Google Gemini & Command Telemetry
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            StadiaFlow AI
            <span className="block mt-2 text-xl sm:text-3xl font-bold text-slate-500">
              Smart Stadium Assistant for FIFA World Cup 2026
            </span>
          </h1>

          <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
            An operations dashboard and spectator assistance platform designed to resolve entrance bottlenecks, answer fan questions, and streamline safety tickets.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/chat" 
              className="px-5 py-3 rounded-lg font-bold bg-brand-primary hover:bg-blue-600 text-white transition-all shadow-sm flex items-center gap-2 text-xs"
            >
              Interactive AI Assistant <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/dashboard" 
              className="px-5 py-3 rounded-lg font-bold bg-[#F1F3F4] hover:bg-slate-200 text-slate-700 transition-colors text-xs"
            >
              Operations Console
            </Link>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-16 w-full space-y-20 flex-1">
        
        {/* Core Capabilities */}
        <section id="features" className="space-y-10 scroll-mt-20">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Platform Features</h2>
            <p className="text-xs text-slate-500">
              Three interconnected subsystems built to orchestrate and safeguard visitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="material-card p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-brand-primary border border-blue-100">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">1. AI Assistant</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Natural language assistance reading venue directories dynamically. Falls back to token matching similarity queries when Gemini API keys are unconfigured.
                </p>
              </div>
              <Link to="/chat" className="text-xs font-bold text-brand-primary flex items-center gap-1 mt-6 hover:underline">
                Ask Questions &rarr;
              </Link>
            </div>

            <div className="material-card p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-secondary border border-emerald-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">2. Live Telemetry</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time visitor flow rates, gate wait times, and crowd density indicators dynamically synced to the central command dashboard.
                </p>
              </div>
              <Link to="/dashboard" className="text-xs font-bold text-brand-secondary flex items-center gap-1 mt-6 hover:underline">
                View Live Command &rarr;
              </Link>
            </div>

            <div className="material-card p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-rose-600 border border-red-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">3. Safety Dispatch</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Incident monitoring, categorization, and paramedic/security triage dispatch center supporting direct supervisor submissions.
                </p>
              </div>
              <Link to="/dashboard" className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-6 hover:underline">
                Operations Logs &rarr;
              </Link>
            </div>

          </div>
        </section>

        {/* 1. Live Crowd Telemetry Dashboard Section */}
        <section id="crowd-telemetry" className="scroll-mt-20">
          <div className="material-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-secondary" /> Entrance Gate Traffic
                </h2>
                <p className="text-xs text-slate-500">
                  Live simulated gate throughput queues (refreshes automatically).
                </p>
              </div>
              <button 
                onClick={handleRefreshCrowd}
                disabled={refreshingCrowd}
                className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-all active:scale-98 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${refreshingCrowd ? 'animate-spin' : ''}`} />
                Refresh Telemetry
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {checkpoints.map(check => (
                <div key={check.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-800">{check.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${
                      check.status === 'congested' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {check.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-1">
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Wait Time</span>
                      <span className="text-base font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-brand-primary" /> {check.wait_time_minutes}m
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Flow Rate</span>
                      <span className="text-base font-extrabold text-slate-800 mt-0.5 block">
                        {check.flow_rate_per_min} <span className="text-[9px] font-normal text-slate-500">/min</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex justify-between text-[9px] text-slate-500 mb-1 font-semibold">
                      <span>Density: {check.density_level}</span>
                      <span>{check.current_queue_size} fans</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
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
            
            {/* Sidebar info */}
            <div className="material-card p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-primary" /> Telemetry Directory Context
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Location catalog context loaded into AI assistant modules:
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amenities</div>
                  {locations.map(loc => (
                    <div key={loc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between">
                      <div>
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                        <span className="block text-[9px] text-slate-400">{loc.description}</span>
                      </div>
                      <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded self-center text-slate-600 font-semibold">
                        Sec {loc.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                Suggested Prompts:
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                  <li>"Which gate has the shortest wait?"</li>
                  <li>"Where is Vanguard Burgers?"</li>
                  <li>"Emergency in Section 104"</li>
                </ul>
              </div>
            </div>

            {/* Chat Play sandbox */}
            <div className="lg:col-span-2 material-card flex flex-col h-[480px]">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-primary text-xs font-bold">
                    AI
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800">Spectator Assistant Sandbox</span>
                    <span className="block text-[9px] text-slate-400">Communicating with POST /api/chat</span>
                  </div>
                </div>
              </div>

              {/* Message log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF9F6]/30">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-primary text-white font-medium rounded-tr-none shadow-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text ? msg.text.replace(/\*\*/g, '').replace(/\*/g, '') : ''}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-brand-primary" /> Querying...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex gap-2">
                <input 
                  id="sandbox-chat-input"
                  aria-label="Sandbox Chat Input Query"
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question about the stadium..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />
                <button 
                  type="submit"
                  aria-label="Send query to assistant"
                  disabled={sendingChat || !userInput.trim()}
                  className="w-9 h-9 rounded-lg bg-brand-primary hover:bg-blue-600 text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* 3. Safety Dispatch command section */}
        <section id="emergency-dispatcher" className="scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active alerts log */}
            <div className="lg:col-span-2 material-card p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500" /> Active Incident Dispatch Monitor
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live tickets logged by venue personnel.
                  </p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {emergencies.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No active incidents. Command secure.</div>
                  ) : (
                    emergencies.map(inc => (
                      <div key={inc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[10px] tracking-wide">
                            {inc.severity === 'high' ? (
                              <AlertCircle className="w-4 h-4 text-rose-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {inc.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                            inc.status === 'resolved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inc.status === 'dispatched'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{inc.description}</p>
                        <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                          <span>📍 Location: {inc.location}</span>
                          <span>Time: {new Date(inc.reported_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Simulation utilizing emergency_reports.json</span>
                <span>Security Operations</span>
              </div>
            </div>

            {/* Submit Incident Form */}
            <div className="material-card p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">File Dispatch Ticket</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Report a safety issue to dispatcher logs.
                </p>
              </div>

              <form onSubmit={handleEmergencySubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="medical">Medical incident</option>
                    <option value="spill_hazard">Spill hazard / Slipping risk</option>
                    <option value="crowd_disorder">Crowd disturbance / Altercation</option>
                    <option value="maintenance">Facility damage / Broken infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Severity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, severity: sev }))}
                        className={`py-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          formData.severity === sev 
                            ? 'bg-slate-100 text-slate-800 border-slate-300 font-bold' 
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="incident-location" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Location</label>
                  <input 
                    id="incident-location"
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Section 108, Row 5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-primary placeholder-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="incident-description" className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</label>
                  <textarea 
                    id="incident-description"
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what occurred clearly..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-primary placeholder-slate-400 resize-none"
                  ></textarea>
                </div>

                {emergencySuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5 font-semibold">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Incident dispatched successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingEmergency}
                  className="w-full py-3 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white text-xs transition-colors flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {submittingEmergency ? 'Logging ticket...' : 'Submit Incident Report'}
                </button>

              </form>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
