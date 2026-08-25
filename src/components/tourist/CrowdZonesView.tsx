import React from 'react';
import { useCrowd } from '../../context/CrowdContext';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CrowdZonesView: React.FC = () => {
  const { activeEvent, predictionCurve } = useCrowd();

  const zones = activeEvent?.zones || [];

  return (
    <div id="crowd-zones-view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-500" />
          Crowd Intelligence & Live Zone Density
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Predictive arrival demand modeling, capacity scoring & automated alternate gate recommendations.
        </p>
      </div>

      {/* Live Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const densityPercent = Math.round(zone.densityRatio * 100);

          let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
          let barColor = 'bg-emerald-500';
          let actionMessage = 'Normal crowd movement. All entry gates open.';

          if (zone.status === 'YELLOW') {
            statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            barColor = 'bg-amber-500';
            actionMessage = 'Moderate density. Recommend alternate West Pavilion Gate D.';
          } else if (zone.status === 'ORANGE') {
            statusColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
            barColor = 'bg-orange-500';
            actionMessage = 'High congestion. Movement restriction advisory active. Ingress throttled.';
          } else if (zone.status === 'RED') {
            statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            barColor = 'bg-rose-500';
            actionMessage = 'CRITICAL OVERPRESSURE. Predefined crowd-control protocol initiated.';
          }

          return (
            <div
              key={zone.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {zone.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Capacity: {zone.capacity.toLocaleString()} visitors
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border uppercase ${statusColor}`}
                >
                  {zone.status} • {densityPercent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, densityPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Current: {zone.currentCount.toLocaleString()}</span>
                  <span>Inflow: +{zone.entryFlow}/min | Outflow: -{zone.exitFlow}/min</span>
                </div>
              </div>

              {/* Action Recommendation Box */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Action Protocol:
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {actionMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 8-Hour Arrival Demand Prediction Curve */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                8-Hour Predictive Arrival Demand Curve
              </h2>
              <p className="text-xs text-slate-400">
                Machine-learning projected density based on historical festival attendance curves.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3 h-3" /> Real-Time Modeling
          </span>
        </div>

        {/* Prediction Points Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {predictionCurve.map((pt, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center space-y-1.5"
            >
              <span className="text-xs font-mono font-bold text-slate-400 block">
                {pt.timeLabel}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white block">
                {Math.round(pt.expectedDensityRatio * 100)}%
              </span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  pt.riskStatus === 'RED'
                    ? 'bg-rose-500/20 text-rose-400'
                    : pt.riskStatus === 'ORANGE'
                    ? 'bg-orange-500/20 text-orange-400'
                    : pt.riskStatus === 'YELLOW'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {pt.riskStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
