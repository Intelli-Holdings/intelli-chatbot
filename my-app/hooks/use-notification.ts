import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { NotificationMessage } from '@/types/notification';
import { useOrganization } from '@clerk/nextjs';

export const useNotifications = () => {
  const { organization } = useOrganization();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 50;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);
  const toastIdRef = useRef<string | number>('');

  const connect = useCallback(() => {
    if (!organization?.id) return;

    const ws = new WebSocket(`wss://intelli-dev.onrender.com/ws/events/${organization.id}/`);
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
        setNotifications(prev => [...prev, message]);
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
  }, [organization?.id]);

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
    setNotifications, 
    isConnected,
    reconnect 
  };
};