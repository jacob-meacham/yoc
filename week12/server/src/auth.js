const jwt = require('jsonwebtoken')

function generateNewPlayerToken({ playerId, secret }) {
  const token = jwt.sign({ id: playerId }, secret)

  return token
}

function authenticate({ token, secret }) {
  return jwt.verify(token, secret)
}

module.exports = {
  generateNewPlayerToken,
  authenticate
}
