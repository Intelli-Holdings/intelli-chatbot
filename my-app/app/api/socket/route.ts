import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket?.server.io) {
    if (!res.socket) {
      res.end();
      return;
    }
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
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
    });

    res.socket.server.io = io;
  }

  res.end();
}

