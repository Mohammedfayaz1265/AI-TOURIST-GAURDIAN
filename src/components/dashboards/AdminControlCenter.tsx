import React, { useState } from 'react';
import { useTrips } from '../../context/TripContext';
import { useCrowd } from '../../context/CrowdContext';
import { useIncidents } from '../../context/IncidentContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Sliders,
  Play,
  RotateCcw,
  Radio,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Server,
  Sparkles,
} from 'lucide-react';

export const AdminControlCenter: React.FC = () => {
  const { reminderState, simulateSchedulerStep, resetReminderSimulation } = useTrips();
  const { updateZoneFlow, activeEvent } = useCrowd();
  const { createIncident } = useIncidents();
  const { smsLogs } = useNotifications();

  const [simMessage, setSimMessage] = useState<string | null>(null);

  const handleAdvanceScheduler = () => {
    simulateSchedulerStep(true);
    setSimMessage('Advanced 24-hour reminder simulation to next stage/retry.');
    setTimeout(() => setSimMessage(null), 4000);
  };

  const handleResetScheduler = () => {
    resetReminderSimulation();
    setSimMessage('Reset 24-hour reminder simulation.');
    setTimeout(() => setSimMessage(null), 4000);
  };

  const handleSimulateCrowdSurge = async () => {
    if (!activeEvent) return;
    await updateZoneFlow(activeEvent.id, 'zone-c', 1800, 520, 90);
    setSimMessage('Simulated crowd surge in Zone C (North Ghat). Risk score recalculated to RED.');
    setTimeout(() => setSimMessage(null), 4000);
  };

  const handleSimulateSos = async () => {
    await createIncident({
      type: 'SOS',
      severity: 'CRITICAL',
      locationDescription: 'North Temple Promenade Gate B',
      description: 'TEST EMERGENCY: Rapid incident generated via Admin Simulation Center.',
      latitude: 12.9716,
      longitude: 77.5946,
    });
    setSimMessage('Simulated Critical Emergency SOS broadcasted to authority dispatch.');
    setTimeout(() => setSimMessage(null), 4000);
  };

  return (
    <div id="admin-control-center" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              SYSTEM EVALUATION & SIMULATION RUNNER
            </span>
            <span className="text-xs text-slate-400">• Judge / SIH Demonstration Suite</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            System Administration & Simulation Engine
          </h1>
          <p className="text-xs text-slate-400">
            Trigger automated workflows, advance asynchronous schedules, and inspect live SMS/Push pipelines.
          </p>
        </div>
      </div>

      {simMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{simMessage}</span>
        </div>
      )}

      {/* Simulation Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. 24-Hour Trip End Safety Automation Simulator */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                24-Hour Trip-End Safety Schedule Runner
              </h3>
              <p className="text-[11px] text-slate-400">
                Advances the 24h &rarr; 2h Retry 1 &rarr; 2h Retry 2 &rarr; Escalation sequence.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Stage:</span>
              <span className="font-bold text-cyan-400">{reminderState.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Attempt Count:</span>
              <span className="font-bold text-white">{reminderState.attemptCount} / 3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tourist Responded:</span>
              <span className={`font-bold ${reminderState.touristResponded ? 'text-emerald-400' : 'text-amber-400'}`}>
                {reminderState.touristResponded ? `YES (${reminderState.responseType})` : 'NO (Awaiting Response)'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdvanceScheduler}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Advance Next Cycle</span>
            </button>
            <button
              onClick={handleResetScheduler}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Rapid Incident & Crowd Spike Simulation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Emergency & Dynamic Crowd Trigger
              </h3>
              <p className="text-[11px] text-slate-400">
                Generates live operational state changes for judge demonstration.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleSimulateCrowdSurge}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Simulate Zone C Crowd Surge (Triggers RED Alert)</span>
            </button>

            <button
              onClick={handleSimulateSos}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Radio className="w-4 h-4" />
              <span>Trigger Test SOS Emergency Dispatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live SMS & Notification Dispatch Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Outbound SMS & Notification Dispatch Logs</span>
          <span className="text-xs text-slate-400 font-normal">Real-Time Adapter Monitor</span>
        </h3>

        <div className="space-y-2">
          {smsLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{log.recipient}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500">
                    {log.type}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">"{log.message}"</p>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {log.deliveryStatus}
                </span>
                <span>{new Date(log.sentAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
