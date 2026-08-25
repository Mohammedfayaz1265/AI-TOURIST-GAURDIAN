import React, { useState } from 'react';
import { useCrowd } from '../../context/CrowdContext';
import { AlertType, AlertSeverity } from '../../types';
import {
  Bell,
  AlertTriangle,
  CloudRain,
  Users,
  Compass,
  Radio,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';

export const AlertsFeedView: React.FC = () => {
  const { alerts } = useCrowd();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | AlertType>('ALL');

  const filteredAlerts =
    selectedFilter === 'ALL' ? alerts : alerts.filter((a) => a.type === selectedFilter);

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'CROWD':
        return Users;
      case 'WEATHER':
        return CloudRain;
      case 'ROAD':
        return Compass;
      case 'EMERGENCY':
        return AlertTriangle;
      default:
        return Radio;
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div id="alerts-feed-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-500" />
            Official Live Safety Advisories & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time verified broadcasts from Tourist Police, Tourism Authority & Meteorological Command.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(['ALL', 'CROWD', 'WEATHER', 'ROAD', 'EMERGENCY'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedFilter === type
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Alerts' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              No Active Alerts in this Category
            </p>
            <p className="text-xs text-slate-400 mt-1">All monitored zones are operating within normal safety limits.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const severityClass = getSeverityBadge(alert.severity);

            return (
              <div
                key={alert.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-500" /> {alert.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${severityClass}`}
                  >
                    {alert.severity} PRIORITY
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-0 sm:pl-12">
                  {alert.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 pl-0 sm:pl-12">
                  <span>Source: {alert.source}</span>
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Digitally Verified Broadcast
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
