import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { NotificationMessage } from '@/types/notification';
import useActiveOrganizationId from './use-organization-id'; // Import the hook

const LOCAL_STORAGE_KEY = 'persistedNotifications';

export const useNotifications = () => {
  const activeOrganizationId = useActiveOrganizationId(); // Use the hook
  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [socket, setSocket] = useState<WebSocket | null>(null);
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
      setSocket(ws);
      reconnectAttempts.current = 0;
      
      // Dismiss any existing reconnecting toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      
      // Show connected toast
      toast.success('Connected to notification service', {
        duration: 3000,
      });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'notification') {
        updateNotifications(prev => [...prev, message]);
      } else if (message.type === 'connection_established') {
        toast.success(`Successfully connected to Notifications stream`, {
          duration: 3000,
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
      setSocket(null);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const timeoutDuration = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, timeoutDuration);
      } else {
        toast.error('Failed to connect to notification service. Please refresh the page.', {
          duration: Infinity,
          action: {
            label: 'Retry',
            onClick: () => {
              reconnectAttempts.current = 0;
              connect();
            },
          },
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Error connecting to notification service', {
        duration: 3000,
      });
    };

    return ws;
  }, [activeOrganizationId]);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  return { 
    notifications, 
    setNotifications: updateNotifications, 
    isConnected,
    reconnect 
  };
};