# Introduction
A kind of competitive tower strategy sort of game. Multiple players start off on a playing field with a single tower each, they try to expand their territory by placing new towers and creating "roadways" between towers (to shuttle resources as needed). I imagine there could be multiple types of towers, but to keep things more simple maybe we would have only two - resource generating, and offensive/defensive towers that can defend an area around them and from which a player can launch an attack on an enemy tower.

# Mechanics
There are two types of resources: gold, and souls of the fallen. Gold is given out on a standard tick, like Plants vs. Zombies, and is also produced by certain towers. Souls of the fallen are produced when you either kill your enemies attackers or when your own attackers die.

A player can take 4 actions:
* Build a resource tower. This tower generates gold at a set rate
* Build a attack/defense tower. These towers can both defend against enemy attackers, and also produce attackers of their own. Both attack and defense require gold for upkeep, which must be shipped to them from resource towers.
* Build roads. Roads run between towers - when there is a road between two towers, resources can flow between the towers.
* Upgrade a tower. Upgrades take a combination of gold and souls of the fallen, potentially along two different tracks (I've been playing a mobile game called Hyper Heroes that uses upgrades along multiple tracks to some success)
    - If the tower is a resource tower, the player can either choose to upgrade the speed of resource generation, or the speed at which resources flow from the tower
    - If the tower is an attacker tower, the player can either choose to upgrade the defensive capabilities or the offensive ones.

Attackers are generated and sent out automatically; the player has no control over how they're sent out, beyond building a network that naturally produces waves. To simplify, attackers do not engage with each other - only with the towers.

# Thoughts
In my opinion, "ravenous lichen" works better story-wise if you're not also generating the attackers. The way I imagined ravenous lichen would be as a creep-style mechanic a la Starcraft. We could still play with this, but maybe it's simpler to drop this conceit.

Tower defense games usually have two phases: a buy phase and an attack phase. Do we want to keep this dynamic, or make it all real-time?

Over what period of time do we want people to play this game (or how long should the game last)? Do you sit down and play it for 1/2 hour, or is it more of a cookie-clicker style game where you come back and look at the progress every once in a while

# TODO
[] ?
