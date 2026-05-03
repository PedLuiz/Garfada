const jwt = require('jsonwebtoken')
const { AppError } = require('../errors')

const JWT_SECRET = process.env.JWT_SECRET || 'garfada-dev-secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function parseBearerToken(authorizationHeader = '') {
  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function requireAuth(req, _res, next) {
  try {
    const token = parseBearerToken(req.headers.authorization)

    if (!token) {
      throw new AppError('Acesso negado. Informe um token Bearer válido.', 401)
    }

    const payload = jwt.verify(token, JWT_SECRET)

    if (!payload?.sub) {
      throw new AppError('Token inválido.', 401)
    }

    req.auth = {
      userId: payload.sub,
      token,
      tokenPayload: payload,
    }

    return next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }

    return next(new AppError('Sessão expirada ou inválida. Faça login novamente.', 401))
  }
}

module.exports = {
  signAccessToken,
  requireAuth,
}
