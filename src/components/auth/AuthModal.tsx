import React, { useState } from 'react';
import { useAuth, TEST_ACCOUNTS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { RoleBadge, ROLE_CONFIGS } from './RoleBadge';
import { X, Lock, Mail, User, Phone, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'ROLE_SWITCHER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'ROLE_SWITCHER',
}) => {
  const { currentUser, switchTestRole, loginWithEmail, registerWithEmail, logout } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'ROLE_SWITCHER'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TOURIST_NATIONAL');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRoleSwitch = async (role: UserRole) => {
    try {
      await switchTestRole(role);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Role switch failed');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (mode === 'LOGIN') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name, selectedRole, phone);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed. Verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === 'ROLE_SWITCHER' && 'Switch Role / Persona Sandbox'}
              {mode === 'LOGIN' && 'Sign In to AI Tourist Guardian'}
              {mode === 'REGISTER' && 'Create Verified Account'}
            </h2>
          </div>
          <button
            id="close-auth-modal-button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/30">
          <button
            id="tab-role-switch"
            onClick={() => {
              setMode('ROLE_SWITCHER');
              setErrorMsg('');
            }}
            className={`py-2.5 text-xs font-semibold border-b-2 mr-4 transition ${
              mode === 'ROLE_SWITCHER'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sandbox Role Switcher (8 Roles)
          </button>
          <button
            id="tab-login"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
            }}
            className={`py-2.5 text-xs font-semibold border-b-2 mr-4 transition ${
              mode === 'LOGIN'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Email Login
          </button>
          <button
            id="tab-register"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
            }}
            className={`py-2.5 text-xs font-semibold border-b-2 transition ${
              mode === 'REGISTER'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            New Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'ROLE_SWITCHER' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any authorized system role to evaluate tailored views, RBAC security gates, and operational dashboards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((role) => {
                  const account = TEST_ACCOUNTS[role];
                  const isCurrent = currentUser?.role === role;
                  return (
                    <button
                      key={role}
                      id={`select-role-${role.toLowerCase()}`}
                      onClick={() => handleRoleSwitch(role)}
                      className={`p-3 rounded-xl text-left border transition flex flex-col justify-between gap-2 ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <RoleBadge role={role} size="sm" />
                        {isCurrent && <Check className="w-4 h-4 text-cyan-600 font-bold" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {account.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {account.email}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(mode === 'LOGIN' || mode === 'REGISTER') && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'REGISTER' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="register-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Rostova"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role / Identity Type
                    </label>
                    <select
                      id="register-select-role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="TOURIST_NATIONAL">National Tourist</option>
                      <option value="TOURIST_INTERNATIONAL">International Tourist</option>
                      <option value="TOURISM_AUTHORITY">Tourism Authority</option>
                      <option value="EVENT_ORGANIZER">Event Organizer</option>
                      <option value="SECURITY_POLICE">Security / Tourist Police</option>
                      <option value="MEDICAL_RESPONDER">Medical Responder</option>
                      <option value="HOTEL">Hotel Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        id="register-input-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="auth-input-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@guardian.org"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="auth-input-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                id="submit-auth-button"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting
                  ? 'Processing...'
                  : mode === 'LOGIN'
                  ? 'Sign In with Credentials'
                  : 'Register Verified Account'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        {currentUser && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Active: <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.role})
            </span>
            <button
              id="auth-logout-button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
