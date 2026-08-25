import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useTrips } from '../../context/TripContext';
import { useCrowd } from '../../context/CrowdContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_HOTELS } from '../../lib/sampleData';
import {
  ShieldAlert,
  Radio,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Send,
  Building,
  Users,
  MapPin,
  Bot,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AuthorityDashboard: React.FC = () => {
  const {
    incidents,
    acknowledgeIncident,
    escalateIncident,
    closeIncident,
    generateAiIncidentSummary,
  } = useIncidents();
  const { reminderState, performManualFollowupAction, activeTrip } = useTrips();
  const { createAlert, activeEvent } = useCrowd();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'TRIP_FOLLOWUPS' | 'BROADCAST' | 'HOTELS'>('INCIDENTS');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastType, setBroadcastType] = useState<'CROWD' | 'WEATHER' | 'ROAD' | 'EMERGENCY'>('CROWD');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [broadcastLocation, setBroadcastLocation] = useState('Central Festival Sector');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleAiSummary = async (incidentId: string) => {
    setIsAiLoading(true);
    const res = await generateAiIncidentSummary(incidentId);
    setAiSummary(res.summary);
    setIsAiLoading(false);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAlert({
      title: broadcastTitle,
      description: broadcastDesc,
      type: broadcastType,
      severity: broadcastSeverity,
      location: broadcastLocation,
    });
    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastDesc('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  return (
    <div id="authority-dashboard" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              POLICE & AUTHORITY INCIDENT COMMAND
            </span>
            <span className="text-xs text-slate-400">• Real-Time Dispatch Mode</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Tourism Safety Operational Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Field responder coordination, live SOS escalation, 24h trip-end followups & advisory broadcasts.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'INCIDENTS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Incidents ({incidents.filter((i) => i.status !== 'CLOSED').length})
          </button>
          <button
            onClick={() => setActiveTab('TRIP_FOLLOWUPS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'TRIP_FOLLOWUPS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            24h Trip Followups
          </button>
          <button
            onClick={() => setActiveTab('BROADCAST')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'BROADCAST' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Alert Broadcast
          </button>
          <button
            onClick={() => setActiveTab('HOTELS')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'HOTELS' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verified Hotels
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE INCIDENT QUEUE */}
      {activeTab === 'INCIDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Operational Incident Dispatch Queue</span>
              <span className="text-xs text-slate-400">Sorted by Severity</span>
            </h2>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition shadow-sm space-y-4 ${
                    inc.severity === 'CRITICAL'
                      ? 'border-rose-500/50 bg-rose-50/10 dark:bg-rose-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500">
                        <AlertOctagon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            Incident #{inc.id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {inc.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Reported by: <span className="font-bold text-slate-700 dark:text-slate-300">{inc.touristName}</span> ({inc.touristPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Level {inc.escalationLevel || 1} • {inc.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-cyan-500" /> {inc.locationDescription}
                    </span>
                    <span className="text-cyan-400 font-semibold text-[11px]">
                      Assigned: {inc.assignedResponderName || 'Tourist Police Ready'}
                    </span>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    {inc.status === 'CREATED' && (
                      <button
                        onClick={() => acknowledgeIncident(inc.id, 'Inspector V. Kumar (Tourist Police)')}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition"
                      >
                        Acknowledge & Assign Unit
                      </button>
                    )}

                    <button
                      onClick={() => escalateIncident(inc.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                    >
                      Escalate Priority (Level +1)
                    </button>

                    <button
                      onClick={() => handleAiSummary(inc.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition border border-slate-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Synthesize AI Brief</span>
                    </button>

                    {inc.status !== 'CLOSED' && (
                      <button
                        onClick={() => closeIncident(inc.id, 'Field unit resolved incident. Tourist reported safe.')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition ml-auto"
                      >
                        Resolve & Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Incident Briefing Panel */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Guardian AI Tactical Briefing
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Operational tactical brief synthesized by Gemini 2.5 Flash for field responders.
              </p>

              {isAiLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <span className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                  <p>Synthesizing operational context & hazard mapping...</p>
                </div>
              ) : aiSummary ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono">
                  {aiSummary}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  Select "Synthesize AI Brief" on any incident above.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 24H TRIP END MANUAL FOLLOWUPS */}
      {activeTab === 'TRIP_FOLLOWUPS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                24-Hour Trip-End Automated Escalation Queue
              </h2>
              <p className="text-xs text-slate-400">
                Trips where the tourist has not confirmed safety after scheduled 24h reminders.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Active Protocol Monitored
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-500 block">
                  TRIP: {activeTrip?.title || 'Heritage Pilgrimage'}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Tourist: Fayaz Mohammed (+91 98765 43210)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                Stage: {reminderState.stage} (Attempts: {reminderState.attemptCount}/3)
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Planned trip scheduled end time is in 24 hours. Primary contact: <span className="font-bold">Amina Mohammed (+91 98450 11223)</span>.
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
              <a
                href="tel:+919845011223"
                onClick={() => performManualFollowupAction('CALLED')}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency Contact</span>
              </a>

              <button
                onClick={() => performManualFollowupAction('RESOLVED_SAFE')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Verified Safe</span>
              </button>

              {reminderState.manualFollowupActionTaken && (
                <span className="text-xs font-bold text-emerald-400 ml-auto">
                  Action Taken: {reminderState.manualFollowupActionTaken}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST SAFETY ALERT */}
      {activeTab === 'BROADCAST' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Broadcast Official Safety Advisory
          </h2>
          <p className="text-xs text-slate-400">
            Publish high-priority geo-targeted alerts to all tourist mobile clients and organizer dashboards.
          </p>

          {broadcastSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Safety alert broadcasted successfully and logged to Immutable Audit Trail.</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Advisory Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. High Crowd Divergence near Gate B"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alert Category
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="CROWD">Crowd Bottleneck</option>
                  <option value="WEATHER">Weather Advisory</option>
                  <option value="ROAD">Road / Shuttle Diversion</option>
                  <option value="EMERGENCY">Emergency Notice</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Severity Priority
                </label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="LOW">Low (Informational)</option>
                  <option value="MODERATE">Moderate Caution</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Zone / Location
              </label>
              <input
                type="text"
                required
                value={broadcastLocation}
                onChange={(e) => setBroadcastLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Detailed Safety Instructions
              </label>
              <textarea
                rows={3}
                required
                placeholder="Specific guidance for tourists (e.g. proceed to Gate D, shuttle pickup at Station 2)..."
                value={broadcastDesc}
                onChange={(e) => setBroadcastDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-cyan-600/30 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Safety Alert Now</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: VERIFIED HOTELS */}
      {activeTab === 'HOTELS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            State Verified Hotel & Accommodation Registry
          </h2>
          <p className="text-xs text-slate-400">
            Monitored establishments with verified safety licenses, CCTV infrastructure, and emergency protocols.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {INITIAL_HOTELS.map((hotel) => (
              <div
                key={hotel.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {hotel.verificationStatus}
                  </span>
                  <span className="font-bold text-amber-500">★ {hotel.rating}</span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{hotel.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{hotel.address}</p>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div>License: {hotel.licenseNumber}</div>
                  <div>Phone: {hotel.contactPhone}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
                  Facilities: {hotel.safetyFacilities.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
