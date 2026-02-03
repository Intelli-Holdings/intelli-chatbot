import { Server as SocketIOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let io: SocketIOServer;

export async function GET(request: NextRequest) {
  if (!io) {
    // Create socket server if it doesn't exist
    io = new SocketIOServer({
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

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
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  return new NextResponse('Socket server initialized', {
    status: 200,
  });
}

