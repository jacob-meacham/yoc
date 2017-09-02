const Moniker = require('moniker')
// TODO: Build a name for new players
// TODO: Store players in LevelDB
// TODO: Have a PlayerManager class
class Player {
  constructor(id) {
    this.id = id
    this.name = Moniker.generator([Moniker.adjective, Moniker.noun], {
      glue: ' '
    }).choose()
  }
}

module.exports = Player
