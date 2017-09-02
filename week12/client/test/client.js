// TODO: Do we want to use babel so that we can take advantage of ES modules?
const argv = require('yargs').argv

const socket = require('socket.io-client')(argv.server)

socket.on('connect', () => {
  socket.emit('register', { })

  socket.on('registered', (event) => {
    console.log(event)
    socket.emit('authenticate', { token: event.token })
  })
})

socket.on('authenticated', () => {
  console.log('authenticated!')

  socket.emit('lobby:join')

  socket.on('lobby:joined', (event) => {
    console.log('joined lobby')
  })

  socket.on('lobby:matched', (event) => {
    console.log('matched')
    console.log(event)
    socket.emit('lobby:acceptGame')
  })

  socket.on('lobby:accepted', (event) => {
    console.log('accepted game!')
  })

  socket.on('lobby:partnerAccepted', (event) => {
    console.log('partner accepted game!')
    console.log(event)
  })

  socket.on('lobby:partnerLeft', () => {
    console.log('partner left game!')
  })

  socket.on('game:starting', () => {
    console.log('Game starting!')
  })

  socket.on('game:started', () => {
    console.log('Game started!')
  })

  socket.on('game:state', (event) => {
    console.log('Game state')
    console.log(event)
  })
})

socket.on('unauthorized', () => {
  console.error('unauthorized')
})

setInterval(function(){}, Number.POSITIVE_INFINITY)
