import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useIncidents } from './IncidentContext';
import { ArrowLeft, AlertTriangle, AlertOctagon, ShieldAlert, X } from 'lucide-react';

export interface NavigationEntry {
  tab: string;
  subView?: string | null;
  params?: Record<string, any> | null;
  title?: string;
}

interface NavigationContextType {
  currentTab: string;
  currentSubView: string | null;
  subViewParams: Record<string, any> | null;
  historyStack: NavigationEntry[];
  canGoBack: boolean;
  navigateTo: (
    tab: string,
    subView?: string | null,
    params?: Record<string, any> | null,
    options?: { replace?: boolean; title?: string }
  ) => void;
  goBack: () => void;
  openSubView: (subView: string, params?: Record<string, any> | null) => void;
  closeSubView: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  registerUnsavedForm: (formId: string, isDirty: boolean) => void;
  hasUnsavedChanges: boolean;
  isSosActive: boolean;
  setIsSosActive: (active: boolean) => void;
  showCancelSosModal: boolean;
  setShowCancelSosModal: (show: boolean) => void;
  confirmCancelSos: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeSosIncident, resolveIncident } = useIncidents();

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

  const defaultHomeTab = isStaffRole ? 'DASHBOARD' : 'HOME';

  const [currentTab, setCurrentTab] = useState<string>(defaultHomeTab);
  const [currentSubView, setCurrentSubView] = useState<string | null>(null);
  const [subViewParams, setSubViewParams] = useState<Record<string, any> | null>(null);
  const [historyStack, setHistoryStack] = useState<NavigationEntry[]>([]);

  // Dirty form tracking
  const [dirtyForms, setDirtyForms] = useState<Record<string, boolean>>({});
  const [manualUnsaved, setManualUnsaved] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // SOS Guard state
  const [isSosActiveExplicit, setIsSosActiveExplicit] = useState(false);
  const [showCancelSosModal, setShowCancelSosModal] = useState(false);

  const hasUnsavedChanges = manualUnsaved || Object.values(dirtyForms).some(Boolean);
  const isSosActive = isSosActiveExplicit || !!activeSosIncident;

  const isInitialScreen =
    currentTab === defaultHomeTab && currentSubView === null && historyStack.length === 0;
  const canGoBack = !isInitialScreen;

  // Sync default home tab when role changes
  useEffect(() => {
    if (isStaffRole && currentTab === 'HOME') {
      setCurrentTab('DASHBOARD');
      setHistoryStack([]);
      setCurrentSubView(null);
    }
  }, [isStaffRole]);

  // Register or unregister dirty forms
  const registerUnsavedForm = useCallback((formId: string, isDirty: boolean) => {
    setDirtyForms((prev) => {
      if (prev[formId] === isDirty) return prev;
      return { ...prev, [formId]: isDirty };
    });
  }, []);

  const setHasUnsavedChanges = useCallback((hasChanges: boolean) => {
    setManualUnsaved(hasChanges);
  }, []);

  // Browser & Android physical/system back button handling via popstate
  useEffect(() => {
    // Initial history seed to allow capturing back button
    if (!window.history.state) {
      window.history.replaceState(
        { tab: currentTab, subView: currentSubView, depth: 0 },
        '',
        window.location.pathname
      );
    }

    const handlePopState = (event: PopStateEvent) => {
      // If an active SOS is running, prevent accidental exit/cancel
      if (isSosActive) {
        // Push state back to prevent navigation
        window.history.pushState(
          { tab: currentTab, subView: currentSubView, depth: historyStack.length },
          '',
          window.location.pathname
        );
        setShowCancelSosModal(true);
        return;
      }

      // If there are unsaved changes, prompt user
      if (hasUnsavedChanges) {
        window.history.pushState(
          { tab: currentTab, subView: currentSubView, depth: historyStack.length },
          '',
          window.location.pathname
        );
        setPendingAction(() => () => {
          setDirtyForms({});
          setManualUnsaved(false);
          executeBack();
        });
        setShowUnsavedModal(true);
        return;
      }

      // Otherwise smoothly execute back
      executeBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSosActive, hasUnsavedChanges, currentTab, currentSubView, historyStack]);

  const executeBack = useCallback(() => {
    // 1. If currently in a subview (e.g. create modal/sub-page/detail), close it
    if (currentSubView !== null) {
      setCurrentSubView(null);
      setSubViewParams(null);
      return;
    }

    // 2. If history stack has entries, pop previous screen
    if (historyStack.length > 0) {
      const nextStack = [...historyStack];
      const previousEntry = nextStack.pop()!;
      setHistoryStack(nextStack);
      setCurrentTab(previousEntry.tab);
      setCurrentSubView(previousEntry.subView || null);
      setSubViewParams(previousEntry.params || null);
      return;
    }

    // 3. If on a non-home tab with empty history, go to default Home
    if (currentTab !== defaultHomeTab) {
      setCurrentTab(defaultHomeTab);
      setCurrentSubView(null);
      setSubViewParams(null);
    }
  }, [currentSubView, historyStack, currentTab, defaultHomeTab]);

  const goBack = useCallback(() => {
    // Check if active SOS is running
    if (isSosActive) {
      setShowCancelSosModal(true);
      return;
    }

    // Check unsaved changes
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setDirtyForms({});
        setManualUnsaved(false);
        executeBack();
      });
      setShowUnsavedModal(true);
      return;
    }

    executeBack();
  }, [isSosActive, hasUnsavedChanges, executeBack]);

  const navigateTo = useCallback(
    (
      tab: string,
      subView: string | null = null,
      params: Record<string, any> | null = null,
      options?: { replace?: boolean; title?: string }
    ) => {
      // Prevent duplicate transitions to exact same state
      if (
        tab === currentTab &&
        subView === currentSubView &&
        JSON.stringify(params) === JSON.stringify(subViewParams)
      ) {
        return;
      }

      const performNavigate = () => {
        if (!options?.replace) {
          // Push previous entry onto history stack (avoiding duplicate top)
          setHistoryStack((prev) => {
            const last = prev[prev.length - 1];
            if (
              last &&
              last.tab === currentTab &&
              last.subView === currentSubView &&
              JSON.stringify(last.params) === JSON.stringify(subViewParams)
            ) {
              return prev;
            }
            return [
              ...prev,
              {
                tab: currentTab,
                subView: currentSubView,
                params: subViewParams,
                title: options?.title,
              },
            ];
          });

          // Sync browser history state for Android back button integration
          try {
            window.history.pushState(
              { tab, subView, params, depth: historyStack.length + 1 },
              '',
              window.location.pathname
            );
          } catch {
            // Ignore pushState issues in sandbox if any
          }
        }

        setCurrentTab(tab);
        setCurrentSubView(subView || null);
        setSubViewParams(params || null);
        setDirtyForms({});
        setManualUnsaved(false);
      };

      if (hasUnsavedChanges && !options?.replace) {
        setPendingAction(() => performNavigate);
        setShowUnsavedModal(true);
      } else {
        performNavigate();
      }
    },
    [currentTab, currentSubView, subViewParams, historyStack.length, hasUnsavedChanges]
  );

  const openSubView = useCallback(
    (subView: string, params: Record<string, any> | null = null) => {
      navigateTo(currentTab, subView, params);
    },
    [navigateTo, currentTab]
  );

  const closeSubView = useCallback(() => {
    goBack();
  }, [goBack]);

  const confirmCancelSos = useCallback(async () => {
    if (activeSosIncident) {
      try {
        await resolveIncident(activeSosIncident.id, 'Cancelled by user false alarm.');
      } catch (err) {
        console.error('Error resolving incident on cancel:', err);
      }
    }
    setIsSosActiveExplicit(false);
    setShowCancelSosModal(false);
    executeBack();
  }, [activeSosIncident, resolveIncident, executeBack]);

  return (
    <NavigationContext.Provider
      value={{
        currentTab,
        currentSubView,
        subViewParams,
        historyStack,
        canGoBack,
        navigateTo,
        goBack,
        openSubView,
        closeSubView,
        setHasUnsavedChanges,
        registerUnsavedForm,
        hasUnsavedChanges,
        isSosActive,
        setIsSosActive: setIsSosActiveExplicit,
        showCancelSosModal,
        setShowCancelSosModal,
        confirmCancelSos,
      }}
    >
      {children}

      {/* 1. UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div
          id="unsaved-changes-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-modal-title"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 id="unsaved-modal-title" className="text-lg font-black text-white tracking-tight">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  You have unsaved changes. Leave this page?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              Any unsaved inputs or modifications on this screen will be discarded if you leave without saving.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="unsaved-stay-button"
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  setPendingAction(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                Stay
              </button>
              <button
                id="unsaved-leave-button"
                type="button"
                onClick={() => {
                  setShowUnsavedModal(false);
                  if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                  } else {
                    executeBack();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CANCEL SOS CONFIRMATION MODAL */}
      {showCancelSosModal && (
        <div
          id="cancel-sos-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-sos-title"
        >
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-600 rounded-3xl p-6 sm:p-7 text-white shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 id="cancel-sos-title" className="text-lg font-black text-white tracking-tight">
                  Cancel Active Emergency SOS?
                </h3>
                <p className="text-xs text-rose-300 font-semibold leading-relaxed">
                  An active emergency broadcast is in progress with Tourist Police & EMT dispatch.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2">
              <p className="flex items-center gap-1.5 text-amber-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Safety Confirmation
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Navigating away without confirmation is prevented to ensure your safety. Are you certain you want to cancel this SOS emergency alert?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2">
              <button
                id="keep-sos-active-button"
                type="button"
                onClick={() => setShowCancelSosModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span>Keep SOS Active</span>
              </button>
              <button
                id="confirm-cancel-sos-button"
                type="button"
                onClick={confirmCancelSos}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                <span>Cancel SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
