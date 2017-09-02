const crypto = require('crypto')
const Gamestate = require('./gameloop')

class GameManager {
  constructor() {
    this.games = { }
  }

  startGame({ player1, player2 }) {
    const gameId = crypto.randomBytes(16).toString('hex')

    player1.socket.emit('game:starting')
    player2.socket.emit('game:starting')

    let started = false

    const state = new Gamestate()
    // let lastUpdate = Date.now()

    // setInterval can be pretty noisy
    // might want to do something like at http://timetocode.tumblr.com/post/71512510386/an-accurate-nodejs-game-loop-inbetween-settimeout
    const loop = setInterval(() => {
      if (!started) {
        started = true
        player1.socket.emit('game:started')
        player2.socket.emit('game:started')
      }
      // var now = Date.now()
      // lastUpdate = now

      state.update()
      player1.socket.emit('game:state', state)
      player2.socket.emit('game:state', state)

      if (state.isGameOver()) {
        clearInterval(loop)
        player1.socket.emit('game:ended', state)
        player2.socket.emit('game:ended', state)
      }
    }, 33)

    this.games[gameId] = {
      loop,
      state,
      player1,
      player2
    }
  }

  leaveGame({ playerId }) {

  }

  endGame() {

  }
}

module.exports = GameManager
