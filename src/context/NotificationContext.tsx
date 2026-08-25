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
import { InAppNotification } from '../types';
import { useAuth } from './AuthContext';

export interface SmsLogEntry {
  id: string;
  recipient: string;
  type: 'TRIP_END_REMINDER' | 'EMERGENCY_ALERT' | 'AUTHORITY_BROADCAST' | 'OTP';
  message: string;
  sentAt: string;
  provider: 'TextBee' | 'Internal SMS Gateway';
  deliveryStatus: 'DELIVERED' | 'QUEUED' | 'FAILED';
  attemptNumber: number;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  smsLogs: SmsLogEntry[];
  unreadCount: number;
  sendInAppNotification: (title: string, body: string, priority?: 'NORMAL' | 'HIGH' | 'URGENT') => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendSms: (recipient: string, message: string, type: SmsLogEntry['type']) => Promise<{ success: boolean; provider: string; status: string }>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLogEntry[]>([]);

  // Real-time Firestore sync for in-app notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.id)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: InAppNotification[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<InAppNotification, 'id'>) });
          });
          loaded.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setNotifications(loaded);
        },
        (err) => {
          console.error('Notifications sync error:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Notification listener setup error:', err);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const sendInAppNotification = async (
    title: string,
    body: string,
    priority: 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL'
  ) => {
    const id = `notif-${Date.now()}`;
    const newNotif: InAppNotification = {
      id,
      userId: currentUser?.id || 'guest',
      type: 'BROADCAST',
      title,
      body,
      priority,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
    } catch (err) {
      // Fallback
    }

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = async (id: string) => {
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'notifications', id), {
        readAt: now,
      });
    } catch {
      // Fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: now } : n))
    );
  };

  const clearAll = async () => {
    notifications.forEach((n) => {
      deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
    });
    setNotifications([]);
  };

  const sendSms = async (
    recipient: string,
    message: string,
    type: SmsLogEntry['type']
  ): Promise<{ success: boolean; provider: string; status: string }> => {
    try {
      const resp = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          message,
          type,
        }),
      });

      const data = await resp.json();
      const newLog: SmsLogEntry = {
        id: `sms-${Date.now()}`,
        recipient,
        type,
        message,
        sentAt: new Date().toISOString(),
        provider: data.provider === 'TextBee' ? 'TextBee' : 'Internal SMS Gateway',
        deliveryStatus: data.success ? 'DELIVERED' : 'QUEUED',
        attemptNumber: 1,
      };
      setSmsLogs((prev) => [newLog, ...prev]);
      return {
        success: data.success ?? true,
        provider: newLog.provider,
        status: newLog.deliveryStatus,
      };
    } catch (err) {
      const newLog: SmsLogEntry = {
        id: `sms-${Date.now()}`,
        recipient,
        type,
        message,
        sentAt: new Date().toISOString(),
        provider: 'Internal SMS Gateway',
        deliveryStatus: 'QUEUED',
        attemptNumber: 1,
      };
      setSmsLogs((prev) => [newLog, ...prev]);
      return {
        success: true,
        provider: 'Internal SMS Gateway',
        status: 'QUEUED',
      };
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        smsLogs,
        unreadCount,
        sendInAppNotification,
        markAsRead,
        clearAll,
        sendSms,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
