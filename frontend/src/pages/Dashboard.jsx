import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Clock, AlertCircle, ShieldAlert, Navigation, ArrowRight,
  TrendingUp, RefreshCw, Layers, CheckCircle2, AlertTriangle, PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);

  // Core fetch logic
  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const response = await api.getDashboard();
      setData(response);
      setBackendHealthy(true);
    } catch (err) {
      console.warn('FastAPI backend offline. Rendering simulated dashboard analytics.', err);
      setBackendHealthy(false);
      
      // Local simulated dashboard payload if backend is unreachable
      setData({
        crowd_metrics: {
          total_estimated_queue: 1080,
          average_wait_time_minutes: 11.3,
          checkpoints_congested_count: 1,
          gates: [
            { id: 'gate-1', name: 'Gate A (North Entrance)', status: 'normal', wait_time_minutes: 8, density_level: 'medium', flow_rate_per_min: 32, current_queue_size: 250 },
            { id: 'gate-2', name: 'Gate B (East Entrance)', status: 'congested', wait_time_minutes: 22, density_level: 'high', flow_rate_per_min: 18, current_queue_size: 750 },
            { id: 'gate-3', name: 'Gate C (South Entrance)', status: 'normal', wait_time_minutes: 4, density_level: 'low', flow_rate_per_min: 40, current_queue_size: 80 }
          ]
        },
        parking_status: {
          lots: [
            { name: "North Lot (General)", capacity: 2500, occupied: 2125, occupancy_rate: 85.0, status: "busy" },
            { name: "East Lot (Transit/Buses)", capacity: 3500, occupied: 3220, occupancy_rate: 92.0, status: "congested" },
            { name: "South Lot (VIP/Staff)", capacity: 1000, occupied: 450, occupancy_rate: 45.0, status: "normal" }
          ],
          total_spaces: 7000,
          total_occupied: 5795,
          overall_occupancy_rate: 82.8
        },
        food_court_queue: {
          concessions: [
            { id: 'concession-1', name: 'Vanguard Stadium Burgers Queue', status: 'congested', wait_time_minutes: 15, density_level: 'high', flow_rate_per_min: 8, current_queue_size: 120 },
            { id: 'concession-2', name: 'Taco Goal Queue', status: 'normal', wait_time_minutes: 5, density_level: 'low', flow_rate_per_min: 15, current_queue_size: 30 }
          ],
          average_wait_time_minutes: 10.0
        },
        emergency_summary: {
          total_active_incidents: 2,
          critical_incidents_count: 1,
          recent_reports: [
            { id: 'incident-101', type: 'medical', severity: 'high', location: 'Section 104, Row 12, Seat 4', description: 'Spectator experiencing heat exhaustion symptoms and dizziness.', status: 'dispatched', reported_at: new Date().toISOString() },
            { id: 'incident-102', type: 'spill_hazard', severity: 'medium', location: 'Concourse near Gate B', description: 'Large beverage spill causing slipping hazard on smooth concrete floor.', status: 'pending', reported_at: new Date().toISOString() }
          ]
        },
        ai_insight: "🚨 **Incident Triage Active**: 2 unresolved alerts (medical at Section 104, Row 12, Seat 4). Dispatching medical personnel. Ensure gate corridors remain clear for emergency responders. 🚦 **Gate B Congestion**: East Entrance wait times have reached 22 minutes. Divert transit arrivals to Gate C (South) where wait time is only 4 minutes.",
        last_updated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Run fetches and register 15-second auto refresh interval
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000); // 15 seconds auto refresh

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase">Loading Operations Console...</span>
        </div>
      </div>
    );
  }

  const { crowd_metrics, parking_status, food_court_queue, emergency_summary, ai_insight, last_updated } = data;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col">
      
      {/* Top Banner Status - Google grey */}
      <div className="bg-white py-2.5 px-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
          <span className="text-slate-500">
            Source: {backendHealthy ? 'Live Command Server' : 'Local Telemetry Sandbox'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 font-semibold">
          <span>Synced: {new Date(last_updated).toLocaleTimeString()}</span>
          <button 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50 text-[10px] font-bold text-slate-700"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Console
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full space-y-8 flex-1">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Operations Command Console</h1>
            <p className="text-xs text-slate-500 mt-1">FIFA World Cup 2026 Telemetries</p>
          </div>
          <Link 
            to="/chat" 
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#E8F0FE] hover:bg-blue-100 text-brand-primary border border-blue-100 flex items-center justify-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
          >
            🤖 Query Command AI
          </Link>
        </div>

        {/* AI Command Advisory banner - Google Cloud Blue info banner style */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-brand-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-brand-primary tracking-wider uppercase">Gemini Operations Insight</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Real-Time Dispatch recommendations</p>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-white border border-blue-100 text-xs text-slate-700 leading-relaxed font-medium">
            {ai_insight ? ai_insight.replace(/\*\*/g, '').replace(/\*/g, '') : ''}
          </div>
        </div>

        {/* Status Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="material-card p-5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Entry queues</span>
              <Users className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{crowd_metrics.total_estimated_queue}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Fans</span>
            </div>
          </div>

          <div className="material-card p-5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Avg Gate Wait</span>
              <Clock className="w-4 h-4 text-brand-secondary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{crowd_metrics.average_wait_time_minutes}m</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Wait</span>
            </div>
          </div>

          <div className="material-card p-5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Congested Gates</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {crowd_metrics.checkpoints_congested_count}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Bottlenecks</span>
            </div>
          </div>

          <div className="material-card p-5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-widest">Parking Lots</span>
              <Navigation className="w-4 h-4 text-brand-secondary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{parking_status.overall_occupancy_rate}%</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Filled</span>
            </div>
          </div>

        </div>

        {/* Content Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2 */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gate Telemetries */}
            <div className="material-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🚪</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Entrance Traffic Status</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[9px] pb-2">
                      <th className="pb-2">Gate Name</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Wait Time</th>
                      <th className="pb-2 text-right">Flow Rate</th>
                      <th className="pb-2 text-right">Queue Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crowd_metrics.gates.map(gate => (
                      <tr key={gate.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-800">{gate.name}</td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${
                            gate.status === 'congested' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {gate.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-slate-800">{gate.wait_time_minutes} min</td>
                        <td className="py-3.5 text-right text-slate-500">{gate.flow_rate_per_min} /min</td>
                        <td className="py-3.5 text-right font-bold text-slate-600">{gate.current_queue_size} fans</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Food Concessions */}
            <div className="material-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🍔</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Concession Wait Times</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {food_court_queue.concessions.map(con => (
                  <div key={con.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800">{con.name.replace(' Queue', '')}</span>
                      <span className="block text-[9px] text-slate-400">Flow: {con.flow_rate_per_min} sales/min</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-slate-800">{con.wait_time_minutes} min wait</span>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        con.status === 'congested' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {con.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Col 3 */}
          <div className="space-y-8">
            
            {/* Parking Deck */}
            <div className="material-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-base">🚘</span>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Parking Deck Load</h3>
              </div>

              <div className="space-y-4">
                {parking_status.lots.map((lot, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{lot.name}</span>
                      <span className="text-slate-400">{lot.occupied}/{lot.capacity} space</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            lot.occupancy_rate >= 90 ? 'bg-rose-500' : lot.occupancy_rate >= 80 ? 'bg-amber-500' : 'bg-brand-secondary'
                          }`}
                          style={{ width: `${lot.occupancy_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{lot.occupancy_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Alerts logs */}
            <div className="material-card p-6 space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚨</span>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">SafeStadium logs</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold">
                  {emergency_summary.total_active_incidents} Active Alerts
                </span>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {emergency_summary.recent_reports.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">All channels clear. No active dispatches.</div>
                ) : (
                  emergency_summary.recent_reports.map(inc => (
                    <div key={inc.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-slate-700 flex items-center gap-1">
                          {inc.severity === 'high' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                          ) : null}
                          {inc.type.replace('_', ' ')}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                          inc.status === 'dispatched' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">{inc.description}</p>
                      <div className="flex justify-between text-[8px] text-slate-400 font-extrabold uppercase">
                        <span>📍 Location: {inc.location}</span>
                        <span>{new Date(inc.reported_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
