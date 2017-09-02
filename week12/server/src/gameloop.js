var config = {
  towers: [
    // harvester
    {
      health: 100,
      capacity: 100,
      harvest_rate: 2,
      harvest_range: 1,
      defense_kps: 1
    },
    // combat
    {
      health: 50,
      capacity: 50,
      harvest_rate: 0,
      harvest_range: 0,
      defense_kps: 3
    }
  ],
  travel_rates: [1,2,4,8],
  battle: {
    soul_release_range: 1,
    attack_kps: 4
  }
}

class tower {
  constructor(typeid, id, owner, position, souls) {
    this.id = id
    this.typeid = typeid
    this.owner = owner
    this.position = position
    this.souls = souls
    this.attackers = 0
    this.target = -1  
    
    this.health = config.towers[typeid].health
    this.capacity = config.towers[typeid].capacity

    var now = Date.now()

    this.last_soul_move = now
    this.last_soul_harvest = now
    this.last_defensive_kill = now
    this.last_defensive_death = now
  }

  harvest_souls(state) {
    if (config.towers[this.typeid].harvest_rate == 0) {
      return
    }

    var now = Date.now()

    // get the number of souls within range and harvest some of them
    var nearSouls = state.souls_in_range(this.position, config.towers[this.typeid].harvest_range)
    state.harvestable_souls[this.owner] += nearSouls
    var dt = (now - this.last_soul_harvest) / 1000.0
    var num = Math.min(Math.floor(dt * config.towers[this.typeid].harvest_rate), nearSouls)
    if (num == 0) {
      return
    }
    
    this.last_harvest = now

    // Only harvest as many as we can up to our capacity
    num = Math.min(num, this.capacity - this.souls)
    if (num > 0) {
      this.souls += num
      state.harvest_souls(this.owner, num, this.position, config.towers[this.typeid].harvest_range)
    }
  }

  move_souls(state) {
    if (this.target < 0 || this.souls == 0) {
      return
    }

    var now = Date.now()

    // We have a valid target, so move souls there
    // rate of movement depends on if the targent is adjacent to us (i.e. has a road)
    var rate = config.travel_rates[state.adjacency[this.id][this.target]]
    var dt = (now - this.last_soul_move) / 1000.0
    var num = Math.floor(dt * rate)
    if (num == 0) {
      return
    }
    
    this.last_soul_move = now

    // Don't move more souls than we have...
    num = Math.min(this.souls, num)
    if (state.towers[this.target].owner == this.owner) {
      // Moving to a friendly tower, don't overfill it
      num = Math.min(num, state.towers[this.target].capacity - state.towers[this.target].souls)
      this.souls -= num
      state.towers[this.target].souls += num
    } else {
      // Moving to an enemy tower, add to its attackers
      this.souls -= num
      state.towers[this.target].attackers += num
    }
  }

  update_battle(state) {
    if (this.attackers == 0) {
      return
    }

    var now = Date.now()
    var opponent = (this.owner + 1) & 1

    // Kill some attackers based on our defensive ability
    // kills per second ranges from 0 to this.defense on a bit of an s-curve based
    // on how full of souls we are
    var x = Math.max(Math.min(this.souls/this.capacity, 1.0), 0.0)
    var kps = (x*x*(3-2*x)) * config.towers[this.typeid].defense_kps
    var dt = (now - this.last_defensive_kill) / 1000.0
    var num_killed = Math.floor(dt * kps)
    if (num_killed > 0) {
      num_killed = Math.min(num_killed, this.attackers)
      this.attackers -= num_killed
      state.release_souls(opponent, num_killed, this.position, config.battle.soul_release_range)
      this.last_defensive_kill = now
    }

    // If there are still attackers, it is their turn to kill some of us
    // if we run out of souls, then we lose health until we hit 0
    // and then the tower is turned over to the attackers
    x = Math.max(Math.min(this.attackers / this.capacity, 1.0), 0.0)
    kps = (x*x*(3-2*x)) * config.battle.attack_kps
    dt = (now - this.last_densive_death) / 1000.0
    num_killed = Math.floor(dt * kps)
    if (num_killed > 0) {
      var health_deduction = Math.max(0, num_killed - this.souls)
      num_killed = Math.min(num_killed, this.souls)
      this.souls -= num_killed
      this.health -= health_deduction
      state.release_souls(this.owner, num_killed, this.position, config.battle.soulReleaseRange)
      this.last_defensive_death = now

      if (this.health <= 0) {
        // Seize the tower
        state.tower_counts[this.owner]--;
        this.owner = opponent
        this.health = config.towers[this.typeid].health
        this.souls = this.attackers
        this.attackers = 0
        state.tower_counts[this.owner]++;
      }
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

    this.towers = [ new tower(0, 0, 0, [3,3], 20), 
                    new tower(1, 1, 0, [2,3], 10),
                    new tower(0, 2, 1, [0,0], 20) ]

    this.adjacency = [[0, 1, 0],[1, 0, 0],[0, 0, 0]]

    this.towers[0].target = 1
    this.towers[1].target = 2

    this.tower_counts = [2, 1]
    this.soul_counts = [30,20]
    this.harvestable_souls = [0,0]
  }

  update() {
    // update in three phases - harvest, movement, battle
    this.harvestable_souls = [0,0]
    this.towers.forEach((tower) => {
      tower.harvest_souls(this)
    })
    this.towers.forEach((tower) => {
      tower.move_souls(this)
    })
    this.towers.forEach((tower) => {
      tower.update_battle(this)
    })
  }

  souls_in_range(pos, range) {
    return this.soul_map[pos[0]][pos[1]]
  }

  harvest_souls(player, count, pos, range) {
    this.soul_map[pos[0]][pos[1]] -= count
    this.soul_counts[player] += count
  }

  release_souls(player, count, pos, range) {
    this.soul_map[pos[0]][pos[1]] += count
    this.soul_counts[player] -= count
  }

  check_gameover() {
    // game is over when a player has lost all towers
    if (this.tower_counts[0] == 0 || this.tower_counts[1] == 0) {
      return true
    }
    // game is over if a player has no souls and no ability to get more
    if (this.soul_counts[0] == 0 && this.harvestable_souls[0] == 0) {
      return true
    }
    if (this.soul_counts[1] == 0 && this.harvestable_souls[1] == 0) {
      return true
    }
    return false
  }
}

module.exports = gamestate

