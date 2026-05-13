const crypto = require('crypto')

const PASSWORD_SCHEME = 'pbkdf2_sha256'
const DEFAULT_ITERATIONS = Number(process.env.PASSWORD_PBKDF2_ITERATIONS) || 120000
const KEY_LENGTH = 32

// JWT e hashes ficam mais faceis de transportar quando usam base64url.
function toBase64Url(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return Buffer.from(padded, 'base64')
}

// Gera um hash com salt unico por senha. O formato salva esquema, iteracoes,
// salt e digest para permitir verificacao futura.
function hashPassword(password) {
  const salt = crypto.randomBytes(12).toString('hex')
  const saltEncoded = Buffer.from(salt, 'utf8').toString('base64')
  const digest = crypto.pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, KEY_LENGTH, 'sha256')

  return `${PASSWORD_SCHEME}$${DEFAULT_ITERATIONS}$${saltEncoded}$${toBase64Url(digest)}`
}

// Recalcula o hash com os parametros salvos e compara em tempo constante.
function verifyPassword(password, encodedHash) {
  if (!encodedHash || typeof encodedHash !== 'string') {
    return false
  }

  const [scheme, iterationsRaw, saltEncoded, digestEncoded] = encodedHash.split('$')

  if (scheme !== PASSWORD_SCHEME || !iterationsRaw || !saltEncoded || !digestEncoded) {
    return false
  }

  const iterations = Number(iterationsRaw)

  if (!Number.isInteger(iterations) || iterations <= 0) {
    return false
  }

  const salt = Buffer.from(saltEncoded, 'base64').toString('utf8')
  const computed = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha256')
  const expected = fromBase64Url(digestEncoded)

  if (computed.length !== expected.length) {
    return false
  }

  return crypto.timingSafeEqual(computed, expected)
}

module.exports = {
  hashPassword,
  verifyPassword,
}
