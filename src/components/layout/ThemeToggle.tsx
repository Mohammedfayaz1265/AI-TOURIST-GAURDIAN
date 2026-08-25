import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showText = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      className={`relative inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 rounded-xl border transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 active:scale-95 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700 hover:text-amber-300 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 hover:text-slate-900 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 animate-in spin-in-90 duration-200" />
        ) : (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600 animate-in spin-in-90 duration-200" />
        )}
        {showText && (
          <span className="text-xs font-bold tracking-tight">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </div>
    </button>
  );
};
