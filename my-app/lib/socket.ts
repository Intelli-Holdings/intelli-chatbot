import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const CALLS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CALLS === 'true';

export function getSocket(): Socket | null {
  if (!CALLS_ENABLED) {
    return null;
  }

  if (!socket) {
    const socketBaseUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    socket = io(socketBaseUrl, {
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
