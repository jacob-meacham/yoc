const Player = require('./player')
const auth = require('./auth')
const crypto = require('crypto')

class PlayerManager {
  constructor({ tokenSecret }) {
    this.tokenSecret = tokenSecret
    this.players = { }
  }

  createNewPlayer() {
    const playerId = crypto.randomBytes(16).toString('hex')
    const player = new Player(playerId)

    this.players[playerId] = player

    // TODO: inject secret
    const token = auth.generateNewPlayerToken({ playerId, secret: this.tokenSecret })

    return {
      player,
      token
    }
  }

  getPlayer(playerId) {
    return this.players[playerId]
  }
}

module.exports = PlayerManager
