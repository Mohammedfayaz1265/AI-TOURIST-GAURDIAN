import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TourismEvent, EventZone, SafetyAlert, AlertSeverity, AlertType, ZoneRiskStatus } from '../types';
import { calculateZoneRisk, generateArrivalDemandCurve, CrowdPredictionPoint } from '../lib/crowdEngine';
import { useAuth } from './AuthContext';

interface CrowdContextType {
  events: TourismEvent[];
  activeEvent: TourismEvent | null;
  alerts: SafetyAlert[];
  predictionCurve: CrowdPredictionPoint[];
  updateZoneFlow: (eventId: string, zoneId: string, deltaCount: number, entryFlow: number, exitFlow: number) => Promise<void>;
  createAlert: (alertData: {
    title: string;
    description: string;
    type: AlertType;
    severity: AlertSeverity;
    location: string;
    radiusKm?: number;
  }) => Promise<SafetyAlert>;
  resolveAlert: (alertId: string) => Promise<void>;
  generateNewPrediction: (hour?: number) => void;
}

const CrowdContext = createContext<CrowdContextType | undefined>(undefined);

export const CrowdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<TourismEvent[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [predictionCurve, setPredictionCurve] = useState<CrowdPredictionPoint[]>(() => generateArrivalDemandCurve(17));

  // Real-time Firestore sync for Events and Alerts
  useEffect(() => {
    try {
      const unsubAlerts = onSnapshot(
        collection(db, 'alerts'),
        (snapshot) => {
          const loaded: SafetyAlert[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<SafetyAlert, 'id'>) });
          });
          loaded.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setAlerts(loaded);
        },
        (err) => console.error('Alerts subscription error:', err)
      );

      const unsubEvents = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          const loaded: TourismEvent[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<TourismEvent, 'id'>) });
          });
          setEvents(loaded);
        },
        (err) => console.error('Events subscription error:', err)
      );

      return () => {
        unsubAlerts();
        unsubEvents();
      };
    } catch (err) {
      console.error('Crowd & alerts listener error:', err);
    }
  }, []);

  const activeEvent = events[0] || null;

  const logAudit = async (action: string, details?: Record<string, unknown>) => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: currentUser?.id || 'system',
          actorEmail: currentUser?.email || 'system',
          actorRole: currentUser?.role || 'TOURISM_AUTHORITY',
          action,
          resource: 'CROWD_AND_ALERT_ENGINE',
          result: 'SUCCESS',
          details,
        }),
      });
    } catch {
      // Ignored
    }
  };

  const updateZoneFlow = async (
    eventId: string,
    zoneId: string,
    deltaCount: number,
    entryFlow: number,
    exitFlow: number
  ) => {
    const targetEvent = events.find((ev) => ev.id === eventId);
    if (!targetEvent) return;

    let updatedStatus: ZoneRiskStatus = 'GREEN';
    let zoneTitle = '';

    const updatedZones = targetEvent.zones.map((z) => {
      if (z.id === zoneId) {
        zoneTitle = z.name;
        const newCount = Math.max(0, Math.min(z.capacity * 1.5, z.currentCount + deltaCount));
        const newStatus = calculateZoneRisk(newCount, z.capacity, entryFlow, exitFlow);
        const densityRatio = Number((newCount / z.capacity).toFixed(2));
        updatedStatus = newStatus;

        return {
          ...z,
          currentCount: newCount,
          entryFlow,
          exitFlow,
          status: newStatus,
          densityRatio,
          lastUpdated: new Date().toISOString(),
        };
      }
      return z;
    });

    const targetZone = updatedZones.find((z) => z.id === zoneId);

    try {
      await updateDoc(doc(db, 'events', eventId), {
        zones: updatedZones,
      });
    } catch (err) {
      // Update in local state
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, zones: updatedZones } : ev))
      );
    }

    // Auto trigger alert if escalated to RED
    if (targetZone && targetZone.status === 'RED') {
      await createAlert({
        title: `CRITICAL CROWD OVERPRESSURE - ${targetZone.name || zoneTitle}`,
        description: `Zone capacity exceeded. Crowd control protocol active. Ingress restricted.`,
        type: 'CROWD',
        severity: 'CRITICAL',
        location: targetZone.name || zoneTitle,
        radiusKm: 1.0,
      });
    }

    await logAudit('UPDATE_ZONE_FLOW', { eventId, zoneId, deltaCount, entryFlow, exitFlow, risk: updatedStatus });
  };

  const createAlert = async (alertData: {
    title: string;
    description: string;
    type: AlertType;
    severity: AlertSeverity;
    location: string;
    radiusKm?: number;
  }): Promise<SafetyAlert> => {
    const id = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert: SafetyAlert = {
      id,
      title: alertData.title,
      description: alertData.description,
      type: alertData.type,
      severity: alertData.severity,
      location: alertData.location,
      radiusKm: alertData.radiusKm || 2.0,
      source: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Official Tourism Command',
      authorId: currentUser?.id,
      authorRole: currentUser?.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'alerts', id), newAlert);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `alerts/${id}`);
    }

    setAlerts((prev) => [newAlert, ...prev]);
    await logAudit('CREATE_SAFETY_ALERT', { alertId: id, title: alertData.title, severity: alertData.severity });
    return newAlert;
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status: 'RESOLVED',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `alerts/${alertId}`);
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    );
    await logAudit('RESOLVE_SAFETY_ALERT', { alertId });
  };

  const generateNewPrediction = (hour = 18) => {
    setPredictionCurve(generateArrivalDemandCurve(hour));
  };

  return (
    <CrowdContext.Provider
      value={{
        events,
        activeEvent,
        alerts,
        predictionCurve,
        updateZoneFlow,
        createAlert,
        resolveAlert,
        generateNewPrediction,
      }}
    >
      {children}
    </CrowdContext.Provider>
  );
};

export const useCrowd = () => {
  const context = useContext(CrowdContext);
  if (!context) {
    throw new Error('useCrowd must be used within a CrowdProvider');
  }
  return context;
};
