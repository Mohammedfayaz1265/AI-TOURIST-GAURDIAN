import React, { useState } from 'react';
import { useCrowd } from '../../context/CrowdContext';
import { useTrips } from '../../context/TripContext';
import {
  MapPin,
  ShieldCheck,
  Hospital,
  Shield,
  Hotel,
  Navigation,
  AlertTriangle,
  Info,
  Layers,
  Compass,
  Sparkles,
} from 'lucide-react';

export const TouristMapView: React.FC = () => {
  const { activeEvent } = useCrowd();
  const { activeTrip } = useTrips();

  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'HOSPITAL' | 'POLICE' | 'HOTEL' | 'ZONE'>('ALL');
  const [routeMode, setRouteMode] = useState<'SAFER' | 'SHORTEST'>('SAFER');

  const pois = [
    { id: 'poi-1', name: 'Tourist Police Station - Central', type: 'POLICE', x: 260, y: 160, status: '24/7 Monitored', phone: '112 / +91 80 2294 2222' },
    { id: 'poi-2', name: 'Emergency Trauma & EMT Post Alpha', type: 'HOSPITAL', x: 480, y: 120, status: 'Rapid Response Ready', phone: '+91 80 2345 1111' },
    { id: 'poi-3', name: 'Grand Heritage Hotel & Convention', type: 'HOTEL', x: 180, y: 320, status: 'Verified Accommodation', phone: '+91 80 2345 6789' },
    { id: 'poi-4', name: 'West Pavilion Green Safe Zone', type: 'ZONE', x: 210, y: 220, status: 'Designated Assembly Point', phone: 'Direct Warden Link' },
    { id: 'poi-5', name: 'North Ghat Aid Post', type: 'HOSPITAL', x: 420, y: 280, status: 'First Aid & Defibrillator', phone: 'EMT Station 3' },
  ];

  const filteredPois = filterType === 'ALL' ? pois : pois.filter((p) => p.type === filterType);

  return (
    <div id="tourist-map-view" className="space-y-6">
      {/* Top Banner / Route Rationale Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 inline mr-1" />
              INTELLIGENT SAFETY GIS ACTIVE
            </span>
            <span className="text-xs text-slate-400">• High-Precision Vector Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            Active Route: {activeTrip?.title || 'Heritage Pilgrimage Circuit'}
          </h2>
          <p className="text-xs text-slate-300">
            {routeMode === 'SAFER'
              ? 'Recommended route based on current safety signals & live crowd avoidance (bypasses Zone C North Ghat).'
              : 'Direct path (passes through high-density bottleneck).'}
          </p>
        </div>

        {/* Route Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setRouteMode('SAFER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              routeMode === 'SAFER'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safer Route</span>
          </button>
          <button
            onClick={() => setRouteMode('SHORTEST')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              routeMode === 'SHORTEST'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Direct (High Risk)</span>
          </button>
        </div>
      </div>

      {/* Map Canvas & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Vector GIS Map Screen */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {/* Map Layer Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Filter Layers:
            </span>
            {(['ALL', 'POLICE', 'HOSPITAL', 'HOTEL', 'ZONE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  filterType === type
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Points' : type}
              </button>
            ))}
          </div>

          {/* SVG Vector Interactive Map */}
          <div className="relative w-full h-96 sm:h-[460px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center select-none">
            <svg
              viewBox="0 0 640 440"
              className="w-full h-full"
              style={{ background: 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' }}
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" opacity="0.4" />
                </pattern>
                <linearGradient id="saferPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect width="640" height="440" fill="url(#grid)" />

              {/* Geographic River & Roads Background */}
              <path
                d="M 500,0 Q 480,180 560,320 T 640,440"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="28"
                opacity="0.3"
              />
              <path
                d="M 500,0 Q 480,180 560,320 T 640,440"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                opacity="0.6"
              />

              {/* Zones Geometric Shapes */}
              {/* Zone A - Green */}
              <polygon
                points="120,60 260,60 290,170 140,170"
                fill="#059669"
                fillOpacity="0.15"
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <text x="150" y="110" fill="#34d399" fontSize="10" fontWeight="bold">
                ZONE A: Courtyard (45%)
              </text>

              {/* Zone B - Yellow */}
              <polygon
                points="290,60 440,60 460,180 290,170"
                fill="#d97706"
                fillOpacity="0.15"
                stroke="#f59e0b"
                strokeWidth="1.5"
              />
              <text x="310" y="110" fill="#fbbf24" fontSize="10" fontWeight="bold">
                ZONE B: Promenade (59%)
              </text>

              {/* Zone C - Orange / High Congestion */}
              <polygon
                points="340,210 490,210 510,340 330,340"
                fill="#ea580c"
                fillOpacity="0.22"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <text x="350" y="270" fill="#fb923c" fontSize="10" fontWeight="bold">
                ZONE C: North Ghat (82% DENSE)
              </text>

              {/* Zone D - Green / Pavilion */}
              <polygon
                points="110,210 280,210 290,340 100,340"
                fill="#059669"
                fillOpacity="0.15"
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <text x="130" y="270" fill="#34d399" fontSize="10" fontWeight="bold">
                ZONE D: West Pavilion (22% SAFE)
              </text>

              {/* NAVIGATION ROUTE PATHS */}
              {routeMode === 'SAFER' ? (
                // Safer Route Path (Bypasses Zone C via Zone D and West Gardens)
                <g>
                  <path
                    d="M 180,320 L 195,240 L 220,180 L 300,160 L 480,120"
                    fill="none"
                    stroke="url(#saferPathGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 180,320 L 195,240 L 220,180 L 300,160 L 480,120"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    className="animate-pulse"
                  />
                </g>
              ) : (
                // Direct Path (Cuts through congested Zone C)
                <g>
                  <path
                    d="M 180,320 L 360,260 L 480,120"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                  />
                </g>
              )}

              {/* POI Markers */}
              {filteredPois.map((poi) => {
                let color = '#38bdf8';
                if (poi.type === 'HOSPITAL') color = '#ef4444';
                if (poi.type === 'POLICE') color = '#3b82f6';
                if (poi.type === 'HOTEL') color = '#8b5cf6';
                if (poi.type === 'ZONE') color = '#10b981';

                const isSelected = selectedPoi === poi.id;

                return (
                  <g
                    key={poi.id}
                    transform={`translate(${poi.x}, ${poi.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedPoi(poi.id)}
                  >
                    <circle r={isSelected ? 14 : 9} fill={color} fillOpacity="0.3" className="animate-ping" />
                    <circle r={isSelected ? 10 : 7} fill={color} stroke="#ffffff" strokeWidth="2" />
                    <text
                      y="-12"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="drop-shadow-md"
                    >
                      {poi.name.split('-')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Current User Marker */}
              <g transform="translate(180, 320)">
                <circle r="12" fill="#06b6d4" fillOpacity="0.4" className="animate-ping" />
                <circle r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <text y="20" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="bold">
                  You (Current Location)
                </text>
              </g>

              {/* Destination Marker */}
              <g transform="translate(480, 120)">
                <circle r="12" fill="#10b981" fillOpacity="0.4" className="animate-ping" />
                <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text y="20" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">
                  Destination (Temple Aid Post)
                </text>
              </g>
            </svg>

            {/* Map Legend Pill overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-[10px] text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Green (Normal)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Yellow (Moderate)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Orange (Bottleneck)
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar POI & Route Details */}
        <div className="space-y-4">
          {/* Active Navigation Metrics */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Turn-by-Turn Safety Guidance</span>
              <Sparkles className="w-4 h-4 text-cyan-500" />
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px]">Estimated Distance & Time</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  1.2 km • 14 min walk
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] block mt-0.5">
                  100% Green Safe Zone Coverage
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 block text-[10px]">Next Safe Waypoint</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Turn Left onto Garden Link towards West Handicrafts Pavilion (Gate D).
                </span>
              </div>
            </div>
          </div>

          {/* Selected Marker Details Card */}
          {selectedPoi && (
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-3xl p-5 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400">Selected Facility</span>
              {(() => {
                const item = pois.find((p) => p.id === selectedPoi);
                if (!item) return null;
                return (
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    <p className="text-slate-300 mt-1">{item.status}</p>
                    <p className="font-mono text-cyan-300 mt-1">📞 {item.phone}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
