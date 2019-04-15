const express = require('express')
const app = express()
const port = 8080

// Sockets

const server = app.listen(port, () => {
  console.log(`the server is up on port: ${port}`)
})

const io = require('socket.io').listen(server)

app.get('/', (req, res) => {
  res.send({ Hello: 'World' })
})

io.on('connection', socket => {
  socket.on('newUser', data => {
    socket.broadcast.emit('newUser', data)
  })
  socket.on('messages', data => {
    io.sockets.emit('messages', data)
  })
})
