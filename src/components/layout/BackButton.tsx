import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
  showLabelOnDesktop?: boolean;
  forceVisible?: boolean;
  id?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  label = 'Back',
  className = '',
  showLabelOnDesktop = false,
  forceVisible = false,
  id = 'global-back-button',
}) => {
  const { goBack, canGoBack } = useNavigation();

  // If no custom onClick and cannot go back in navigation history, hide
  if (!forceVisible && !onClick && !canGoBack) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      goBack();
    }
  };

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      aria-label={label || 'Go back to previous screen'}
      title={label || 'Go back to previous screen'}
      className={`inline-flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700/80 shadow-xs transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 ${className}`}
    >
      <ArrowLeft className="w-5 h-5 text-cyan-400 shrink-0" />
      {showLabelOnDesktop && (
        <span className="text-xs font-bold text-slate-200 hidden sm:inline-block">
          {label}
        </span>
      )}
    </button>
  );
};
