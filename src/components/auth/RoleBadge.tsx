import React from 'react';
import { UserRole } from '../../types';
import { Shield, User, Globe, Building2, Flame, HeartPulse, Building, Lock } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ROLE_CONFIGS: Record<
  UserRole,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  TOURIST_NATIONAL: {
    label: 'National Tourist',
    bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: User,
  },
  TOURIST_INTERNATIONAL: {
    label: 'International Tourist',
    bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: Globe,
  },
  TOURISM_AUTHORITY: {
    label: 'Tourism Authority',
    bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Building2,
  },
  EVENT_ORGANIZER: {
    label: 'Event Organizer',
    bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: Flame,
  },
  SECURITY_POLICE: {
    label: 'Tourist Police / Security',
    bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: Shield,
  },
  MEDICAL_RESPONDER: {
    label: 'Medical Responder',
    bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: HeartPulse,
  },
  HOTEL: {
    label: 'Verified Hotel Partner',
    bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: Building,
  },
  ADMIN: {
    label: 'System Administrator',
    bg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    text: 'text-slate-900 dark:text-white',
    border: 'border-slate-700 dark:border-slate-300',
    icon: Lock,
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', showIcon = true }) => {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.TOURIST_NATIONAL;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      id={`role-badge-${role.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.border} ${sizeClasses} transition-all`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span className="whitespace-nowrap">{config.label}</span>
    </span>
  );
};
