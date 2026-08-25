import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import firebaseConfigJson from '../../firebase-applet-config.json';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ? (import.meta as unknown as { env: Record<string, string | undefined> }).env
    : {};

export const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || '',
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || '',
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || '',
  databaseURL:
    env.VITE_FIREBASE_DATABASE_URL ||
    (firebaseConfigJson as { databaseURL?: string }).databaseURL ||
    'https://ai-tourist-gaurdian-default-rtdb.asia-southeast1.firebasedatabase.app',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || '',
  measurementId:
    env.VITE_FIREBASE_MEASUREMENT_ID ||
    (firebaseConfigJson as { measurementId?: string }).measurementId ||
    'G-GWXJKEN007',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use standard Firestore database (default) or custom database if specified
const customDbId = (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = customDbId && customDbId !== '(default)' ? getFirestore(app, customDbId) : getFirestore(app);

// Firebase Realtime Database instance (connected to databaseURL)
export const rtdb = getDatabase(app);

// Test database connection helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_health', 'probe'));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client offline or connection unreachable:', error.message);
      return false;
    }
    // Expected in new collections if probe doc doesn't exist yet but DB responds
    return true;
  }
}
