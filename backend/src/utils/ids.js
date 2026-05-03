const crypto = require('crypto')

function createId(prefix) {
  const random = crypto.randomBytes(6).toString('hex')
  return `${prefix}_${Date.now().toString(36)}_${random}`
}

module.exports = {
  createId,
}
