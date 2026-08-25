import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Trip,
  EmergencyContact,
  TravelDocument,
  TripFeedback,
  SafetyStatusLevel,
  AccommodationRecord,
  FollowUpTask,
  TripSafetyCheckStatus,
} from '../types';
import { useAuth } from './AuthContext';

export interface TripReminderState {
  tripId: string;
  stage: 'NONE' | 'REMINDER_1' | 'REMINDER_2' | 'REMINDER_3' | 'ESCALATED_MANUAL_FOLLOWUP';
  attemptCount: number;
  lastNotifiedAt: string | null;
  touristResponded: boolean;
  responseType?: 'SAFE' | 'NEED_HELP';
  respondedAt?: string;
  manualFollowupActionTaken?: 'CALLED' | 'RESOLVED_SAFE' | 'INCIDENT_CREATED';
}

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  emergencyContacts: EmergencyContact[];
  documents: TravelDocument[];
  feedbacks: TripFeedback[];
  followUpTasks: FollowUpTask[];
  accommodations: AccommodationRecord[];
  reminderState: TripReminderState;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt'>) => Promise<Trip>;
  updateTripStatus: (tripId: string, status: Trip['status']) => Promise<void>;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'createdAt'>) => Promise<EmergencyContact>;
  deleteEmergencyContact: (id: string) => Promise<void>;
  uploadDocument: (docData: Omit<TravelDocument, 'id' | 'createdAt'>) => Promise<TravelDocument>;
  deleteDocument: (id: string) => Promise<void>;
  submitFeedback: (feedbackData: Omit<TripFeedback, 'id' | 'createdAt'>) => Promise<TripFeedback>;
  respondToTripReminder: (response: 'SAFE' | 'NEED_HELP') => Promise<void>;
  simulateSchedulerStep: (forceNextAttempt?: boolean) => void;
  resetReminderSimulation: () => void;
  performManualFollowupAction: (taskId: string, action: 'CALLED_SAFE' | 'ESCALATED_INCIDENT') => Promise<void>;
  reportSuspiciousAccommodation: (name: string, address: string, reason: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [feedbacks, setFeedbacks] = useState<TripFeedback[]>([]);
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([]);
  const [accommodations, setAccommodations] = useState<AccommodationRecord[]>([]);

  // 24-Hour Trip End Safety Automation Engine State
  const [reminderState, setReminderState] = useState<TripReminderState>({
    tripId: '',
    stage: 'NONE',
    attemptCount: 0,
    lastNotifiedAt: null,
    touristResponded: false,
  });

  const isStaff =
    currentUser?.role &&
    ['TOURISM_AUTHORITY', 'SECURITY_POLICE', 'MEDICAL_RESPONDER', 'EVENT_ORGANIZER', 'ADMIN'].includes(
      currentUser.role
    );

  const activeTrip =
    trips.find((t) => (t.touristId === currentUser?.id || isStaff) && t.status === 'ACTIVE') ||
    trips.find((t) => t.status === 'ACTIVE') ||
    trips[0] ||
    null;

  // Real-time Firestore sync for Trips
  useEffect(() => {
    if (!currentUser) {
      setTrips([]);
      setEmergencyContacts([]);
      setDocuments([]);
      setFeedbacks([]);
      return;
    }

    try {
      const tripsQuery = isStaff
        ? collection(db, 'trips')
        : query(collection(db, 'trips'), where('touristId', '==', currentUser.id));

      const unsubTrips = onSnapshot(
        tripsQuery,
        (snap) => {
          const loadedTrips: Trip[] = [];
          snap.forEach((d) => loadedTrips.push({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }));
          loadedTrips.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setTrips(loadedTrips);

          // Update active reminder state if active trip exists
          const currentActive = loadedTrips.find((t) => t.status === 'ACTIVE');
          if (currentActive && currentActive.safetyCheckStatus && currentActive.safetyCheckStatus !== 'NOT_STARTED') {
            const stageMap: Record<TripSafetyCheckStatus, TripReminderState['stage']> = {
              NOT_STARTED: 'NONE',
              SCHEDULED: 'NONE',
              NOTIFICATION_1_SENT: 'REMINDER_1',
              NOTIFICATION_2_SENT: 'REMINDER_2',
              NOTIFICATION_3_SENT: 'REMINDER_3',
              UNRESPONDED: 'ESCALATED_MANUAL_FOLLOWUP',
              MANUAL_FOLLOWUP_REQUIRED: 'ESCALATED_MANUAL_FOLLOWUP',
              RESPONDED: 'NONE',
            };
            setReminderState((prev) => ({
              ...prev,
              tripId: currentActive.id,
              stage: stageMap[currentActive.safetyCheckStatus || 'NOT_STARTED'] || 'NONE',
              touristResponded: currentActive.safetyCheckStatus === 'RESPONDED',
              responseType: currentActive.safetyCheckResponseType,
              lastNotifiedAt: currentActive.lastSafetyCheckAt || new Date().toISOString(),
            }));
          }
        },
        (err) => console.error('Trips subscription error:', err)
      );

      // Emergency Contacts
      const contactsQuery = isStaff
        ? collection(db, 'emergencyContacts')
        : query(collection(db, 'emergencyContacts'), where('userId', '==', currentUser.id));

      const unsubContacts = onSnapshot(
        contactsQuery,
        (snap) => {
          const loaded: EmergencyContact[] = [];
          snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<EmergencyContact, 'id'>) }));
          setEmergencyContacts(loaded);
        },
        (err) => console.error('Contacts subscription error:', err)
      );

      // Documents
      const docsQuery = isStaff
        ? collection(db, 'documents')
        : query(collection(db, 'documents'), where('userId', '==', currentUser.id));

      const unsubDocs = onSnapshot(
        docsQuery,
        (snap) => {
          const loaded: TravelDocument[] = [];
          snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<TravelDocument, 'id'>) }));
          setDocuments(loaded);
        },
        (err) => console.error('Documents subscription error:', err)
      );

      // Feedback
      const unsubFeedback = onSnapshot(
        collection(db, 'feedback'),
        (snap) => {
          const loaded: TripFeedback[] = [];
          snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<TripFeedback, 'id'>) }));
          setFeedbacks(loaded);
        },
        (err) => console.error('Feedback subscription error:', err)
      );

      // Follow-up tasks (for Authorities)
      const unsubTasks = onSnapshot(
        collection(db, 'followUpTasks'),
        (snap) => {
          const loaded: FollowUpTask[] = [];
          snap.forEach((d) => loaded.push({ id: d.id, ...(d.data() as Omit<FollowUpTask, 'id'>) }));
          setFollowUpTasks(loaded);
        },
        (err) => console.error('Follow-up tasks subscription error:', err)
      );

      return () => {
        unsubTrips();
        unsubContacts();
        unsubDocs();
        unsubFeedback();
        unsubTasks();
      };
    } catch (err) {
      console.error('Firestore subscription initialization error:', err);
    }
  }, [currentUser, isStaff]);

  const logAudit = async (action: string, resource: string, details?: Record<string, unknown>) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id || 'system',
          actorEmail: currentUser?.email || 'system',
          actorRole: currentUser?.role || 'SYSTEM',
          action,
          resource,
          result: 'SUCCESS',
          details,
        }),
      });
    } catch {
      // Background audit log
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> => {
    const id = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...tripData,
      id,
      touristId: currentUser?.id || tripData.touristId,
      status: tripData.status || 'ACTIVE',
      riskLevel: tripData.riskLevel || 'LOW',
      safetyCheckStatus: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'trips', id), newTrip);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `trips/${id}`);
    }

    setTrips((prev) => [newTrip, ...prev]);
    await logAudit('CREATE_TRIP', 'TRIP_LIFECYCLE', { tripId: id, title: newTrip.title });
    return newTrip;
  };

  const updateTripStatus = async (tripId: string, status: Trip['status']) => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
    }
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    await logAudit('UPDATE_TRIP_STATUS', 'TRIP_LIFECYCLE', { tripId, newStatus: status });
  };

  const addEmergencyContact = async (
    contact: Omit<EmergencyContact, 'id' | 'createdAt'>
  ): Promise<EmergencyContact> => {
    const id = `contact-${Date.now()}`;
    const newContact: EmergencyContact = {
      ...contact,
      id,
      userId: currentUser?.id || contact.userId,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'emergencyContacts', id), newContact);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `emergencyContacts/${id}`);
    }

    setEmergencyContacts((prev) => [...prev, newContact]);
    await logAudit('ADD_EMERGENCY_CONTACT', 'SAFETY_PASSPORT', {
      contactName: contact.name,
      phone: contact.phone,
      userId: currentUser?.id,
    });
    return newContact;
  };

  const deleteEmergencyContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'emergencyContacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `emergencyContacts/${id}`);
    }
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    await logAudit('DELETE_EMERGENCY_CONTACT', 'SAFETY_PASSPORT', { contactId: id });
  };

  const uploadDocument = async (docData: Omit<TravelDocument, 'id' | 'createdAt'>): Promise<TravelDocument> => {
    const id = `doc-${Date.now()}`;
    const newDoc: TravelDocument = {
      ...docData,
      id,
      userId: currentUser?.id || docData.userId,
      verificationStatus: docData.verificationStatus || 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'documents', id), newDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `documents/${id}`);
    }

    setDocuments((prev) => [newDoc, ...prev]);
    await logAudit('UPLOAD_TRAVEL_DOCUMENT', 'DOCUMENT_VAULT', {
      type: docData.type,
      fileName: docData.fileName,
      verificationStatus: newDoc.verificationStatus,
    });
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await logAudit('DELETE_DOCUMENT', 'DOCUMENT_VAULT', { docId: id });
  };

  const submitFeedback = async (feedbackData: Omit<TripFeedback, 'id' | 'createdAt'>): Promise<TripFeedback> => {
    const id = `fb-${Date.now()}`;
    const newFb: TripFeedback = {
      ...feedbackData,
      id,
      touristId: currentUser?.id || feedbackData.touristId,
      touristName: currentUser?.name || feedbackData.touristName,
      moderationStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'feedback', id), newFb);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `feedback/${id}`);
    }

    setFeedbacks((prev) => [newFb, ...prev]);
    await logAudit('SUBMIT_FEEDBACK', 'COMMUNITY_EXPERIENCE', {
      tripId: feedbackData.tripId,
      rating: feedbackData.overallRating,
      consentLevel: feedbackData.consentLevel,
    });
    return newFb;
  };

  const respondToTripReminder = async (response: 'SAFE' | 'NEED_HELP') => {
    const now = new Date().toISOString();
    const currentTripId = activeTrip?.id || reminderState.tripId;

    setReminderState((prev) => ({
      ...prev,
      touristResponded: true,
      responseType: response,
      respondedAt: now,
      stage: response === 'SAFE' ? 'NONE' : prev.stage,
    }));

    if (currentTripId) {
      try {
        await updateDoc(doc(db, 'trips', currentTripId), {
          safetyCheckStatus: response === 'SAFE' ? 'RESPONDED' : 'UNRESPONDED',
          safetyCheckResponseType: response,
          safetyCheckRespondedAt: now,
          updatedAt: now,
        });
      } catch {
        // Handled
      }
    }

    await logAudit('RESPOND_24H_SAFETY_CHECK', 'AUTOMATION_ENGINE', {
      response,
      tripId: currentTripId,
      touristId: currentUser?.id,
    });
  };

  const simulateSchedulerStep = (forceNextAttempt?: boolean) => {
    setReminderState((prev) => {
      let nextStage = prev.stage;
      let nextCount = prev.attemptCount + 1;

      if (prev.stage === 'NONE') {
        nextStage = 'REMINDER_1';
        nextCount = 1;
      } else if (prev.stage === 'REMINDER_1') {
        nextStage = 'REMINDER_2';
        nextCount = 2;
      } else if (prev.stage === 'REMINDER_2') {
        nextStage = 'REMINDER_3';
        nextCount = 3;
      } else if (prev.stage === 'REMINDER_3' || forceNextAttempt) {
        nextStage = 'ESCALATED_MANUAL_FOLLOWUP';
        // Auto create follow up task in Firestore
        const taskId = `task-${Date.now()}`;
        const followUp: FollowUpTask = {
          id: taskId,
          tripId: activeTrip?.id || 'trip-active',
          touristId: currentUser?.id || 'tourist-user',
          touristName: currentUser?.name || 'Tourist Unresponsive',
          touristPhone: currentUser?.phoneNumber || '+91 98765 43210',
          reason: 'Tourist has not responded to 3 consecutive safety check notifications within 6 hours of trip completion window.',
          status: 'PENDING_MANUAL_CALL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'followUpTasks', taskId), followUp).catch(() => {});
      }

      return {
        ...prev,
        stage: nextStage,
        attemptCount: nextCount,
        lastNotifiedAt: new Date().toISOString(),
        touristResponded: false,
      };
    });
  };

  const resetReminderSimulation = () => {
    setReminderState({
      tripId: activeTrip?.id || '',
      stage: 'REMINDER_1',
      attemptCount: 1,
      lastNotifiedAt: new Date().toISOString(),
      touristResponded: false,
    });
  };

  const performManualFollowupAction = async (taskId: string, action: 'CALLED_SAFE' | 'ESCALATED_INCIDENT') => {
    try {
      await updateDoc(doc(db, 'followUpTasks', taskId), {
        status: action,
        assignedOperator: currentUser?.name || 'Control Officer',
        updatedAt: new Date().toISOString(),
      });
      setFollowUpTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: action, updatedAt: new Date().toISOString() } : t))
      );
    } catch {
      // Ignored
    }
    await logAudit('MANUAL_FOLLOWUP_ACTION', 'SAFETY_MONITOR', { taskId, action });
  };

  const reportSuspiciousAccommodation = async (name: string, address: string, reason: string) => {
    const recordId = `acc-${Date.now()}`;
    const rec: AccommodationRecord = {
      id: recordId,
      name,
      address,
      contactPhone: 'Reported by user',
      verificationStatus: 'REPORTED_SUSPICIOUS',
      isSuspicious: true,
      suspiciousReportsCount: 1,
      reportedBy: [currentUser?.id || 'anon'],
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'accommodations', recordId), rec);
    } catch {
      // Handled
    }
    setAccommodations((prev) => [...prev, rec]);
    await logAudit('REPORT_SUSPICIOUS_ACCOMMODATION', 'HOTEL_REGISTRY', { name, address, reason });
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        emergencyContacts,
        documents,
        feedbacks,
        followUpTasks,
        accommodations,
        reminderState,
        createTrip,
        updateTripStatus,
        addEmergencyContact,
        deleteEmergencyContact,
        uploadDocument,
        deleteDocument,
        submitFeedback,
        respondToTripReminder,
        simulateSchedulerStep,
        resetReminderSimulation,
        performManualFollowupAction,
        reportSuspiciousAccommodation,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
export const useTrip = useTrips;
