import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { RoleBadge } from '../auth/RoleBadge';
import { SystemHealthModal } from '../system/SystemHealthModal';
import { AuthModal } from '../auth/AuthModal';
import { BackButton } from './BackButton';
import { ThemeToggle } from './ThemeToggle';
import { Language, translations } from '../../lib/i18n';
import {
  Shield,
  Activity,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Bell,
  Sliders,
  FileText,
  PhoneCall,
  MessageSquare,
  Globe2,
} from 'lucide-react';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
}) => {
  const { currentUser } = useAuth();
  const { currentTab, navigateTo } = useNavigation();
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const t = translations[language];

  const isStaffRole =
    currentUser?.role &&
    [
      'TOURISM_AUTHORITY',
      'EVENT_ORGANIZER',
      'SECURITY_POLICE',
      'MEDICAL_RESPONDER',
      'HOTEL',
      'ADMIN',
    ].includes(currentUser.role);

  return (
    <>
      <header
        id="app-header"
        className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Back Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Top-left Back Arrow */}
            <BackButton id="header-back-button" />

            {/* Brand Logo & Name */}
            <div
              id="header-brand-logo"
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
              onClick={() => navigateTo(isStaffRole ? 'DASHBOARD' : 'HOME')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black tracking-tight text-sm sm:text-base lg:text-lg text-white">
                    AI GUARDIAN
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    V2
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden md:block">
                  Tourism Safety & Incident Coordination
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {!isStaffRole ? (
              <>
                <button
                  id="nav-tourist-home"
                  onClick={() => navigateTo('HOME')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'HOME' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.home}
                </button>
                <button
                  id="nav-tourist-trips"
                  onClick={() => navigateTo('TRIPS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'TRIPS' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.trips}
                </button>
                <button
                  id="nav-tourist-map"
                  onClick={() => navigateTo('MAP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'MAP' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.map}
                </button>
                <button
                  id="nav-tourist-alerts"
                  onClick={() => navigateTo('ALERTS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'ALERTS' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.alerts}
                </button>
                <button
                  id="nav-tourist-crowd"
                  onClick={() => navigateTo('CROWD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'CROWD' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.crowd}
                </button>
                <button
                  id="nav-tourist-passport"
                  onClick={() => navigateTo('PASSPORT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'PASSPORT' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.passport}
                </button>
                <button
                  id="nav-tourist-privacy"
                  onClick={() => navigateTo('PRIVACY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'PRIVACY' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.privacy}
                </button>
              </>
            ) : (
              <>
                <button
                  id="nav-staff-dashboard"
                  onClick={() => navigateTo('DASHBOARD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'DASHBOARD' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Incident Command
                </button>
                <button
                  id="nav-staff-organizer"
                  onClick={() => navigateTo('ORGANIZER')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'ORGANIZER' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Event & Crowd Zones
                </button>
                <button
                  id="nav-staff-admin-sim"
                  onClick={() => navigateTo('ADMIN_SIM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'ADMIN_SIM' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Simulation Suite
                </button>
              </>
            )}
            <button
              id="nav-audit-logs"
              onClick={() => navigateTo('AUDIT_LOGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentTab === 'AUDIT_LOGS' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.auditTrail}
            </button>
          </nav>

          {/* Right Action Tools: Theme, Language, Health, Persona Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Multilingual Selector */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-[10px] sm:text-[11px] font-bold">
              {(['en', 'hi', 'te'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg uppercase transition ${
                    language === lang
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* System Health Diagnostics Pill */}
            <button
              id="system-health-trigger-button"
              onClick={() => setIsHealthOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
              title="View Architecture & Integration Health"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Health</span>
            </button>

            {/* Persona Switcher Pill */}
            <button
              id="role-switcher-trigger-button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
              title="Switch Persona / Role"
            >
              <Users className="w-4 h-4 text-slate-300" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] text-slate-400 leading-tight">Active Persona</span>
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {currentUser?.name || 'Guest'}
                </span>
              </div>
              {currentUser && <RoleBadge role={currentUser.role} size="sm" />}
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SystemHealthModal isOpen={isHealthOpen} onClose={() => setIsHealthOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
