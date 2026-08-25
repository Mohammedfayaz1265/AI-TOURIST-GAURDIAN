import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { useCrowd } from '../../context/CrowdContext';
import { useIncidents } from '../../context/IncidentContext';
import { SosModal } from './SosModal';
import {
  ShieldCheck,
  AlertOctagon,
  Radio,
  MapPin,
  Calendar,
  Compass,
  FileText,
  PhoneCall,
  Bell,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Hotel,
  ArrowRight,
  Clock,
  Shield,
} from 'lucide-react';

interface TouristHomeViewProps {
  onNavigate: (tab: string) => void;
}

export const TouristHomeView: React.FC<TouristHomeViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { activeTrip, reminderState, respondToTripReminder } = useTrips();
  const { alerts, activeEvent } = useCrowd();
  const { activeSosIncident } = useIncidents();

  const [isSosOpen, setIsSosOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeAlert = alerts[0];

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiQuestion,
          language: currentUser?.preferredLanguage || 'en',
          userContext: {
            destination: activeTrip?.destination || activeTrip?.title || 'Heritage Sector',
            tripStatus: activeTrip?.status || 'PLANNED',
            currentRisk: 'LOW',
          },
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || 'Safe travel advice received.');
    } catch {
      setAiResponse('Guardian AI is operational. Please stay in verified green safe zones and contact 112 for immediate emergencies.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div id="tourist-home-view" className="space-y-6 max-w-5xl mx-auto">
      {/* 1. SAFETY STATUS HERO & SOS BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>SAFETY STATUS: NORMAL (LOW RISK)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome, {currentUser?.name?.split(' ')[0] || 'Traveller'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Active Sector: Central Festival Plaza & Temple Precinct</span>
            </p>
          </div>

          {/* Persistent High-Contrast SOS Emergency Button */}
          <div className="flex flex-col items-center sm:items-end">
            <button
              id="hero-sos-trigger-button"
              onClick={() => setIsSosOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-sm tracking-wider uppercase transition shadow-xl shadow-rose-600/40 flex items-center justify-center gap-3 border border-rose-400/40 active:scale-95 cursor-pointer"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>EMERGENCY SOS</span>
            </button>
            <span className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Direct dispatch to Tourist Police & EMT
            </span>
          </div>
        </div>

        {/* Active SOS Tracker Alert if active */}
        {activeSosIncident && (
          <div className="p-4 rounded-2xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />
              <div>
                <span className="font-bold text-xs text-white block">
                  Incident #{activeSosIncident.id} is Active
                </span>
                <span className="text-[11px] text-rose-300">
                  Status: {activeSosIncident.status} • Responders Dispatched
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSosOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              View Dispatch
            </button>
          </div>
        )}
      </div>

      {/* 2. 24-HOUR TRIP END SAFETY AUTOMATION BANNER */}
      {activeTrip && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
                  Automated Safety Schedule
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  24-Hour Planned Trip-End Safety Verification
                </h3>
              </div>
            </div>

            {reminderState.touristResponded ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Response Logged ({reminderState.responseType})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                <Clock className="w-3.5 h-3.5" /> Action Required (Prompt Active)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            "Your planned trip ({activeTrip.title}) ends in 24 hours. Are you safe and on schedule?"
          </p>

          {!reminderState.touristResponded && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                id="home-safe-btn"
                onClick={() => respondToTripReminder('SAFE')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I'M SAFE & ON SCHEDULE</span>
              </button>
              <button
                id="home-help-btn"
                onClick={() => respondToTripReminder('NEED_HELP')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span>NEED HELP</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. QUICK ACTION DASHBOARD TOOLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('MAP')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition shadow-xs group"
        >
          <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 w-fit mb-2 group-hover:scale-110 transition">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Safety GIS Map
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Safer routing & safe zones</p>
        </button>

        <button
          onClick={() => onNavigate('CROWD')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition shadow-xs group"
        >
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 w-fit mb-2 group-hover:scale-110 transition">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Crowd Intelligence
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Zone densities & alternate gates</p>
        </button>

        <button
          onClick={() => onNavigate('DOCUMENTS')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition shadow-xs group"
        >
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 w-fit mb-2 group-hover:scale-110 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Document Vault
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Encrypted ID & Visa proofs</p>
        </button>

        <button
          onClick={() => onNavigate('CONTACTS')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition shadow-xs group"
        >
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit mb-2 group-hover:scale-110 transition">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Emergency Contacts
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified next-of-kin setup</p>
        </button>
      </div>

      {/* 4. LIVE ADVISORIES & GUARDIAN AI COPILOT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Advisory Highlight */}
        {activeAlert && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Safety Advisory
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {activeAlert.type} • {activeAlert.severity}
              </span>
            </div>

            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
              {activeAlert.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeAlert.description}
            </p>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Source: {activeAlert.source}</span>
              <button
                onClick={() => onNavigate('ALERTS')}
                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>View All Alerts</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* AI Tourist Guardian Assistant Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AI Tourist Guardian Assistant</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Context-aware safety advisories, cultural etiquette & translations.
              </p>
            </div>
          </div>

          <form onSubmit={handleAskAi} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask safety questions (e.g. 'Is Zone C safe right now?')"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={isAiLoading}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isAiLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {aiResponse && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Guardian AI Response:</p>
              <p>{aiResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* SOS Modal */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </div>
  );
};
