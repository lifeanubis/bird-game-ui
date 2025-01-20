import { Server } from 'socket.io'

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO...')
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: 'http://localhost:3000', // Update with your frontend URL
        methods: ['GET', 'POST'],
      },
    })

    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id)

      socket.on('message', (msg) => {
        console.log('Message received:', msg)
        io.emit('message', msg) // Broadcast the message
      })

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id)
      })
    })
  } else {
    console.log('Socket.IO is already running.')
  }

  res.end()
}
