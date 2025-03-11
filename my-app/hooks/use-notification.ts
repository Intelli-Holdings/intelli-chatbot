import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { NotificationMessage } from '@/types/notification';
import useActiveOrganizationId from './use-organization-id';

const LOCAL_STORAGE_KEY = 'persistedNotifications';

const getStoredNotifications = (): NotificationMessage[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading notifications from localStorage:', error);
    return [];
  }
};

export const useNotifications = () => {
  const activeOrganizationId = useActiveOrganizationId();
  const [notifications, setNotifications] = useState<NotificationMessage[]>(getStoredNotifications);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 50;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);
  const toastIdRef = useRef<string | number>('');

  const persistNotifications = (newNotifications: NotificationMessage[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newNotifications));
  };

  const updateNotifications = (updater: (prev: NotificationMessage[]) => NotificationMessage[]) => {
    setNotifications(prev => {
      const updated = updater(prev);
      persistNotifications(updated);
      return updated;
    });
  };

  const connect = useCallback(() => {
    if (!activeOrganizationId) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}events/${activeOrganizationId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      toast.success('Connected to notification service', {
        duration: 3000,
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);

      const payload = data.message || data; // Extract actual notification

      if (payload.type === 'connection_established') {
        toast.success('Successfully connected to Notifications stream', {
          duration: 3000,
        });
      } else if (payload.type === 'notification') {
        updateNotifications(prev => {
          const updated = [payload, ...prev];
          console.log('Updated notifications:', updated);
          return updated;
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      toastIdRef.current = toast.error('Disconnected from notification service. Reconnecting...', {
        duration: Infinity,
      });

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      } else {
        toast.error('Failed to reconnect to notification service after multiple attempts.');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
  }, [activeOrganizationId]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    notifications,
    isConnected,
  };
};
