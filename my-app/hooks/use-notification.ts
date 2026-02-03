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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5; // Set volume to 50%
    }
  }, []);

  // Function to play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      // Reset audio to beginning in case it's already playing
      audioRef.current.currentTime = 0;
      // Play sound and catch any errors (e.g., user hasn't interacted with page yet)
      audioRef.current.play().catch(() => {
        // Silently fail if browser blocks autoplay
      });
    }
  }, []);

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

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/events/${activeOrganizationId}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const payload = data.message || data; // Extract actual notification

      if (payload.type === 'connection_established') {
        // Connection established
      } else if (payload.type === 'notification') {
        // Play notification sound
        playNotificationSound();

        updateNotifications(prev => {
          const updated = [payload, ...prev];
          return updated;
        });
      }
    };

    ws.onclose = () => {
      setIsConnected(false);

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [activeOrganizationId, playNotificationSound]);

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
