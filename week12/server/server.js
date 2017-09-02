// TODO: Do we want to use babel so that we can take advantage of ES modules?
require('./src/logging')
const argv = require('yargs').argv
const server = require('http').createServer()
const io = require('socket.io')(server)
const winston = require('winston')

const serverLogger = winston.loggers.get('server')
const authLogger = winston.loggers.get('auth')

const auth = require('./src/auth')
const PlayerManager = require('./src/playerManager')
const GameManager = require('./src/gameManager')
const Lobby = require('./src/lobby')

const tokenSecret = argv.secret || 'secret'
const port = argv.port || 80
const hostname = argv.hostname || '0.0.0.0'

const playerManager = new PlayerManager({ tokenSecret })
const gameManager = new GameManager()
const lobby = new Lobby({ playerManager, gameManager })

server.listen(port, hostname, () => {
  serverLogger.info(`Server running at http://${hostname}:${port}/`)
})

io.on('connection', (client) => {
  client.use((packet, next) => {
    switch (packet[0]) {
      case 'register':
        // Always allowed to register a new player
        return next()
      case 'authenticate':
        try {
          const decodedToken = auth.authenticate({ token: packet[1].token, secret: tokenSecret })
          client.authenticated = true
          client.playerId = decodedToken.id
          client.player = playerManager.getPlayer(client.playerId)
        } catch (err) {
          authLogger.error(err)
          client.emit('unauthorized')
          return next(new Error('Not authenticated'))
        }

        return next()
      default:
        if (!client.authenticated) {
          client.emit('unauthorized')
          return next(new Error('Not authenticated'))
        }

        return next()
    }
  })

  client.on('authenticate', (event) => {
    client.emit('authenticated')
  })

  client.on('disconnect', () => {
    // TODO: Do I want a GameManager class here that handles both lobbies and games?
    lobby.onPlayerLeave({ playerId: client.playerId })
  })

  client.on('register', () => {
    const playerPacket = playerManager.createNewPlayer()
    client.emit('registered', playerPacket)
  })

  lobby.registerLobbyEvents(client)

  client.on('settings', () => {
    // TODO: Settings
  })

  client.on('game', () => {
    // TODO: Game
  })
})
