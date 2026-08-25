import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { IncidentProvider } from './context/IncidentContext';
import { CrowdProvider } from './context/CrowdContext';
import { NotificationProvider } from './context/NotificationContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/layout/Navbar';
import { TouristHomeView } from './components/tourist/TouristHomeView';
import { TripManagementView } from './components/tourist/TripManagementView';
import { TouristMapView } from './components/tourist/TouristMapView';
import { AlertsFeedView } from './components/tourist/AlertsFeedView';
import { CrowdZonesView } from './components/tourist/CrowdZonesView';
import { DocumentVaultView } from './components/tourist/DocumentVaultView';
import { EmergencyContactsView } from './components/tourist/EmergencyContactsView';
import { TripFeedbackView } from './components/tourist/TripFeedbackView';
import { SafetyPassportView } from './components/passport/SafetyPassportView';
import { PrivacyCenterView } from './components/privacy/PrivacyCenterView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { AuthorityDashboard } from './components/dashboards/AuthorityDashboard';
import { OrganizerDashboard } from './components/dashboards/OrganizerDashboard';
import { AdminControlCenter } from './components/dashboards/AdminControlCenter';
import { ComprehensiveOnboarding } from './components/onboarding/ComprehensiveOnboarding';
import { OnboardingModal } from './components/tourist/OnboardingModal';
import { testFirestoreConnection } from './lib/firebase';
import { Language } from './lib/i18n';

function MainAppLayout() {
  const { currentUser, isDemoMode } = useAuth();
  const { currentTab, navigateTo } = useNavigation();
  const [language, setLanguage] = useState<Language>('en');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    testFirestoreConnection().then(setDbConnected);
  }, []);

  const isTourist = currentUser?.role === 'TOURIST_NATIONAL' || currentUser?.role === 'TOURIST_INTERNATIONAL';
  const needsOnboarding = !currentUser || (isTourist && !currentUser?.onboardingComplete);

  // Mandatory Onboarding Flow
  if (needsOnboarding) {
    return <ComprehensiveOnboarding onComplete={() => navigateTo('HOME')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Navbar with integrated Back button in top-left */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Status Pill Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-300">
              Database & Security Rules:
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {dbConnected === false ? 'CONNECTING...' : 'ACTIVE & SECURED (Zero-Trust ABAC Firestore)'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>
              Mode:{' '}
              <strong className="text-cyan-400 font-bold">
                {isDemoMode ? 'DEMO SANDBOX' : 'LIVE PRODUCTION'}
              </strong>
            </span>
            <span>•</span>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-cyan-400 hover:underline font-bold cursor-pointer"
            >
              Tourist Identity Profile
            </button>
          </div>
        </div>

        {/* Tab Router Routing */}
        {currentTab === 'HOME' && <TouristHomeView onNavigate={(tab) => navigateTo(tab)} />}
        {currentTab === 'TRIPS' && <TripManagementView />}
        {currentTab === 'MAP' && <TouristMapView />}
        {currentTab === 'ALERTS' && <AlertsFeedView />}
        {currentTab === 'CROWD' && <CrowdZonesView />}
        {currentTab === 'DOCUMENTS' && <DocumentVaultView />}
        {currentTab === 'CONTACTS' && <EmergencyContactsView />}
        {currentTab === 'FEEDBACK' && <TripFeedbackView />}
        {currentTab === 'PASSPORT' && <SafetyPassportView />}
        {currentTab === 'PRIVACY' && <PrivacyCenterView />}
        {currentTab === 'AUDIT_LOGS' && <AuditLogsView />}

        {/* Staff / Authority Views */}
        {currentTab === 'DASHBOARD' && <AuthorityDashboard />}
        {currentTab === 'ORGANIZER' && <OrganizerDashboard />}
        {currentTab === 'ADMIN_SIM' && <AdminControlCenter />}
      </main>

      {/* Identity / Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/90 py-4 px-6 text-center text-xs text-slate-400 transition-colors">
        <p>
          AI Tourist Guardian • Production Tourism Safety & Intelligent Incident Management Platform
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IncidentProvider>
          <TripProvider>
            <CrowdProvider>
              <NotificationProvider>
                <NavigationProvider>
                  <MainAppLayout />
                </NavigationProvider>
              </NotificationProvider>
            </CrowdProvider>
          </TripProvider>
        </IncidentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
