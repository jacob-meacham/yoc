const shuffle = require('shuffle-array')

class Lobby {
  constructor({ playerManager, gameManager }) {
    this.playerManager = playerManager
    this.gameManager = gameManager
    this.players = {}
  }

  onPlayerJoin({ playerId, socket }) {
    // TODO: Clean this up. Should it just be a class?
    this.players[playerId] = {
      playerId: playerId,
      player: this.playerManager.getPlayer(playerId),
      socket,
      partnerId: null,
      acceptedGame: false
    }

    socket.emit('lobby:joined')

    this.matchPlayers()
  }

  matchPlayers() {
    const freePlayers = shuffle(Object.values(this.players).filter((p) => p.partnerId === null))
    console.log(freePlayers)

    while (freePlayers.length >= 2) {
      console.log('matching')
      const player1 = freePlayers.pop()
      const player2 = freePlayers.pop()

      player1.partnerId = player2.playerId
      player2.partnerId = player1.playerId

      player1.socket.emit('lobby:matched', player2.player)
      player2.socket.emit('lobby:matched', player1.player)
    }
  }

  handlePlayerError(playerId) {
    if (!this.players[playerId]) {
      console.error(`No player found for ${playerId}`)
      return false
    }

    return true
  }

  getPartner(playerId) {
    const partnerId = this.players[playerId].partnerId || 0
    return this.players[partnerId]
  }

  onPlayerLeave({ playerId }) {
    if (!this.handlePlayerError(playerId)) {
      return
    }

    const partner = this.getPartner(playerId)
    if (partner) {
      partner.partnerId = null
      partner.acceptedGame = false
      partner.socket.emit('lobby:partnerLeft')
    }

    this.players[playerId].socket.emit('lobby:left')
    delete this.players[playerId]

    this.matchPlayers()
  }

  onAcceptGame({ playerId }) {
    if (!this.handlePlayerError(playerId)) {
      return
    }

    const player = this.players[playerId]
    player.acceptedGame = true
    const partner = this.getPartner(playerId)

    player.socket.emit('lobby:accepted')
    partner.socket.emit('lobby:partnerAccepted', partner.player)

    if (partner.acceptedGame === true) {
      // TODO: We really need to make a socketedPlayer class, that passes around a playerId and a socket.
      this.gameManager.startGame({ player1: player, player2: partner })
      delete this.players[player.playerId]
      delete this.players[partner.playerId]
    }
  }

  registerLobbyEvents(client) {
    client.on('lobby:join', () => {
      this.onPlayerJoin({ playerId: client.playerId, socket: client })
    })

    client.on('lobby:acceptGame', () => {
      this.onAcceptGame({ playerId: client.playerId, socket: client })
    })

    client.on('lobby:leave', () => {
      this.onPlayerLeave({ playerId: client.playerId })
    })
  }
}

module.exports = Lobby
