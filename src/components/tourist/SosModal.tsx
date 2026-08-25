import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useAuth } from '../../context/AuthContext';
import { AlertOctagon, Radio, ShieldAlert, X, CheckCircle2, Phone, MapPin, Clock } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const { createIncident, activeSosIncident } = useIncidents();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<'CONFIRM' | 'COUNTDOWN' | 'ACTIVE'>('CONFIRM');
  const [countdown, setCountdown] = useState(5);
  const [incidentType, setIncidentType] = useState<'SOS' | 'MEDICAL' | 'SAFETY' | 'MISSING_PERSON'>('SOS');
  const [locationNote, setLocationNote] = useState('Central Festival Plaza, Karnataka');

  if (!isOpen) return null;

  const startCountdown = () => {
    setStep('COUNTDOWN');
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelFlow = () => {
    setStep('CONFIRM');
    setCountdown(5);
    onClose();
  };

  const triggerSos = async () => {
    setStep('ACTIVE');
    await createIncident({
      type: incidentType,
      severity: 'CRITICAL',
      locationDescription: locationNote,
      description: `Immediate emergency SOS triggered by ${currentUser?.name}. Incident routed to Tourist Police and Medical Command Dispatch.`,
      latitude: 12.9716,
      longitude: 77.5946,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-600 text-white rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Confirmation & Context Selection */}
        {step === 'CONFIRM' && !activeSosIncident && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500">
                <AlertOctagon className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  EMERGENCY SOS ASSISTANCE
                </h2>
                <p className="text-xs text-slate-400">
                  Instant internal alert routing to Tourist Police & EMT Response Teams
                </p>
              </div>
            </div>

            {/* Honest Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Transparency Notice
              </p>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Triggering SOS creates a real operational incident in the authority dashboard. External 112 police/ambulance dispatch is intentionally simulated in this development sandbox.
              </p>
            </div>

            {/* Emergency Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Emergency Nature:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'SOS', label: 'General SOS', icon: Radio },
                  { id: 'MEDICAL', label: 'Medical Emergency', icon: Phone },
                  { id: 'SAFETY', label: 'Harassment / Threat', icon: ShieldAlert },
                  { id: 'MISSING_PERSON', label: 'Missing Traveller', icon: MapPin },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIncidentType(item.id as any)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition ${
                      incidentType === item.id
                        ? 'bg-rose-600/20 border-rose-500 text-white shadow-xs'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-rose-400" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Current Location Description:</label>
              <input
                type="text"
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                CANCEL
              </button>
              <button
                id="confirm-sos-button"
                type="button"
                onClick={startCountdown}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>ACTIVATE SOS</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Countdown */}
        {step === 'COUNTDOWN' && (
          <div className="py-6 text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-rose-600/20 border-4 border-rose-600 flex items-center justify-center text-4xl font-black text-rose-400 animate-pulse">
              {countdown}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">
                BROADCASTING EMERGENCY INCIDENT...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sharing real-time GPS coordinates and Safety Passport profile with Tourist Police Command.
              </p>
            </div>
            <button
              onClick={cancelFlow}
              className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition shadow-md"
            >
              CANCEL (FALSE ALARM)
            </button>
          </div>
        )}

        {/* STEP 3: Active Incident State */}
        {(step === 'ACTIVE' || activeSosIncident) && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 block">
                    EMERGENCY INCIDENT ACTIVE
                  </span>
                  <span className="text-base font-black text-white">
                    Incident #{activeSosIncident?.id || 'INC-LIVE'}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black">
                {activeSosIncident?.status || 'CREATED'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" /> Broadcasted:
                </span>
                <span className="font-mono text-white">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> Location:
                </span>
                <span className="font-semibold text-white">
                  {activeSosIncident?.locationDescription || locationNote}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Assigned Unit:
                </span>
                <span className="font-semibold text-cyan-300">
                  {activeSosIncident?.assignedResponderName || 'Tourist Police Quick Response Alpha'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" /> Escalation Level:
                </span>
                <span className="font-bold text-emerald-400">
                  Level {activeSosIncident?.escalationLevel || 1} (Command Monitored)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Stay in a well-lit Green Safe Zone if possible. Responders can track your location in real time.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              KEEP TRACKING IN BACKGROUND
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
