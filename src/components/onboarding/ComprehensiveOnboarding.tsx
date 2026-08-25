import React, { useState, useEffect } from 'react';
import { useAuth, formatAuthError } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { ThemeToggle } from '../layout/ThemeToggle';
import travelerBannerImg from '../../assets/images/traveler_banner_1787592836235.jpg';
import {
  UserRole,
  TouristType,
  ConsentPurpose,
  ConsentRecord,
  EmergencyContact,
  Trip,
  SafetyPreferences,
} from '../../types';
import {
  Shield,
  ShieldCheck,
  Compass,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Phone,
  Calendar,
  MapPin,
  Building,
  AlertTriangle,
  Lock,
  Sparkles,
  Heart,
  Navigation,
  FileCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Radio,
  Sliders,
  Send,
  HelpCircle,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ComprehensiveOnboardingProps {
  onComplete: () => void;
}

export const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ onComplete }) => {
  const {
    currentUser,
    touristProfile,
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    resetPassword,
    saveOnboardingStep,
    completeOnboarding,
    switchTestRole,
  } = useAuth();

  const { createTrip, addEmergencyContact, reportSuspiciousAccommodation } = useTrip();

  // Current Step: Resume from user profile if available, otherwise step 1 (Welcome)
  const [step, setStep] = useState<number>(() => {
    if (currentUser?.onboardingStep && currentUser.onboardingStep > 1 && !currentUser.onboardingComplete) {
      return currentUser.onboardingStep;
    }
    return 1;
  });

  const [authMode, setAuthMode] = useState<'WELCOME' | 'LOGIN' | 'REGISTER'>('WELCOME');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Form State: Registration
  const [touristType, setTouristType] = useState<TouristType>('NATIONAL');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [dob, setDob] = useState(currentUser?.dob || '1998-05-15');
  const [gender, setGender] = useState(currentUser?.gender || 'Prefer not to say');
  const [countryOfResidence, setCountryOfResidence] = useState(currentUser?.countryOfResidence || 'India');
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser?.preferredLanguage || 'en');

  // Form State: International Passport & Visa Details
  const [passportNumber, setPassportNumber] = useState(touristProfile?.passportNumberMasked || 'A87654321');
  const [visaType, setVisaType] = useState(touristProfile?.visaType || 'Tourist E-Visa');
  const [visaNumber, setVisaNumber] = useState(touristProfile?.visaNumberMasked || 'IN-VISA-998822');
  const [arrivalDate, setArrivalDate] = useState(touristProfile?.arrivalDate || '2026-08-25');
  const [expectedDepartureDate, setExpectedDepartureDate] = useState(touristProfile?.expectedDepartureDate || '2026-09-10');
  const [travelPurpose, setTravelPurpose] = useState(touristProfile?.travelPurpose || 'Cultural Tourism & Sightseeing');
  const [embassyName, setEmbassyName] = useState(touristProfile?.embassyContact?.embassyName || 'British High Commission New Delhi');
  const [embassyPhone, setEmbassyPhone] = useState(touristProfile?.embassyContact?.phone || '+91 11 2419 2100');
  const [embassyEmail, setEmbassyEmail] = useState(touristProfile?.embassyContact?.email || 'consular.newdelhi@fcdo.gov.uk');
  const [embassyAddress, setEmbassyAddress] = useState(touristProfile?.embassyContact?.address || 'Shantipath, Chanakyapuri, New Delhi');

  // Form State: Consent
  const [consentLocation, setConsentLocation] = useState(true);
  const [consentEmergency, setConsentEmergency] = useState(true);
  const [consentAlerts, setConsentAlerts] = useState(true);
  const [consentNotifications, setConsentNotifications] = useState(true);
  const [consentFeedback, setConsentFeedback] = useState<'PRIVATE' | 'AUTHORITY_ONLY' | 'PUBLIC_MODERATED'>('PUBLIC_MODERATED');

  // Form State: Emergency Contact
  const [ecName, setEcName] = useState('Sarah Jenkins');
  const [ecRelationship, setEcRelationship] = useState('Spouse / Family');
  const [ecPhone, setEcPhone] = useState('+91 98111 22334');
  const [ecCountry, setEcCountry] = useState('India');
  const [ecMethod, setEcMethod] = useState<'SMS' | 'PHONE' | 'WHATSAPP' | 'EMAIL'>('SMS');

  // Form State: Trip Setup
  const [tripTitle, setTripTitle] = useState('Heritage & Cultural Exploration 2026');
  const [startingLocation, setStartingLocation] = useState('New Delhi');
  const [destination, setDestination] = useState('Varanasi Ghats & Prayagraj');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  const [travelMode, setTravelMode] = useState('Express Train / Intercity Rail');
  const [travellerCount, setTravellerCount] = useState(2);
  const [itineraryNotes, setItineraryNotes] = useState('Evening Ganga Aarti visit, heritage corridor walking tour.');

  // Form State: Accommodation
  const [hotelName, setHotelName] = useState('Grand Heritage Palace');
  const [hotelAddress, setHotelAddress] = useState('Assi Ghat Road, Varanasi, Uttar Pradesh 221005');
  const [hotelPhone, setHotelPhone] = useState('+91 542 231 0099');
  const [isReportingSuspicious, setIsReportingSuspicious] = useState(false);
  const [suspiciousReason, setSuspiciousReason] = useState('');

  // Form State: Safety Preferences
  const [prefCrowd, setPrefCrowd] = useState(true);
  const [prefWeather, setPrefWeather] = useState(true);
  const [prefRoad, setPrefRoad] = useState(true);
  const [prefEvent, setPrefEvent] = useState(true);
  const [prefTransport, setPrefTransport] = useState(true);
  const [prefEmergency, setPrefEmergency] = useState(true);
  const [prefHealth, setPrefHealth] = useState(true);

  // Form State: Geolocation
  const [geoStatus, setGeoStatus] = useState<'IDLE' | 'ACQUIRING' | 'GRANTED' | 'DENIED'>('IDLE');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Determine if user can navigate back
  const canGoBack = step > 1 || authMode !== 'WELCOME';

  const handleGoBack = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (authMode === 'LOGIN' || authMode === 'REGISTER') {
        setAuthMode('WELCOME');
      }
    } else if (step === 2) {
      setStep(1);
      setAuthMode('WELCOME');
    } else {
      goToStep(step - 1);
    }
  };

  // Android system physical back button support for Onboarding
  useEffect(() => {
    const handlePopState = () => {
      if (canGoBack) {
        handleGoBack();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [canGoBack, step, authMode]);

  // Sync step changes with backend/profile
  const goToStep = async (nextStep: number) => {
    setErrorMsg(null);
    setStep(nextStep);
    if (currentUser) {
      await saveOnboardingStep(nextStep);
    }
  };

  // Step 1 -> Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      // After login, check if onboarding was already complete
      if (currentUser?.onboardingComplete) {
        onComplete();
      } else {
        const resumeStep = currentUser?.onboardingStep || 2;
        setStep(resumeStep);
      }
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const selectedRole: UserRole = touristType === 'INTERNATIONAL' ? 'TOURIST_INTERNATIONAL' : 'TOURIST_NATIONAL';
      const user = await signInWithGoogle(selectedRole);
      if (user.onboardingComplete) {
        onComplete();
      } else {
        setStep(user.onboardingStep || 2);
      }
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address for password reset.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(resetEmail);
      setSuccessMsg(`Password reset email sent to ${resetEmail}. Please check your inbox.`);
      setShowResetModal(false);
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3 -> Registration submit handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const role: UserRole = touristType === 'INTERNATIONAL' ? 'TOURIST_INTERNATIONAL' : 'TOURIST_NATIONAL';
      await registerWithEmail({
        email,
        pass: password,
        name: fullName,
        role,
        phone,
        dob,
        gender,
        countryOfResidence: touristType === 'INTERNATIONAL' ? countryOfResidence : 'India',
        preferredLanguage,
      });

      // Advance to Step 4 (Identity details)
      await goToStep(4);
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 -> Save Identity Details & advance to Step 5 (Consent)
  const handleSaveIdentity = async () => {
    setIsSubmitting(true);
    try {
      if (touristType === 'INTERNATIONAL') {
        await saveOnboardingStep(
          5,
          {
            touristType: 'INTERNATIONAL',
            passportNumberMasked: passportNumber.length > 4 ? `***${passportNumber.slice(-4)}` : passportNumber,
            visaType,
            visaNumberMasked: visaNumber.length > 4 ? `***${visaNumber.slice(-4)}` : visaNumber,
            arrivalDate,
            expectedDepartureDate,
            travelPurpose,
            embassyContact: {
              country: countryOfResidence,
              embassyName,
              phone: embassyPhone,
              email: embassyEmail,
              address: embassyAddress,
              source: 'MANUAL_ENTRY',
            },
          },
          { name: fullName, phoneNumber: phone, countryOfResidence }
        );
      } else {
        await saveOnboardingStep(
          5,
          {
            touristType: 'NATIONAL',
            nationality: 'Indian',
          },
          { name: fullName, phoneNumber: phone, countryOfResidence: 'India' }
        );
      }
      setStep(5);
    } catch (err) {
      setErrorMsg('Failed to save profile details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5 -> Save Consents & advance to Step 6 (Emergency Contacts)
  const handleSaveConsents = async () => {
    setIsSubmitting(true);
    try {
      const uid = currentUser?.id || 'tourist';
      const now = new Date().toISOString();
      const consents: ConsentRecord[] = [
        {
          id: `consent-loc-${Date.now()}`,
          userId: uid,
          purpose: 'LOCATION',
          scope: 'Emergency safety geofencing and nearest shelter routing',
          status: consentLocation ? 'GRANTED' : 'WITHDRAWN',
          version: '2.1',
          consentTextVersion: 'v2026.08',
          createdAt: now,
        },
        {
          id: `consent-emg-${Date.now()}`,
          userId: uid,
          purpose: 'EMERGENCY_DATA',
          scope: 'Dispatch to verified first responders during active SOS',
          status: consentEmergency ? 'GRANTED' : 'WITHDRAWN',
          version: '2.1',
          consentTextVersion: 'v2026.08',
          createdAt: now,
        },
        {
          id: `consent-alt-${Date.now()}`,
          userId: uid,
          purpose: 'NOTIFICATIONS',
          scope: 'High severity crowd and weather crisis broadcasts',
          status: consentAlerts ? 'GRANTED' : 'WITHDRAWN',
          version: '2.1',
          consentTextVersion: 'v2026.08',
          createdAt: now,
        },
      ];

      // Save consent records
      for (const c of consents) {
        await setDoc(doc(db, 'consents', c.id), c).catch(() => {});
      }

      await saveOnboardingStep(6, {
        locationSharingEnabled: consentLocation,
      });
      setStep(6);
    } catch (err) {
      setErrorMsg('Error saving consents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 6 -> Add Emergency Contact & advance to Step 7 (Trip Setup)
  const handleSaveEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecName.trim() || !ecPhone.trim()) {
      setErrorMsg('Emergency contact name and phone number are strictly required for tourist safety.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addEmergencyContact({
        userId: currentUser?.id || 'tourist',
        name: ecName,
        relationship: ecRelationship,
        phone: ecPhone,
        country: ecCountry,
        preferredContactMethod: ecMethod,
        priority: 'PRIMARY',
        verified: true,
      });
      await saveOnboardingStep(7);
      setStep(7);
    } catch (err) {
      setErrorMsg('Failed to save emergency contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 7 -> Create Trip & advance to Step 8 (Accommodation)
  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim() || !destination.trim() || !startDate || !endDate) {
      setErrorMsg('Trip title, destination, start date and end date are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTrip = await createTrip({
        touristId: currentUser?.id || 'tourist',
        title: tripTitle,
        startingLocation,
        destinations: destination.split(',').map((d) => d.trim()),
        startDate,
        startTime,
        endDate,
        expectedReturnDate,
        travelMode,
        travellerCount,
        itineraryNotes,
        status: 'ACTIVE',
        riskLevel: 'LOW',
        safetyCheckStatus: 'SCHEDULED',
      });

      await saveOnboardingStep(8, {
        activeTripId: newTrip.id,
      });
      setStep(8);
    } catch (err) {
      setErrorMsg('Failed to create trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 8 -> Save Accommodation & advance to Step 9 (Safety Prefs)
  const handleSaveAccommodation = async () => {
    setIsSubmitting(true);
    try {
      if (isReportingSuspicious && suspiciousReason.trim()) {
        await reportSuspiciousAccommodation(hotelName, hotelAddress, suspiciousReason);
      }
      await saveOnboardingStep(9);
      setStep(9);
    } catch (err) {
      setErrorMsg('Failed to save accommodation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 9 -> Save Safety Preferences & advance to Step 10 (Location)
  const handleSaveSafetyPreferences = async () => {
    setIsSubmitting(true);
    try {
      const prefs: SafetyPreferences = {
        crowdAlerts: prefCrowd,
        weatherAlerts: prefWeather,
        roadAlerts: prefRoad,
        eventAlerts: prefEvent,
        transportAlerts: prefTransport,
        emergencyAlerts: prefEmergency,
        healthAlerts: prefHealth,
      };
      await saveOnboardingStep(10, {
        safetyPreferences: prefs,
      });
      setStep(10);
    } catch (err) {
      setErrorMsg('Failed to save safety preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 10 -> Request Geolocation & advance to Step 11 (Summary)
  const handleRequestLocation = () => {
    setGeoStatus('ACQUIRING');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGeoCoords({ lat, lng });
          setGeoStatus('GRANTED');
          await saveOnboardingStep(11, {
            lastKnownLocation: {
              latitude: lat,
              longitude: lng,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString(),
              zoneName: destination || 'Active Trip Area',
            },
            locationConsent: {
              granted: true,
              trackingStatus: 'ACTIVE',
              timestamp: new Date().toISOString(),
            },
          });
        },
        async (error) => {
          console.warn('Geolocation denied or timed out:', error.message);
          setGeoStatus('DENIED');
          await saveOnboardingStep(11, {
            locationConsent: {
              granted: false,
              trackingStatus: 'DENIED',
              timestamp: new Date().toISOString(),
            },
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoStatus('DENIED');
    }
  };

  // Step 11 -> Finish & Complete Onboarding
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      onComplete();
    } catch (err) {
      setErrorMsg('Failed to complete onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Background Decorative Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col my-8">
        {/* Top Header Bar */}
        <div className="bg-slate-900/80 border-b border-slate-800 p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Top-left Back Arrow Button - Shown on all steps except Step 1 Welcome */}
            {canGoBack && (
              <button
                id="onboarding-top-back-btn"
                type="button"
                onClick={handleGoBack}
                aria-label="Go back to previous step"
                title="Go back to previous step"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700 shadow-xs transition select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
            )}

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">AI TOURIST GUARDIAN</h1>
              <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                {step === 1 && authMode === 'WELCOME' ? 'Digital Tourism Safety Platform' : `Safety Setup • Step ${step} of 11`}
              </p>
            </div>
          </div>

          {/* Right Header Controls: Progress Indicator & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {step > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">{Math.round(((step - 1) / 10) * 100)}%</span>
                <div className="w-16 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${((step - 1) / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-md">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-red-100">Authentication / Configuration Notice</p>
              <p className="leading-relaxed text-red-300">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-md">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-100">Success</p>
              <p className="leading-relaxed text-emerald-300">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1">
          {/* =========================================================================
              STEP 1: WELCOME / INTRO / SIGN IN OR GET STARTED
             ========================================================================= */}
          {step === 1 && authMode === 'WELCOME' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Traveler Welcome Banner (As Requested) */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 shadow-xl group">
                <div className="relative h-44 sm:h-56 w-full overflow-hidden">
                  <img
                    src={travelerBannerImg}
                    alt="Hello Traveler - AI Tourist Guardian"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Gradient Overlays for High-Contrast Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent sm:bg-gradient-to-r sm:from-slate-950/90 sm:via-slate-950/40 sm:to-transparent" />
                  
                  {/* Banner Content Overlay */}
                  <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end sm:justify-center max-w-md space-y-1.5 sm:space-y-2 text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 drop-shadow-md">
                      <span>Hello, Traveler!</span>
                      <span className="text-2xl sm:text-3xl">👋</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 sm:text-slate-300 font-medium leading-relaxed drop-shadow">
                      We are here to guard you throughout your journey.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Travel Safety & Coordination Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Your Safety. Our Priority.
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  AI Tourist Guardian coordinates proactive safety alerts, automated 24-hour trip completion checks,
                  verified emergency contacts, and high-speed emergency response.
                </p>
              </div>

              {/* Core Feature Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Proactive Safety</h3>
                  <p className="text-xs text-slate-400">
                    24h trip-end safety automation, crowd heatmaps, and instant emergency alerts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Smart Routing</h3>
                  <p className="text-xs text-slate-400">
                    Safer route navigation avoiding high-risk or overcrowded event choke points.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Safety Passport</h3>
                  <p className="text-xs text-slate-400">
                    Encrypted document vault with official hotel and verification audit tracking.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  id="welcome-get-started-btn"
                  onClick={() => goToStep(2)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started (New Tourist Registration)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="welcome-sign-in-btn"
                  onClick={() => setAuthMode('LOGIN')}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Already have an account? Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 1 (ALT): SIGN IN SCREEN
             ========================================================================= */}
          {step === 1 && authMode === 'LOGIN' && (
            <div className="space-y-5 animate-in fade-in duration-200 text-left">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">Sign In to Your Safety Account</h2>
                <p className="text-xs text-slate-400">Enter your credentials to access your trips and safety passport.</p>
              </div>

              {/* Google Sign-In Quick Option */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs transition flex items-center justify-center gap-3 shadow-md cursor-pointer border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  Or Sign In with Email
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tourist@example.com"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowResetModal(true);
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('WELCOME')}
                    className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
                  </button>
                </div>
              </form>

              {/* Password Reset Modal */}
              {showResetModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Reset Your Password</h3>
                      <p className="text-xs text-slate-400">
                        Enter your registered email address to receive a secure password reset link from Firebase.
                      </p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="tourist@example.com"
                          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowResetModal(false)}
                          className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-1/2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Send Link</span>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              STEP 2: CHOOSE TOURIST TYPE
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="space-y-1 text-center">
                <h2 className="text-2xl font-black text-white">Choose Your Travel Identity</h2>
                <p className="text-xs text-slate-400">
                  Select your profile type to configure the proper identity validation & emergency embassy routing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTouristType('NATIONAL');
                    setCountryOfResidence('India');
                  }}
                  className={`p-6 rounded-2xl border text-left transition relative cursor-pointer ${
                    touristType === 'NATIONAL'
                      ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-slate-800 w-fit text-cyan-400 mb-3 shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-white">National Tourist</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Domestic traveller exploring within India with local phone, domestic identification, and regional safety alerts.
                  </p>
                  {touristType === 'NATIONAL' && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 absolute top-5 right-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTouristType('INTERNATIONAL');
                    setCountryOfResidence('United Kingdom');
                  }}
                  className={`p-6 rounded-2xl border text-left transition relative cursor-pointer ${
                    touristType === 'INTERNATIONAL'
                      ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="p-3 rounded-xl bg-slate-800 w-fit text-blue-400 mb-3 shadow-sm">
                    <Globe2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-white">International Tourist</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Overseas traveller with passport credentials, visa validity tracking, multilingual support, and dedicated embassy coordination.
                  </p>
                  {touristType === 'INTERNATIONAL' && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 absolute top-5 right-5" />
                  )}
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="tourist-type-continue-btn"
                  onClick={() => goToStep(3)}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Continue to Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: REAL USER REGISTRATION
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                  {touristType === 'INTERNATIONAL' ? '🌐 International Profile' : '🇮🇳 National Profile'}
                </div>
                <h2 className="text-2xl font-black text-white">Create Your Safety Account</h2>
                <p className="text-xs text-slate-400">
                  Your credentials are encrypted and stored in the secure Tourist Guardian registry.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Fayaz Mohammed / Elena Rostova"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tourist@traveler.com"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Phone (with country code) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210 or +44 7700 900077"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Country of Residence *</label>
                  <input
                    type="text"
                    required
                    value={countryOfResidence}
                    onChange={(e) => setCountryOfResidence(e.target.value)}
                    placeholder="e.g. India, United Kingdom, France"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Language *</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="ja">日本語 (Japanese)</option>
                    <option value="ar">العربية (Arabic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Create Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="register-submit-btn"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Register & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

          {/* =========================================================================
              STEP 4: TRAVEL IDENTITY DETAILS (PASSPORT/VISA OR DOMESTIC DETAILS)
             ========================================================================= */}
          {step === 4 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">
                  {touristType === 'INTERNATIONAL' ? 'International Passport & Visa Registry' : 'Domestic Origin & Identity Verification'}
                </h2>
                <p className="text-xs text-slate-400">
                  {touristType === 'INTERNATIONAL'
                    ? 'Passport and consular details allow authorities to coordinate with your home embassy in high-level emergencies.'
                    : 'Domestic ID verification links your safety profile to state emergency dispatch.'}
                </p>
              </div>

              {touristType === 'INTERNATIONAL' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Passport Number *</label>
                      <input
                        type="text"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        placeholder="e.g. GB98765432"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Visa Type *</label>
                      <input
                        type="text"
                        value={visaType}
                        onChange={(e) => setVisaType(e.target.value)}
                        placeholder="e.g. E-Tourist Visa (30 Days)"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Visa / Permit Number *</label>
                      <input
                        type="text"
                        value={visaNumber}
                        onChange={(e) => setVisaNumber(e.target.value)}
                        placeholder="e.g. IN-ETOUR-990011"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Travel Purpose</label>
                      <input
                        type="text"
                        value={travelPurpose}
                        onChange={(e) => setTravelPurpose(e.target.value)}
                        placeholder="e.g. Tourism / Conference"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Arrival Date in Country</label>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Expected Departure Date</label>
                      <input
                        type="date"
                        value={expectedDepartureDate}
                        onChange={(e) => setExpectedDepartureDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Embassy Section */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                      <Building className="w-4 h-4" />
                      <span>Home Country Embassy / Consular Mission in India</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Embassy Mission Name</label>
                        <input
                          type="text"
                          value={embassyName}
                          onChange={(e) => setEmbassyName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Consular Emergency Phone</label>
                        <input
                          type="text"
                          value={embassyPhone}
                          onChange={(e) => setEmbassyPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Official Document Verification Gateway: Verification will show "Pending Official Validation" until live government API key is attached.</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Domestic Traveller Safety Passport</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      You are registered under the National Domestic Safety Network. Your mobile verification enables real-time 24h trip safety checks and emergency dispatch integration with State Tourist Police.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="identity-details-save-btn"
                  onClick={handleSaveIdentity}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Save & Proceed to Consent Management</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 5: DEDICATED CONSENT SCREEN (MANDATORY TRANSPARENCY)
             ========================================================================= */}
          {step === 5 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Trust Privacy & Consent Architecture</span>
                </div>
                <h2 className="text-2xl font-black text-white">Granular Consent Management</h2>
                <p className="text-xs text-slate-400">
                  Under strict privacy regulations, you retain complete authority over how your travel data is shared.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Location Consent */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      Live Location Sharing for Safety Geofencing
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Shares coordinates exclusively to provide crowd overpressure alerts, safer route suggestions, and nearest emergency shelter routing.
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConsentLocation(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        consentLocation ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentLocation(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        !consentLocation ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Don't Allow
                    </button>
                  </div>
                </div>

                {/* 2. Emergency Data Sharing */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Emergency Data Dispatch to First Responders
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Permits transmission of your emergency contacts and safety passport to Tourist Police and EMTs when SOS is activated.
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConsentEmergency(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        consentEmergency ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentEmergency(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        !consentEmergency ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Don't Allow
                    </button>
                  </div>
                </div>

                {/* 3. Safety Alerts & Notifications */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Official Crisis & Weather Alerts
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Authorizes high-priority push notifications and SMS broadcasts for zone closures, severe weather, and event crowding.
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConsentAlerts(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        consentAlerts ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentAlerts(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        !consentAlerts ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Don't Allow
                    </button>
                  </div>
                </div>

                {/* 4. Public Feedback & Photos */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
                  <span className="text-xs font-bold text-white">Trip Feedback & Review Privacy Default</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsentFeedback('PRIVATE')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        consentFeedback === 'PRIVATE'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      🔒 Private Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentFeedback('AUTHORITY_ONLY')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        consentFeedback === 'AUTHORITY_ONLY'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      🏛️ Authority Service Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentFeedback('PUBLIC_MODERATED')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition text-left ${
                        consentFeedback === 'PUBLIC_MODERATED'
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      🌍 Public after Moderation
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="consent-confirm-btn"
                  onClick={handleSaveConsents}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Confirm Consent & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 6: EMERGENCY CONTACT SETUP (MANDATORY >= 1 CONTACT)
             ========================================================================= */}
          {step === 6 && (
            <form onSubmit={handleSaveEmergencyContact} className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 text-[11px] font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mandatory Safety Requirement</span>
                </div>
                <h2 className="text-2xl font-black text-white">Add Primary Emergency Contact</h2>
                <p className="text-xs text-slate-400">
                  At least ONE verified emergency contact is required so authorities can establish communications if an incident or unresponded safety check occurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={ecName}
                    onChange={(e) => setEcName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins / Rajesh Sharma"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Relationship *</label>
                  <select
                    value={ecRelationship}
                    onChange={(e) => setEcRelationship(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague / Guide">Colleague / Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (with Country Code) *</label>
                  <input
                    type="tel"
                    required
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contact Country *</label>
                  <input
                    type="text"
                    required
                    value={ecCountry}
                    onChange={(e) => setEcCountry(e.target.value)}
                    placeholder="India / UK / USA"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Preferred Emergency Contact Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['SMS', 'PHONE', 'WHATSAPP', 'EMAIL'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setEcMethod(method)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          ecMethod === method
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="emergency-contact-save-btn"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Save Contact & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 7: MANDATORY TRIP CREATION
             ========================================================================= */}
          {step === 7 && (
            <form onSubmit={handleSaveTrip} className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Mandatory Trip Lifecycle</span>
                </div>
                <h2 className="text-2xl font-black text-white">Create Your Active Trip</h2>
                <p className="text-xs text-slate-400">
                  Configures automated 24-hour safety reminders, zone telemetry, and return tracking.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trip Name / Itinerary Title *</label>
                  <input
                    type="text"
                    required
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
                    placeholder="e.g. Varanasi & Prayagraj Heritage Tour 2026"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Starting Origin *</label>
                  <input
                    type="text"
                    required
                    value={startingLocation}
                    onChange={(e) => setStartingLocation(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Destination(s) *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Varanasi, Prayagraj Ghats"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trip Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trip End Date (24h Check Window) *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setExpectedReturnDate(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Travel Mode</label>
                  <input
                    type="text"
                    value={travelMode}
                    onChange={(e) => setTravelMode(e.target.value)}
                    placeholder="Train / Flight / Bus"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Number of Travellers in Group</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={travellerCount}
                    onChange={(e) => setTravellerCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(6)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="trip-save-btn"
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Save Trip & Configure Accommodation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 8: ACCOMMODATION SETUP & VERIFICATION STATUS
             ========================================================================= */}
          {step === 8 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[11px] font-bold">
                  <Building className="w-3.5 h-3.5" />
                  <span>Official Accommodation Audit</span>
                </div>
                <h2 className="text-2xl font-black text-white">Your Stay & Accommodation</h2>
                <p className="text-xs text-slate-400">
                  Enter your hotel, guest house, or homestay. Unverified listings will show "Pending Verification".
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hotel / Property Name *</label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="e.g. Grand Heritage Palace"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Address / Landmark *</label>
                  <input
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    placeholder="e.g. Assi Ghat Road, Varanasi, UP"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Property Front Desk Phone</label>
                  <input
                    type="tel"
                    value={hotelPhone}
                    onChange={(e) => setHotelPhone(e.target.value)}
                    placeholder="+91 542 231 0099"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Verification Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Registry Verification Status:</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      Pending Authority Verification
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    This property has been registered in the Tourist Guardian safety registry. Authority safety inspection audit queued.
                  </p>
                </div>

                {/* Report Suspicious Toggle */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isReportingSuspicious}
                      onChange={(e) => setIsReportingSuspicious(e.target.checked)}
                      className="rounded text-red-500"
                    />
                    <span className="text-xs font-bold text-red-400">Report this property as suspicious / unlicensed</span>
                  </label>
                  {isReportingSuspicious && (
                    <input
                      type="text"
                      value={suspiciousReason}
                      onChange={(e) => setSuspiciousReason(e.target.value)}
                      placeholder="Reason (e.g. Unregistered address, fake contact, safety hazard)"
                      className="w-full px-3 py-2 bg-slate-950 border border-red-900/60 rounded-lg text-white text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="accommodation-save-btn"
                  onClick={handleSaveAccommodation}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Save Accommodation & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 9: SAFETY PREFERENCES
             ========================================================================= */}
          {step === 9 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Proactive Safety Configuration</span>
                </div>
                <h2 className="text-2xl font-black text-white">Alert Preferences</h2>
                <p className="text-xs text-slate-400">
                  Select which automated alerts you wish to receive during your active trip.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">👥 Crowd Density & Choke-Point Alerts</span>
                  <input
                    type="checkbox"
                    checked={prefCrowd}
                    onChange={(e) => setPrefCrowd(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">⛈️ Severe Weather & Rain Advisories</span>
                  <input
                    type="checkbox"
                    checked={prefWeather}
                    onChange={(e) => setPrefWeather(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">🚧 Road & Ghat Closure Warnings</span>
                  <input
                    type="checkbox"
                    checked={prefRoad}
                    onChange={(e) => setPrefRoad(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">🎪 Festival Event Safety Broadcasts</span>
                  <input
                    type="checkbox"
                    checked={prefEvent}
                    onChange={(e) => setPrefEvent(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">🚆 Transport Delays & Diversions</span>
                  <input
                    type="checkbox"
                    checked={prefTransport}
                    onChange={(e) => setPrefTransport(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>

                <label className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-white">🚨 Emergency & Police Bulletins</span>
                  <input
                    type="checkbox"
                    checked={prefEmergency}
                    onChange={(e) => setPrefEmergency(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(8)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="safety-prefs-save-btn"
                  onClick={handleSaveSafetyPreferences}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Save Preferences & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 10: LOCATION PERMISSION & CONSENT
             ========================================================================= */}
          {step === 10 && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[11px] font-bold">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Real-Time GIS Telemetry</span>
                </div>
                <h2 className="text-2xl font-black text-white">Location Access Permission</h2>
                <p className="text-xs text-slate-400">
                  Allowing device location enables instant response geofencing and safer route navigation around festival crowding.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <MapPin className="w-8 h-8" />
                </div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-white">Enable Real-Time Safety Navigation</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click below to trigger the browser location prompt. If denied, default city coordinates will be used.
                  </p>
                </div>

                {geoStatus === 'IDLE' && (
                  <button
                    type="button"
                    id="request-location-btn"
                    onClick={handleRequestLocation}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Request Location Permission</span>
                  </button>
                )}

                {geoStatus === 'ACQUIRING' && (
                  <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold py-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Acquiring satellite GPS coordinates...</span>
                  </div>
                )}

                {geoStatus === 'GRANTED' && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-bold inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>GPS Coordinates Acquired: {geoCoords?.lat.toFixed(4)}, {geoCoords?.lng.toFixed(4)}</span>
                  </div>
                )}

                {geoStatus === 'DENIED' && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-semibold inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Location access denied. Standard destination coordinates will be used.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => goToStep(9)}
                  className="w-1/3 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  id="location-proceed-btn"
                  onClick={() => goToStep(11)}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Review Safety Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 11: REGISTRATION COMPLETION & SAFETY PASSPORT SUMMARY
             ========================================================================= */}
          {step === 11 && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Your Safety Profile is Ready</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Review your configured safety parameters. You are now protected by AI Tourist Guardian.
                </p>
              </div>

              {/* Comprehensive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Identity & Account */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    Tourist Identity
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Name:</span> {fullName}</p>
                    <p><span className="text-slate-500">Email:</span> {email}</p>
                    <p><span className="text-slate-500">Phone:</span> {phone}</p>
                    <p><span className="text-slate-500">Type:</span> {touristType === 'INTERNATIONAL' ? 'International Tourist' : 'National Tourist'}</p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    Emergency Contact (Primary)
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Name:</span> {ecName}</p>
                    <p><span className="text-slate-500">Relation:</span> {ecRelationship}</p>
                    <p><span className="text-slate-500">Phone:</span> {ecPhone}</p>
                    <p><span className="text-slate-500">Dispatch:</span> {ecMethod} (Verified)</p>
                  </div>
                </div>

                {/* Active Trip */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-blue-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Active Trip Itinerary
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Title:</span> {tripTitle}</p>
                    <p><span className="text-slate-500">Destination:</span> {destination}</p>
                    <p><span className="text-slate-500">Dates:</span> {startDate} to {endDate}</p>
                    <p><span className="text-slate-500">24h Check:</span> Active & Scheduled</p>
                  </div>
                </div>

                {/* Stay & Consent */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    Stay & Safety Telemetry
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p><span className="text-slate-500">Hotel:</span> {hotelName}</p>
                    <p><span className="text-slate-500">Location Sharing:</span> {consentLocation ? 'Granted' : 'Off'}</p>
                    <p><span className="text-slate-500">Safety Readiness:</span> HIGH</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="enter-tourist-guardian-btn"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-emerald-600 hover:from-cyan-500 text-white font-black rounded-2xl text-sm transition shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Enter Tourist Guardian Dashboard</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
