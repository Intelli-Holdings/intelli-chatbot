import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Socket as NetSocket } from 'net'

interface SocketIOServer extends NetSocket {
    server: NetServer & {
      io: ServerIO
    }
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketIOServer | null
}
