const express = require('express')
const app = express()
const port = 8080
const fs = require('fs')
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'static')))
// Sockets
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
const multer = require('multer')
const storage = multer.diskStorage({
  destination: './static/uploads',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb)
  }
})

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)
  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('Error: Images Only!')
  }
}
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
  socket.on('onEdit', data => {
    socket.broadcast.emit('onEdit', data)
  })
  socket.on('videoStart', data => {
    socket.broadcast.emit('onEdit', data)
  })
})

app.post('/picture', upload.array('files', 10), (req, res) => {
  let files = req.files
  console.log(files[0].path)
  return res.send({ path: files[0].path })
})
