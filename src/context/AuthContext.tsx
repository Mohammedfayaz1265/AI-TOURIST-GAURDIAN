import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, UserRole, AccountStatus, TouristProfile, SafetyPreferences } from '../types';

export function formatAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = (error as { code?: string })?.code || '';
  const message = error instanceof Error ? error.message : String(error);

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in provider is disabled in the Firebase Console for project "ai-tourist-gaurdian". Please ensure "Email/Password" is enabled in Firebase Console (Authentication > Sign-in method).';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
    case 'auth/user-not-found':
      return 'No registered account found with this email. Please check your spelling or register as a new tourist.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify and try again, or use password reset.';
    case 'auth/invalid-credential':
      return 'Invalid email or password credentials. Please verify your details.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to multiple failed login attempts. Please try again in a few moments.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by system administrators.';
    case 'auth/popup-closed-by-user':
      return 'The Google Sign-In popup was closed before finishing authentication.';
    case 'auth/popup-blocked':
      return 'Google Sign-In popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/cancelled-popup-request':
      return 'Google Sign-In request was cancelled.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connectivity.';
    default:
      if (message.includes('auth/operation-not-allowed')) {
        return 'Email/Password sign-in is disabled in your Firebase Project console. Please enable it in Firebase Console (Authentication > Sign-in method > Email/Password) or use Google Sign-In.';
      }
      return message || 'Authentication failed. Please verify your credentials.';
  }
}

export const TEST_ACCOUNTS: Record<UserRole, User> = {
  TOURIST_NATIONAL: {
    id: 'test-tourist-national-01',
    email: 'fayaz.tourist@guardian.org',
    name: 'Fayaz Mohammed',
    role: 'TOURIST_NATIONAL',
    phoneNumber: '+91 98765 43210',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    countryOfResidence: 'India',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-08-01T10:00:00Z',
    isTestAccount: true,
  },
  TOURIST_INTERNATIONAL: {
    id: 'test-tourist-intl-02',
    email: 'elena.rostova@traveler.com',
    name: 'Elena Rostova',
    role: 'TOURIST_INTERNATIONAL',
    phoneNumber: '+44 7700 900077',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    countryOfResidence: 'United Kingdom',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-08-05T12:00:00Z',
    isTestAccount: true,
  },
  TOURISM_AUTHORITY: {
    id: 'test-authority-03',
    email: 'rajesh.sharma@tourism.gov.in',
    name: 'Director Rajesh Sharma',
    role: 'TOURISM_AUTHORITY',
    phoneNumber: '+91 99112 33445',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-07-15T09:00:00Z',
    isTestAccount: true,
  },
  EVENT_ORGANIZER: {
    id: 'test-organizer-04',
    email: 'priya.nair@festivals.in',
    name: 'Priya Nair (Festival Lead)',
    role: 'EVENT_ORGANIZER',
    phoneNumber: '+91 98221 55667',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-07-20T11:30:00Z',
    isTestAccount: true,
  },
  SECURITY_POLICE: {
    id: 'test-police-05',
    email: 'inspector.kumar@touristpolice.gov',
    name: 'Inspector V. Kumar',
    role: 'SECURITY_POLICE',
    phoneNumber: '+91 94440 12345',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-07-10T08:00:00Z',
    isTestAccount: true,
  },
  MEDICAL_RESPONDER: {
    id: 'test-medical-06',
    email: 'dr.ananya@rapidmedical.org',
    name: 'Dr. Ananya Sen (EMT Alpha)',
    role: 'MEDICAL_RESPONDER',
    phoneNumber: '+91 93330 99887',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-07-12T07:45:00Z',
    isTestAccount: true,
  },
  HOTEL: {
    id: 'test-hotel-07',
    email: 'manager@tajpalace.com',
    name: 'Grand Heritage Hotel Manager',
    role: 'HOTEL',
    phoneNumber: '+91 91111 22334',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-07-18T14:00:00Z',
    isTestAccount: true,
  },
  ADMIN: {
    id: 'test-admin-08',
    email: 'admin.security@guardian.internal',
    name: 'Chief Systems Administrator',
    role: 'ADMIN',
    phoneNumber: '+91 90000 00001',
    preferredLanguage: 'en',
    status: 'ACTIVE',
    onboardingStep: 12,
    onboardingComplete: true,
    createdAt: '2026-06-01T00:00:00Z',
    isTestAccount: true,
  },
};

interface RegisterPayload {
  email: string;
  pass: string;
  name: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  gender?: string;
  countryOfResidence?: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  currentUser: User | null;
  touristProfile: TouristProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (payload: RegisterPayload) => Promise<User>;
  signInWithGoogle: (selectedRole?: UserRole) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchTestRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateTouristProfile: (data: Partial<TouristProfile>) => Promise<void>;
  saveOnboardingStep: (step: number, profileUpdates?: Partial<TouristProfile>, userUpdates?: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [touristProfile, setTouristProfile] = useState<TouristProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoMode] = useState(false);

  // Log audit action helper
  const logAudit = async (action: string, result: 'SUCCESS' | 'DENIED' | 'FAILED', details?: Record<string, unknown>) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id || 'anonymous',
          actorEmail: currentUser?.email || 'anonymous',
          actorRole: currentUser?.role || 'USER',
          action,
          resource: 'AUTH_SERVICE',
          result,
          details,
        }),
      });
    } catch {
      // Background audit logging
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const uData = docSnap.data() as User;
            setCurrentUser(uData);
          } else {
            // Document doesn't exist yet (e.g. newly signed in via Google)
            const defaultUser: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || (fbUser.email?.split('@')[0] || 'Traveler'),
              role: 'TOURIST_NATIONAL',
              phoneNumber: fbUser.phoneNumber || '',
              preferredLanguage: 'en',
              status: 'ACTIVE',
              countryOfResidence: 'India',
              onboardingStep: 2,
              onboardingComplete: false,
              createdAt: new Date().toISOString(),
              isTestAccount: false,
            };
            await setDoc(userDocRef, defaultUser);
            setCurrentUser(defaultUser);
          }

          const profileDocRef = doc(db, 'touristProfiles', fbUser.uid);
          const profileSnap = await getDoc(profileDocRef);
          if (profileSnap.exists()) {
            setTouristProfile(profileSnap.data() as TouristProfile);
          } else {
            const defaultProfile: TouristProfile = {
              userId: fbUser.uid,
              touristType: 'NATIONAL',
              nationality: 'Indian',
              safetyReadinessStatus: 'HIGH',
              locationSharingEnabled: true,
              safetyPreferences: {
                crowdAlerts: true,
                weatherAlerts: true,
                roadAlerts: true,
                eventAlerts: true,
                transportAlerts: true,
                emergencyAlerts: true,
                healthAlerts: true,
              },
              locationConsent: {
                granted: false,
                trackingStatus: 'NOT_REQUESTED',
                timestamp: new Date().toISOString(),
              },
              updatedAt: new Date().toISOString(),
            };
            await setDoc(profileDocRef, defaultProfile);
            setTouristProfile(defaultProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else {
        setCurrentUser((prev) => (prev?.isTestAccount ? prev : null));
        setTouristProfile((prev) => (currentUser?.isTestAccount ? prev : null));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const u = docSnap.data() as User;
        setCurrentUser(u);
      }

      const profileDocRef = doc(db, 'touristProfiles', cred.user.uid);
      const profileSnap = await getDoc(profileDocRef);
      if (profileSnap.exists()) {
        setTouristProfile(profileSnap.data() as TouristProfile);
      }

      await logAudit('USER_LOGIN', 'SUCCESS', { email: cred.user.email, userId: cred.user.uid });
    } catch (err: unknown) {
      await logAudit('USER_LOGIN', 'FAILED', { email, error: err instanceof Error ? err.message : 'Unknown' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (payload: RegisterPayload): Promise<User> => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.pass);
      const uid = cred.user.uid;

      const isIntl = payload.role === 'TOURIST_INTERNATIONAL';
      const newUser: User = {
        id: uid,
        email: payload.email.trim(),
        name: payload.name.trim(),
        role: payload.role,
        phoneNumber: payload.phone || '',
        preferredLanguage: payload.preferredLanguage || 'en',
        dob: payload.dob || '',
        gender: payload.gender || '',
        countryOfResidence: payload.countryOfResidence || (isIntl ? 'International' : 'India'),
        status: 'ACTIVE',
        onboardingStep: 3,
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        isTestAccount: false,
      };

      const newProfile: TouristProfile = {
        userId: uid,
        touristType: isIntl ? 'INTERNATIONAL' : 'NATIONAL',
        nationality: payload.countryOfResidence || (isIntl ? '' : 'Indian'),
        safetyReadinessStatus: 'HIGH',
        locationSharingEnabled: true,
        safetyPreferences: {
          crowdAlerts: true,
          weatherAlerts: true,
          roadAlerts: true,
          eventAlerts: true,
          transportAlerts: true,
          emergencyAlerts: true,
          healthAlerts: true,
        },
        locationConsent: {
          granted: false,
          trackingStatus: 'NOT_REQUESTED',
          timestamp: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', uid), newUser);
        await setDoc(doc(db, 'touristProfiles', uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }

      setCurrentUser(newUser);
      setTouristProfile(newProfile);
      await logAudit('USER_REGISTER', 'SUCCESS', { email: payload.email, role: payload.role, userId: uid });
      return newUser;
    } catch (err: unknown) {
      await logAudit('USER_REGISTER', 'FAILED', { email: payload.email, role: payload.role, error: err instanceof Error ? err.message : 'Unknown' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (selectedRole: UserRole = 'TOURIST_NATIONAL'): Promise<User> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const uid = cred.user.uid;
      const email = cred.user.email || '';
      const name = cred.user.displayName || (email.split('@')[0] || 'Traveler');

      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const u = docSnap.data() as User;
        setCurrentUser(u);
        const profileDocRef = doc(db, 'touristProfiles', uid);
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists()) {
          setTouristProfile(profileSnap.data() as TouristProfile);
        }
        await logAudit('USER_GOOGLE_LOGIN', 'SUCCESS', { email, userId: uid });
        return u;
      } else {
        const isIntl = selectedRole === 'TOURIST_INTERNATIONAL';
        const newUser: User = {
          id: uid,
          email,
          name,
          role: selectedRole,
          phoneNumber: cred.user.phoneNumber || '',
          preferredLanguage: 'en',
          status: 'ACTIVE',
          countryOfResidence: isIntl ? 'International' : 'India',
          onboardingStep: 2,
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          isTestAccount: false,
        };

        const newProfile: TouristProfile = {
          userId: uid,
          touristType: isIntl ? 'INTERNATIONAL' : 'NATIONAL',
          nationality: isIntl ? '' : 'Indian',
          safetyReadinessStatus: 'HIGH',
          locationSharingEnabled: true,
          safetyPreferences: {
            crowdAlerts: true,
            weatherAlerts: true,
            roadAlerts: true,
            eventAlerts: true,
            transportAlerts: true,
            emergencyAlerts: true,
            healthAlerts: true,
          },
          locationConsent: {
            granted: false,
            trackingStatus: 'NOT_REQUESTED',
            timestamp: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', uid), newUser);
          await setDoc(doc(db, 'touristProfiles', uid), newProfile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }

        setCurrentUser(newUser);
        setTouristProfile(newProfile);
        await logAudit('USER_GOOGLE_REGISTER', 'SUCCESS', { email, role: selectedRole, userId: uid });
        return newUser;
      }
    } catch (err: unknown) {
      await logAudit('USER_GOOGLE_AUTH', 'FAILED', { error: err instanceof Error ? err.message : 'Unknown' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid registered email address.');
    }
    await sendPasswordResetEmail(auth, email.trim());
    await logAudit('PASSWORD_RESET_REQUESTED', 'SUCCESS', { email });
  };

  const saveOnboardingStep = async (
    step: number,
    profileUpdates?: Partial<TouristProfile>,
    userUpdates?: Partial<User>
  ) => {
    if (!currentUser) return;
    const updatedUser: User = {
      ...currentUser,
      ...userUpdates,
      onboardingStep: step,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);

    if (touristProfile || profileUpdates) {
      const updatedProfile: TouristProfile = {
        ...(touristProfile || {
          userId: currentUser.id,
          touristType: currentUser.role === 'TOURIST_INTERNATIONAL' ? 'INTERNATIONAL' : 'NATIONAL',
          safetyReadinessStatus: 'HIGH',
          locationSharingEnabled: true,
        }),
        ...profileUpdates,
        updatedAt: new Date().toISOString(),
      };
      setTouristProfile(updatedProfile);

      if (firebaseUser) {
        try {
          await setDoc(doc(db, 'touristProfiles', currentUser.id), updatedProfile, { merge: true });
        } catch (err) {
          console.error('Failed to sync tourist profile update to Firestore:', err);
        }
      }
    }

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.id), updatedUser, { merge: true });
      } catch (err) {
        console.error('Failed to sync user update to Firestore:', err);
      }
    }

    await logAudit('SAVE_ONBOARDING_STEP', 'SUCCESS', { step, userId: currentUser.id });
  };

  const completeOnboarding = async () => {
    if (!currentUser) return;
    const completedUser: User = {
      ...currentUser,
      onboardingStep: 12,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(completedUser);

    if (firebaseUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          onboardingStep: 12,
          onboardingComplete: true,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to mark onboarding complete in Firestore:', err);
      }
    }
    await logAudit('COMPLETE_ONBOARDING', 'SUCCESS', { userId: currentUser.id });
  };

  const switchTestRole = async (role: UserRole) => {
    const account = TEST_ACCOUNTS[role];
    setCurrentUser(account);
    setDemoMode(true);
    setTouristProfile({
      userId: account.id,
      touristType: role === 'TOURIST_INTERNATIONAL' ? 'INTERNATIONAL' : 'NATIONAL',
      nationality: role === 'TOURIST_INTERNATIONAL' ? 'United Kingdom' : 'Indian',
      safetyReadinessStatus: 'HIGH',
      locationSharingEnabled: true,
      updatedAt: new Date().toISOString(),
    });
    await logAudit('SWITCH_TEST_ROLE', 'SUCCESS', { newRole: role, actorName: account.name });
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.id), updated, { merge: true });
      } catch (err) {
        console.error('Failed to sync profile update to Firestore:', err);
      }
    }
    await logAudit('UPDATE_USER_PROFILE', 'SUCCESS', { updatedKeys: Object.keys(data) });
  };

  const updateTouristProfile = async (data: Partial<TouristProfile>) => {
    if (!currentUser) return;
    const updated = {
      ...(touristProfile || {
        userId: currentUser.id,
        touristType: currentUser.role === 'TOURIST_INTERNATIONAL' ? 'INTERNATIONAL' : 'NATIONAL',
        safetyReadinessStatus: 'HIGH',
        locationSharingEnabled: true,
      }),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setTouristProfile(updated);
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'touristProfiles', currentUser.id), updated, { merge: true });
      } catch (err) {
        console.error('Failed to sync tourist profile update to Firestore:', err);
      }
    }
    await logAudit('UPDATE_TOURIST_PROFILE', 'SUCCESS', { updatedKeys: Object.keys(data) });
  };

  const logout = async () => {
    await logAudit('USER_LOGOUT', 'SUCCESS', { userId: currentUser?.id });
    try {
      await fbSignOut(auth);
    } catch {
      // Ignored
    }
    setCurrentUser(null);
    setTouristProfile(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        touristProfile,
        firebaseUser,
        loading,
        loginWithEmail,
        registerWithEmail,
        signInWithGoogle,
        resetPassword,
        logout,
        switchTestRole,
        updateUserProfile,
        updateTouristProfile,
        saveOnboardingStep,
        completeOnboarding,
        isDemoMode,
        setDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

