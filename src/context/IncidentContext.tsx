import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Incident, IncidentStatus, IncidentType, SafetyStatusLevel, UserRole } from '../types';
import { useAuth } from './AuthContext';

interface IncidentContextType {
  incidents: Incident[];
  activeSosIncident: Incident | null;
  createIncident: (data: {
    type: IncidentType;
    severity: SafetyStatusLevel;
    locationDescription: string;
    description: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<Incident>;
  acknowledgeIncident: (incidentId: string, responderName?: string) => Promise<void>;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus, notes?: string) => Promise<void>;
  escalateIncident: (incidentId: string) => Promise<void>;
  closeIncident: (incidentId: string, resolutionNotes: string) => Promise<void>;
  generateAiIncidentSummary: (incidentId: string) => Promise<{ summary: string; disclaimer: string }>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Real-time Firestore sync for Incidents
  useEffect(() => {
    try {
      const q = query(collection(db, 'incidents'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: Incident[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<Incident, 'id'>) });
          });
          // Sort by creation date descending
          loaded.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setIncidents(loaded);
        },
        (err) => {
          console.error('Incidents subscription error:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error('Firestore incidents listener init error:', err);
    }
  }, []);

  // Active SOS triggered by the current user
  const activeSosIncident =
    incidents.find(
      (inc) =>
        inc.touristId === currentUser?.id &&
        inc.type === 'SOS' &&
        inc.status !== 'CLOSED' &&
        inc.status !== 'RESOLVED'
    ) || null;

  const logAudit = async (action: string, resourceId: string, details?: Record<string, unknown>) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id || 'system',
          actorEmail: currentUser?.email || 'system',
          actorRole: currentUser?.role || 'SYSTEM',
          action,
          resource: 'INCIDENT_PIPELINE',
          resourceId,
          result: 'SUCCESS',
          details,
        }),
      });
    } catch {
      // Graceful background audit
    }
  };

  const createIncident = async (data: {
    type: IncidentType;
    severity: SafetyStatusLevel;
    locationDescription: string;
    description: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Incident> => {
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIncident: Incident = {
      id: newId,
      touristId: currentUser?.id || 'tourist-anon',
      touristName: currentUser?.name || 'Traveller',
      touristPhone: currentUser?.phoneNumber || '+91 98765 43210',
      touristType: currentUser?.role === 'TOURIST_INTERNATIONAL' ? 'INTERNATIONAL' : 'NATIONAL',
      type: data.type,
      severity: data.severity,
      locationDescription: data.locationDescription,
      description: data.description,
      location: {
        latitude: data.latitude || 12.9716,
        longitude: data.longitude || 77.5946,
        address: data.locationDescription,
        zoneName: 'Central Festival Zone',
      },
      consentState: {
        locationShared: true,
        emergencyDataShared: true,
      },
      assignedTeam: 'Tourist Police & EMT Rapid Response',
      status: 'CREATED',
      escalationLevel: 1,
      externalDispatchStatus: 'NOT_CONNECTED_IN_DEV',
      actions: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: currentUser?.id || 'tourist',
          actorName: currentUser?.name || 'Tourist',
          actorRole: (currentUser?.role as UserRole) || 'TOURIST_NATIONAL',
          action: 'INCIDENT_CREATED',
          notes: data.description,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'incidents', newId), newIncident);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `incidents/${newId}`);
    }

    setIncidents((prev) => [newIncident, ...prev]);
    await logAudit('CREATE_EMERGENCY_INCIDENT', newId, {
      type: data.type,
      severity: data.severity,
      externalDispatch: 'NOT_CONNECTED_IN_DEV',
    });
    return newIncident;
  };

  const acknowledgeIncident = async (incidentId: string, responderName = 'Inspector V. Kumar (Tourist Police)') => {
    const now = new Date().toISOString();
    const existing = incidents.find((i) => i.id === incidentId);
    const updatedActions = [
      ...(existing?.actions || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        actorId: currentUser?.id || 'authority',
        actorName: currentUser?.name || 'Authority Dispatcher',
        actorRole: (currentUser?.role as UserRole) || 'TOURISM_AUTHORITY',
        action: 'ACKNOWLEDGED_AND_ASSIGNED',
        notes: `Assigned responder: ${responderName}`,
      },
    ];

    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'ACKNOWLEDGED',
        assignedResponderName: responderName,
        updatedAt: now,
        actions: updatedActions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${incidentId}`);
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'ACKNOWLEDGED',
              assignedResponderName: responderName,
              updatedAt: now,
              actions: updatedActions,
            }
          : inc
      )
    );
    await logAudit('ACKNOWLEDGE_INCIDENT', incidentId, { responderName });
  };

  const updateIncidentStatus = async (incidentId: string, status: IncidentStatus, notes?: string) => {
    const now = new Date().toISOString();
    const existing = incidents.find((i) => i.id === incidentId);
    const updatedActions = [
      ...(existing?.actions || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        actorId: currentUser?.id || 'responder',
        actorName: currentUser?.name || 'Assigned Officer',
        actorRole: (currentUser?.role as UserRole) || 'SECURITY_POLICE',
        action: `STATUS_UPDATED_TO_${status}`,
        notes: notes || `Operational status transitioned to ${status}`,
      },
    ];

    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status,
        updatedAt: now,
        actions: updatedActions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${incidentId}`);
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status,
              updatedAt: now,
              actions: updatedActions,
            }
          : inc
      )
    );
    await logAudit('UPDATE_INCIDENT_STATUS', incidentId, { newStatus: status, notes });
  };

  const escalateIncident = async (incidentId: string) => {
    const now = new Date().toISOString();
    const existing = incidents.find((i) => i.id === incidentId);
    const currentLevel = existing?.escalationLevel || 1;
    const nextLevel = Math.min(3, currentLevel + 1);

    const updatedActions = [
      ...(existing?.actions || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        actorId: currentUser?.id || 'authority',
        actorName: currentUser?.name || 'Authority Supervisor',
        actorRole: (currentUser?.role as UserRole) || 'TOURISM_AUTHORITY',
        action: `ESCALATED_LEVEL_${nextLevel}`,
        notes: `Emergency escalated to Level ${nextLevel} due to responder demand and zone condition.`,
      },
    ];

    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        escalationLevel: nextLevel,
        severity: 'CRITICAL',
        updatedAt: now,
        actions: updatedActions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${incidentId}`);
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              escalationLevel: nextLevel,
              severity: 'CRITICAL',
              updatedAt: now,
              actions: updatedActions,
            }
          : inc
      )
    );
    await logAudit('ESCALATE_INCIDENT', incidentId, { fromLevel: currentLevel, toLevel: nextLevel });
  };

  const closeIncident = async (incidentId: string, resolutionNotes: string) => {
    const now = new Date().toISOString();
    const existing = incidents.find((i) => i.id === incidentId);
    const updatedActions = [
      ...(existing?.actions || []),
      {
        id: `act-${Date.now()}`,
        timestamp: now,
        actorId: currentUser?.id || 'authority',
        actorName: currentUser?.name || 'Senior Watch Officer',
        actorRole: (currentUser?.role as UserRole) || 'TOURISM_AUTHORITY',
        action: 'INCIDENT_CLOSED_AND_ARCHIVED',
        notes: resolutionNotes,
      },
    ];

    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'CLOSED',
        resolvedAt: now,
        updatedAt: now,
        actions: updatedActions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${incidentId}`);
    }

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: 'CLOSED',
              resolvedAt: now,
              updatedAt: now,
              actions: updatedActions,
            }
          : inc
      )
    );
    await logAudit('CLOSE_INCIDENT', incidentId, { resolutionNotes });
  };

  const generateAiIncidentSummary = async (incidentId: string): Promise<{ summary: string; disclaimer: string }> => {
    const target = incidents.find((i) => i.id === incidentId);
    if (!target) {
      return {
        summary: 'Incident record not found.',
        disclaimer: 'AI-assisted summaries require active operational data.',
      };
    }

    try {
      const resp = await fetch('/api/ai/incident-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: target,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return {
          summary: data.summary,
          disclaimer: 'AI-generated summary for operational reference only. Official response logs must be reviewed directly.',
        };
      }
    } catch {
      // Fallback
    }

    return {
      summary: `Incident ${target.id} (${target.type}, ${target.severity}) reported by ${target.touristName} at ${target.locationDescription}. Status is ${target.status} with escalation level ${target.escalationLevel}. Immediate action: ${target.assignedResponderName || 'Rapid team dispatch'}.`,
      disclaimer: 'AI assistance generated from operational telemetry.',
    };
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeSosIncident,
        createIncident,
        acknowledgeIncident,
        updateIncidentStatus,
        escalateIncident,
        closeIncident,
        generateAiIncidentSummary,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
