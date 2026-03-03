import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

let io: SocketIOServer;

export async function GET(request: NextRequest) {
  if (!io) {
    // Create socket server if it doesn't exist
    io = new SocketIOServer({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      logger.info('Client connected', { socketId: socket.id });

      socket.on('call:initiate', (data) => {
        socket.to(data.recipientId).emit('call:incoming', data);
      });

      socket.on('call:signal', (data) => {
        socket.to(data.to).emit('call:signal', {
          ...data,
          from: socket.id,
        });
      });

      socket.on('call:end', (data) => {
        socket.to(data.recipientId).emit('call:ended');
      });

      socket.on('disconnect', () => {
        logger.info('Client disconnected', { socketId: socket.id });
      });
    });
  }

  return new NextResponse('Socket server initialized', {
    status: 200,
  });
}

