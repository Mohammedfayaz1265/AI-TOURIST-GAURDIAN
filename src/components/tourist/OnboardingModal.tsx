import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, Globe2, Compass, ArrowRight, CheckCircle2, MapPin, HeartHandshake } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { updateUserProfile, switchTestRole } = useAuth();
  const [selectedType, setSelectedType] = useState<'NATIONAL' | 'INTERNATIONAL'>('NATIONAL');
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [name, setName] = useState('Fayaz Mohammed');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [nationality, setNationality] = useState('Indian');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  if (!isOpen) return null;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const role: UserRole = selectedType === 'INTERNATIONAL' ? 'TOURIST_INTERNATIONAL' : 'TOURIST_NATIONAL';
    await switchTestRole(role);
    await updateUserProfile({
      name,
      phoneNumber: phone,
      preferredLanguage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            AI TOURIST GUARDIAN
          </h2>
          <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
            "Your Safety. Our Priority."
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Please select your travel identity profile to configure optimal safety & embassy support:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedType('NATIONAL');
                  setNationality('Indian');
                }}
                className={`p-5 rounded-2xl border text-left transition relative ${
                  selectedType === 'NATIONAL'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 w-fit text-cyan-600 dark:text-cyan-400 mb-3 shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  National Tourist
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Domestic traveller with Indian phone and ID credentials.
                </p>
                {selectedType === 'NATIONAL' && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 absolute top-4 right-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType('INTERNATIONAL');
                  setNationality('United Kingdom');
                }}
                className={`p-5 rounded-2xl border text-left transition relative ${
                  selectedType === 'INTERNATIONAL'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 w-fit text-cyan-600 dark:text-cyan-400 mb-3 shadow-xs">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  International Tourist
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Overseas traveller with passport, visa & embassy coordination.
                </p>
                {selectedType === 'INTERNATIONAL' && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 absolute top-4 right-4" />
                )}
              </button>
            </div>

            <button
              id="onboarding-next-step"
              onClick={() => setStep(2)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <span>Continue Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedType === 'INTERNATIONAL' ? 'International Contact Number' : 'Mobile Number'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {selectedType === 'INTERNATIONAL' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nationality</label>
                <input
                  type="text"
                  required
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="en">English (Official)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                id="onboarding-submit-button"
                type="submit"
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition"
              >
                Launch Tourist Guardian
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
