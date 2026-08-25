import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../auth/RoleBadge';
import { ShieldCheck, CheckCircle2, AlertTriangle, UserCheck, Key, FileCheck, PhoneCall, Hotel } from 'lucide-react';

export const SafetyPassportView: React.FC = () => {
  const { currentUser } = useAuth();

  const readinessChecks = [
    { label: 'Verified Account & RBAC Identity', status: 'READY', icon: UserCheck, desc: 'Identity profile stored in secure Firestore partition' },
    { label: 'Consent & Privacy Policy Acknowledged', status: 'READY', icon: Key, desc: 'Location and data sharing strictly opt-in' },
    { label: 'Emergency Contacts Setup', status: 'READY', icon: PhoneCall, desc: 'Primary next-of-kin contact configured' },
    { label: 'Active Trip & Safety Geo-Partitioning', status: 'READY', icon: ShieldCheck, desc: 'Trip itinerary linked with real-time zone risk scoring' },
    { label: 'Accommodation & Stay Verification', status: 'REVIEW', icon: Hotel, desc: 'Partner hotel verification status mapped' },
    { label: 'Travel Document Vault & Expiry Monitor', status: 'READY', icon: FileCheck, desc: 'Documents encrypted with expiration tracking' },
  ];

  return (
    <div id="safety-passport-view" className="max-w-4xl mx-auto space-y-6">
      {/* Passport Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              OFFICIAL READINESS SUMMARY
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tourist Safety Passport
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Verified travel readiness credential & real-time risk status.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center text-center min-w-[140px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Safety Status
            </span>
            <span className="text-xl font-black text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              LOW RISK
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Normal Travel Zone</span>
          </div>
        </div>

        {/* Tourist details grid */}
        <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Traveller Name</span>
            <span className="font-bold text-white text-sm">{currentUser?.name || 'Guest Traveller'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Identity Tier</span>
            <div className="mt-1">
              {currentUser && <RoleBadge role={currentUser.role} size="sm" />}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Contact Number</span>
            <span className="font-bold text-white text-sm">{currentUser?.phoneNumber || 'Configured'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Primary Language</span>
            <span className="font-bold text-white text-sm">English (Multilingual AI Active)</span>
          </div>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Readiness & Verification Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {readinessChecks.map((item, idx) => {
            const Icon = item.icon;
            const isReady = item.status === 'READY';
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-cyan-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.label}
                    </p>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> READY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" /> REVIEW
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
