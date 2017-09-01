// TODO: Do we want to use babel so that we can take advantage of ES modules?
const argv = require('yargs').argv
const server = require('http').createServer()
const io = require('socket.io')(server)

const port = argv.port || 80
const hostname = argv.hostname || '0.0.0.0'

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

io.on('connection', (socket) => {
  console.log('Connected')
  socket.emit('connect', { hello: 'world' })
})
