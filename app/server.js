// // server.js
// import express from 'express'
// import http from 'http'
// import { Server } from 'socket.io'

// const app = express()
// const server = http.createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Replace with your React app URL
//     methods: ['GET', 'POST'],
//   },
// })

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id)

//   // Listen for messages
//   socket.on('message', (msg) => {
//     console.log('Message received:', msg)
//     io.emit('message', msg) // Broadcast to all clients
//   })

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id)
//   })
// })

// // Start the server
// const PORT = 4000
// server.listen(PORT, () => {
//   console.log(`Socket.IO server running at http://localhost:${PORT}`)
// })
