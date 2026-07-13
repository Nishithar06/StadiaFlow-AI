import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Search, Compass, Clock, Accessibility, ShieldAlert, Navigation as NavIcon, 
  MapPin, CheckCircle, Info, ArrowRight, Activity, MessageSquare, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navigation() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [backendHealthy, setBackendHealthy] = useState(false);

  const navigate = useNavigate();

  // Load navigation locations
  const fetchNavigationData = async () => {
    try {
      const data = await api.getNavigation();
      setLocations(data);
      setSelectedLoc(data[0] || null);
      setBackendHealthy(true);
    } catch (err) {
      console.warn('FastAPI backend offline. Rendering simulated navigation telemetry.', err);
      setBackendHealthy(false);
      
      const mockData = [
        { id: 'gate-1', name: 'Gate A (North Entrance)', type: 'gate', section: '101', description: 'Main entrance from North Parking lot. High accessibility.', amenities: ['Ticket Office', 'Security Checkpoint'], walking_time_mins: 2 },
        { id: 'gate-2', name: 'Gate B (East Entrance)', type: 'gate', section: '115', description: 'Entrance adjacent to transit station. Highest flow rate.', amenities: ['Bag Drop', 'Security Checkpoint'], walking_time_mins: 10 },
        { id: 'gate-3', name: 'Gate C (South Entrance)', type: 'gate', section: '128', description: 'Entrance from South VIP parking.', amenities: ['VIP check-in', 'Security Checkpoint'], walking_time_mins: 8 },
        { id: 'concession-1', name: 'Vanguard Stadium Burgers', type: 'concession', section: '108', description: 'Gourmet burgers, fries, and drafts.', amenities: ['Mobile Ordering', 'Card Only'], walking_time_mins: 5 },
        { id: 'concession-2', name: 'Taco Goal', type: 'concession', section: '124', description: 'Authentic street tacos, nachos, and soft drinks.', amenities: ['Cash & Card Accepted'], walking_time_mins: 9 },
        { id: 'restroom-1', name: 'Level 1 Restrooms (North)', type: 'restroom', section: '105', description: 'Male, female, and gender-neutral facilities.', amenities: ['Baby Changing Station', 'Accessible'], walking_time_mins: 4 },
        { id: 'restroom-2', name: 'Level 1 Restrooms (South)', type: 'restroom', section: '126', description: 'Male, female, and family restrooms.', amenities: ['Accessible'], walking_time_mins: 8 },
        { id: 'first-aid-1', name: 'Main First Aid Station', type: 'first_aid', section: '112', description: 'Fully staffed medical bay for emergency care.', amenities: ['Defibrillator', 'Triage Room', 'Ambulance Access'], walking_time_mins: 7 },
        { id: 'parking-north', name: 'North Lot (General Parking)', type: 'parking', section: '101', description: 'Main lot for general spectators. Access to Gate A.', amenities: ['Electric Charging', 'Accessible Parking'], walking_time_mins: 2 },
        { id: 'parking-east', name: 'East Lot (Transit Hub / Bus Deck)', type: 'parking', section: '115', description: 'Adjacent to public shuttle terminals and coach slots.', amenities: ['Shuttle pickup', 'Restrooms'], walking_time_mins: 10 },
        { id: 'access-ramps-102', name: 'Accessible Ramp Section 102', type: 'accessibility', section: '102', description: 'Stroller and wheelchair accessible ramps to lower concourse.', amenities: ['Tactile paving', 'Stroller parking'], walking_time_mins: 3 },
        { id: 'access-elevators-112', name: 'Concourse Elevators Level 1/2', type: 'accessibility', section: '112', description: 'Dual elevators providing wheelchair access to upper hospitality tiers.', amenities: ['Audio announcements', 'Braille indicators'], walking_time_mins: 7 }
      ];
      setLocations(mockData);
      setSelectedLoc(mockData[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNavigationData();
  }, []);

  // Filter & Search handler
  const filteredLocations = locations.filter(loc => {
    const matchesSearch = 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      loc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.section.includes(searchQuery);

    const matchesType = activeFilter === 'all' || 
      (activeFilter === 'food' && loc.type === 'concession') ||
      (activeFilter === 'medical' && loc.type === 'first_aid') ||
      loc.type === activeFilter;

    return matchesSearch && matchesType;
  });

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'gate': return '🚪';
      case 'restroom': return '🚻';
      case 'concession': return '🍔';
      case 'first_aid': return '🏥';
      case 'parking': return '🚘';
      case 'accessibility': return '♿';
      default: return '📍';
    }
  };

  // Helper to resolve coordinates on SVG relative to seat sections
  const getCoordinatesForLocation = (section, type) => {
    try {
      const secVal = parseInt(section);
      if (isNaN(secVal)) return { cx: 200, cy: 200 };
      
      // Calculate angle from section number (101 to 130 maps to 0 to 360 degrees)
      const angle = ((secVal - 101) / 30) * 2 * Math.PI - Math.PI / 2;
      
      // Outer ring for gates/parking, middle ring for concessions/amenities
      let radius = 110;
      if (type === 'parking') radius = 160;
      if (type === 'gate') radius = 135;
      if (type === 'concession' || type === 'first_aid') radius = 85;
      if (type === 'restroom') radius = 85;
      if (type === 'accessibility') radius = 60;
      
      const cx = 200 + radius * Math.cos(angle);
      const cy = 200 + radius * Math.sin(angle);
      return { cx, cy };
    } catch {
      return { cx: 200, cy: 200 };
    }
  };

  const handleAskAI = (loc) => {
    const prompt = `Tell me details, location, and walking directions for ${loc.name} located in Section ${loc.section}.`;
    navigate(`/chat?query=${encodeURIComponent(prompt)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-xs font-semibold tracking-wider uppercase">Loading Stadium Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-855 flex flex-col">
      
      {/* Top Banner Status */}
      <div className="bg-white py-2.5 px-6 border-b border-gray-200 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className="text-slate-500">
            Map Mode: {backendHealthy ? 'Connected to command telemetry' : 'Offline/Simulated telemetry'}
          </span>
        </div>
        <div className="text-slate-400 font-bold uppercase tracking-wider hidden sm:block text-[10px]">
          Interactive Navigation System
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full space-y-8 flex-1">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Stadium Directories & Wayfinding</h1>
          <p className="text-xs text-slate-500 mt-1">FIFA World Cup 2026 Concourse Map</p>
        </div>

        {/* Search & Quick Filters */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gates, food concessions, seating sections, restrooms..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-primary placeholder-slate-400 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Locations' },
              { id: 'gate', label: 'Gates' },
              { id: 'restroom', label: 'Restrooms' },
              { id: 'food', label: 'Food / Concessions' },
              { id: 'first_aid', label: 'Medical Centers' },
              { id: 'parking', label: 'Parking Lots' },
              { id: 'accessibility', label: 'Accessibility Points' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeFilter === filter.id 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Interactive SVG Stadium Map Card */}
          <div className="lg:col-span-2 material-card p-6 flex flex-col items-center justify-center min-h-[420px]">
            <div className="text-center mb-4 space-y-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-primary" /> Interactive Concourse Map
              </h3>
              <p className="text-[10px] text-slate-500">Click on nodes to query amenities and walk times</p>
            </div>

            {/* Circular Stadium SVG Diagram */}
            <div className="w-full max-w-[380px] aspect-square relative">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* External Parking boundaries */}
                <circle cx="200" cy="200" r="160" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="5 5" />
                
                {/* Stadium Concourse Ring */}
                <circle cx="200" cy="200" r="110" fill="none" stroke="#DADCE0" strokeWidth="24" className="opacity-90" />
                <circle cx="200" cy="200" r="110" fill="none" stroke="#F1F3F4" strokeWidth="20" />
                
                {/* Seating Pitch Center */}
                <rect x="150" y="140" width="100" height="120" rx="6" fill="#E8F0FE" stroke="#1A73E8" strokeWidth="2" />
                <circle cx="200" cy="200" r="24" fill="none" stroke="#1A73E8" strokeWidth="1.5" />
                <line x1="150" y1="200" x2="250" y2="200" stroke="#1A73E8" strokeWidth="1.5" />

                {/* Draw Seating Sector Divider guidelines */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angleDeg => {
                  const angle = (angleDeg * Math.PI) / 180;
                  return (
                    <line 
                      key={angleDeg}
                      x1={200 + 98 * Math.cos(angle)} 
                      y1={200 + 98 * Math.sin(angle)} 
                      x2={200 + 122 * Math.cos(angle)} 
                      y2={200 + 122 * Math.sin(angle)} 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                    />
                  );
                })}

                {/* Plot locations dynamically as interactive hot-spots */}
                {filteredLocations.map(loc => {
                  const { cx, cy } = getCoordinatesForLocation(loc.section, loc.type);
                  const isSelected = selectedLoc && selectedLoc.id === loc.id;
                  
                  // Color codes for node category
                  let nodeColor = '#90A4AE'; // Slate
                  if (loc.type === 'gate') nodeColor = '#1A73E8'; // Google Blue
                  if (loc.type === 'concession') nodeColor = '#F5B041'; // Gold Concessions
                  if (loc.type === 'restroom') nodeColor = '#34495E';
                  if (loc.type === 'first_aid') nodeColor = '#E74C3C'; // Red medical
                  if (loc.type === 'parking') nodeColor = '#5DADE2';
                  if (loc.type === 'accessibility') nodeColor = '#34A853'; // Google Green

                  return (
                    <g 
                      key={loc.id} 
                      onClick={() => setSelectedLoc(loc)}
                      className="cursor-pointer group"
                    >
                      {/* Highlight Outer ring */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isSelected ? 13 : 9} 
                        fill={nodeColor} 
                        fillOpacity={isSelected ? 0.35 : 0.15}
                        className="transition-all duration-200 group-hover:scale-125"
                      />
                      {/* Core Node dot */}
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isSelected ? 6 : 4.5} 
                        fill={nodeColor}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                        className="transition-all duration-200"
                      />
                      {/* Hover Tooltip name */}
                      <title>{loc.name} (Sec {loc.section})</title>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* SVG Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]"></span> Gates</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F5B041]"></span> Concessions</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]"></span> First Aid</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#34A853]"></span> Accessibility</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#5DADE2]"></span> Parking</span>
            </div>
          </div>

          {/* Details Sidebar Panel (Right Column) */}
          <div className="space-y-6 flex flex-col">
            
            {/* Selected Location Card */}
            {selectedLoc ? (
              <div className="material-card p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Category: {selectedLoc.type.replace('_', ' ')}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        {getCategoryIcon(selectedLoc.type)} {selectedLoc.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                      Section {selectedLoc.section}
                    </span>
                  </div>

                  {/* Walking Time Badge */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4 text-brand-primary" /> Estimated Walk:
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {selectedLoc.walking_time_mins} minutes (from Gate A)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Description</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {selectedLoc.description}
                    </p>
                  </div>

                  {selectedLoc.amenities && selectedLoc.amenities.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Services Available</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLoc.amenities.map((amenity, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-[#F1F3F4] text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Assistant context redirection */}
                <button
                  onClick={() => handleAskAI(selectedLoc)}
                  className="w-full py-3 rounded-lg font-bold bg-brand-primary hover:bg-blue-600 text-white text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 mt-6"
                >
                  <MessageSquare className="w-4 h-4" /> Ask AI about this location
                </button>
              </div>
            ) : (
              <div className="material-card p-6 flex items-center justify-center text-xs text-slate-400 flex-1">
                Select a node on the stadium map or list to view directions and walking times.
              </div>
            )}

            {/* Results Sidebar Scroll List */}
            <div className="material-card p-4 space-y-3 max-h-[300px] overflow-y-auto">
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2">Matches ({filteredLocations.length})</h4>
              <div className="space-y-1">
                {filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex justify-between items-center transition-colors ${
                      selectedLoc && selectedLoc.id === loc.id 
                        ? 'bg-slate-100 border border-slate-200 font-bold text-slate-900' 
                        : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                    }`}
                  >
                    <span>{getCategoryIcon(loc.type)} {loc.name}</span>
                    <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-bold">Sec {loc.section}</span>
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">No match found.</div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
