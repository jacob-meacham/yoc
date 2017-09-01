var config = {
  harvester: {
    health: 100,
    capacity: 100,
    rate: 2,
    range: 1,
    defense: 1
  },
  combat: {
    health: 50,
    defense: 3,
    capacity: 50
  },
  travel: {
    rates: [1, 4]
  },
  battle: {
    soulReleaseRange: 1,
    maxAttackKPS: 4
  }
}

class tower {
  constructor(id, owner, position, souls) {
    this.id = id
    this.owner = owner
    this.position = position
    this.souls = souls
    this.attackers = 0
    this.target = -1  
    this.last_move = Date.now()
    this.last_defensive_kill = Date.now()
    this.last_defensive_death = Date.now()
  }

  move_souls(state) {
    if (this.target < 0 || state.towers[this.target].owner != this.owner) {
      return
    }
    // We have a valid target, so move souls there
    // rate of movement depends on if the targent is adjacent to us (i.e. has a road)
    var now = Date.now()
    var rate = config.travel.rates[state.adjacency[this.id][this.target]]
    var dt = (now - this.last_move) / 1000.0
    var num = Math.floor(dt * rate)
    if (num > 0) {
      // Only move if we have souls to send and the target has capacity to receive
      num = Math.min(this.souls, num)
      num = Math.min(num, state.towers[this.target].capacity - state.towers[this.target].souls)
      if (num > 0) {
        this.souls -= num
        state.towers[this.target].souls += num
      }
      this.last_move = now
    }
  }

  update_battle(state) {
    if (this.attackers == 0) {
      return
    }

    var now = Date.now()

    // Kill some attackers based on our defensive ability
    // kills per second ranges from 0 to this.defense on a bit of an s-curve based
    // on how full of souls we are
    var x = this.souls/this.capacity
    var kps = (x*x*(3-2*x)) * this.defense
    var dt = (now - this.last_defensive_kill) / 1000.0
    var num_killed = Math.floor(dt * kps)
    if (num_killed > 0) {
      num_killed = Math.min(num_killed, this.attackers)
      this.attackers -= num_killed
      state.releaseSoulsInRange(num_killed, this.position, config.battle.soulReleaseRange)
      this.last_defensive_kill = now
    }

    // If there are still attackers, it is their turn to kill some of us
    // if we run out of souls, then we lose health until we hit 0
    // and then the tower is turned over to the attackers
    x = this.attackers / this.capacity
    kps = (x*x*(3-2*x)) * config.battle.maxAttackKPS
    dt = (now - this.last_densive_death) / 1000.0
    num_killed = Math.floor(dt * kps)
    if (num_killed > 0) {
      var health_deduction = Math.max(0, num_killed - this.souls)
      num_killed = Math.min(num_killed, this.souls)
      this.souls -= num_killed
      this.health -= health_deduction
      state.releaseSoulsInRange(num_killed, this.position, config.battle.soulReleaseRange)
      this.last_defensive_death = now

      if (this.health <= 0) {
        this.owner = (this.owner + 1) & 1
        this.health = (this.type == "harvester") ? config.harvester.health : config.combat.health
        this.souls = this.attackers
        this.attackers = 0
      }
    }
  }
}

class harvester_tower extends tower {
  constructor(id, owner, position, souls) {
    super(id, owner, position, souls)
    this.type = "harvester"
    this.health = config.harvester.health
    this.last_harvest = Date.now()
    this.capacity = config.harvester.capacity
    this.range = config.harvester.range
    this.defense = config.harvester.defense
  }

  move_souls(state) {
    super.move_souls(state)
    var now = Date.now()
    // if we have capacity then harvest souls from the surrounding area
    // if target is not null then move souls from here to there
    // at config.rate (souls/sec)
    var nearSouls = state.getSoulCountInRange(this.position, this.range)
    var dt = (now - this.last_harvest) / 1000.0
    var num = Math.min(Math.floor(dt * config.harvester.rate), nearSouls)
    if (num > 0) {
      this.last_harvest = now
    }
    // Only harvest as many as we can up to our capacity
    num = Math.min(num, this.capacity - this.souls)
    if (num > 0) {
      this.souls += num
      state.harvestSoulsInRange(num, this.position, this.range)
    }
  }
}

class combat_tower extends tower {
  constructor(id, owner, position, souls) {
    super(id, owner, position, souls)
    this.type = "combat"
    this.health = config.combat.health
    this.capacity = config.combat.capacity
    this.defense = config.combat.defense
  }

  move_souls(state) {
    // Will move souls to a target if it is one of ours
    super.move_souls(state)

    if (this.target < 0 || state.towers[this.target] == this.owner) {
      // We aren't attacking so, just return
      return
    }

    // We are attacking, move souls to that towers attackers count
    var now = Date.now()
    var rate = config.travel.rates[state.adjacency[this.id][this.target]]
    var dt = (now - this.last_move) / 1000.0
    var num = Math.floor(dt * rate)
    if (num > 0) {
      num = Math.min(num, this.souls)
      this.souls -= num
      state.towers[this.target].attackers += num
      this.last_move = now
    }
  }
}

class gamestate {
  constructor(config) {
    this.soul_map = 
                  [[ 15, 0,  3,  1],
                   [ 0,  8,  7,  4],
                   [ 4,  7,  8,  0],
                   [ 1,  3,  0, 15]]
    this.towers = [ new harvester_tower(0, 0, [3,3], 20), 
                    new combat_tower(1, 0, [2,3], 10),
                    new harvester_tower(2, 1, [0,0], 20) ]
    this.adjacency = [[0, 1, 0],[1, 0, 0],[0, 0, 0]]
    this.towers[0].target = 1
    this.towers[1].target = 2
  }

  update() {
    this.towers.forEach((tower) => {
      tower.move_souls(this)
    })
    this.towers.forEach((tower) => {
      tower.update_battle(this)
    })
  }

  getSoulCountInRange(pos, range) {
    return this.soul_map[pos[0]][pos[1]]
  }

  harvestSoulsInRange(count, pos, range) {
    this.soul_map[pos[0]][pos[1]] -= count
  }

  releaseSoulsInRange(count, pos, range) {
    this.soul_map[pos[0]][pos[1]] += count
  }

  isGameOver() {
    return false
  }
}

exports.start = function(socket, period) {
  var state = new gamestate()
  var last_update = Date.now()

  // setInterval can be pretty noisy
  // might want to do something like at http://timetocode.tumblr.com/post/71512510386/an-accurate-nodejs-game-loop-inbetween-settimeout
  var loop = setInterval(() => {
    var now = Date.now()
    last_update = now

    state.update()
    socket.emit('state', state)
    
    if (state.isGameOver()) {
      clearInterval(loop)
    }
  }, period)
}
