import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, MapPin, PhoneCall, FileText, Bell, MessageSquare, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { ConsentPurpose } from '../../types';

export const PrivacyCenterView: React.FC = () => {
  const { currentUser } = useAuth();
  const [consents, setConsents] = useState<Record<ConsentPurpose, boolean>>({
    LOCATION: true,
    EMERGENCY_DATA: true,
    DOCUMENT_ACCESS: true,
    NOTIFICATIONS: true,
    PUBLIC_FEEDBACK: false,
    PHOTO_SHARING: false,
    AI_PERSONALIZATION: true,
  });

  const [savingPurpose, setSavingPurpose] = useState<string | null>(null);

  const toggleConsent = async (purpose: ConsentPurpose) => {
    const nextState = !consents[purpose];
    setSavingPurpose(purpose);

    // Update local state
    setConsents((prev) => ({ ...prev, [purpose]: nextState }));

    // Record audit log entry
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id || 'anonymous',
          actorEmail: currentUser?.email || 'anonymous',
          actorRole: currentUser?.role || 'TOURIST_NATIONAL',
          action: nextState ? 'GRANT_CONSENT' : 'WITHDRAW_CONSENT',
          resource: 'CONSENT_RECORD',
          result: 'SUCCESS',
          details: {
            purpose,
            newState: nextState ? 'GRANTED' : 'WITHDRAWN',
            version: '2026.1',
          },
        }),
      });
    } catch (err) {
      console.error('Failed to log consent audit:', err);
    } finally {
      setTimeout(() => setSavingPurpose(null), 300);
    }
  };

  const consentItems: Array<{
    purpose: ConsentPurpose;
    title: string;
    description: string;
    why: string;
    whoCanAccess: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      purpose: 'LOCATION',
      title: 'Real-Time Location Sharing',
      description: 'Shares GPS coordinates exclusively during active trips for safety alerts and hazard warnings.',
      why: 'Enables immediate proximity hazard geofencing and safer route navigation.',
      whoCanAccess: 'Only assigned Tourism Safety Authorities and yourself.',
      icon: MapPin,
    },
    {
      purpose: 'EMERGENCY_DATA',
      title: 'Emergency Contact & Next-of-Kin Access',
      description: 'Permits internal first responders to view designated emergency contacts during active incidents.',
      why: 'Ensures swift family notification and coordination during SOS triggers.',
      whoCanAccess: 'Tourist Police & EMT Responders upon confirmed incident.',
      icon: PhoneCall,
    },
    {
      purpose: 'DOCUMENT_ACCESS',
      title: 'Encrypted Document Vault Inspection',
      description: 'Allows verified authorities to review travel documents and permits upon inspection request.',
      why: 'Streamlines verification at cultural festivals and checkpoints.',
      whoCanAccess: 'Authorized Tourism Officers.',
      icon: FileText,
    },
    {
      purpose: 'NOTIFICATIONS',
      title: 'High-Priority Safety & Crowd Alerts',
      description: 'Delivers real-time crowd congestion warnings and official hazard notices.',
      why: 'Keeps you proactively informed before entering high-density zones.',
      whoCanAccess: 'Local device notification channel.',
      icon: Bell,
    },
    {
      purpose: 'PUBLIC_FEEDBACK',
      title: 'Public Community Review & Testimonials',
      description: 'Displays your post-trip feedback anonymously on public safety leaderboards.',
      why: 'Helps future travellers make safe, informed choices.',
      whoCanAccess: 'Public tourism portal (anonymized).',
      icon: MessageSquare,
    },
    {
      purpose: 'PHOTO_SHARING',
      title: 'Photo Upload & Moderation Sharing',
      description: 'Permits AI photo moderation and selective public display of travel photos.',
      why: 'Visual safety context and verified landmark showcase.',
      whoCanAccess: 'Content moderation team.',
      icon: Camera,
    },
    {
      purpose: 'AI_PERSONALIZATION',
      title: 'AI Travel Assistant Contextualization',
      description: 'Allows Gemini AI Assistant to consider your current destination and language preferences.',
      why: 'Provides personalized, culturally accurate travel guidance.',
      whoCanAccess: 'Secure server-side AI runtime.',
      icon: Sparkles,
    },
  ];

  return (
    <div id="privacy-center-view" className="max-w-4xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Privacy & Consent Governance Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              YOUR DATA • YOUR CONSENT • YOUR ABSOLUTE CONTROL
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          In strict compliance with zero-trust privacy principles, AI Tourist Guardian never tracks location in the background without explicit, active consent. You can grant or withdraw any permission at any moment with instant audit verification.
        </p>
      </div>

      {/* Consent Items Grid */}
      <div className="space-y-3">
        {consentItems.map((item) => {
          const Icon = item.icon;
          const isGranted = consents[item.purpose];
          const isSaving = savingPurpose === item.purpose;

          return (
            <div
              key={item.purpose}
              id={`consent-card-${item.purpose.toLowerCase()}`}
              className={`p-5 rounded-2xl border transition-all ${
                isGranted
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-85'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isGranted
                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      {isGranted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                          WITHDRAWN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span><strong>Why:</strong> {item.why}</span>
                      <span><strong>Access:</strong> {item.whoCanAccess}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Button */}
                <div className="flex items-center gap-2 sm:self-center">
                  <button
                    id={`toggle-consent-${item.purpose.toLowerCase()}`}
                    onClick={() => toggleConsent(item.purpose)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isGranted
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isGranted ? 'Withdraw Consent' : 'Grant Permission'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
