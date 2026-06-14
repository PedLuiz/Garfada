const jwt = require('jsonwebtoken')
const { AppError } = require('../../../src/errors')
const { requireAuth, signAccessToken } = require('../../../src/middleware/auth')

function createReq(authorization) {
  return {
    headers: {
      authorization,
    },
  }
}

describe('signAccessToken', () => {
  test('assina um JWT com o id do usuário no campo sub', () => {
    const token = signAccessToken('u_123')
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    expect(payload.sub).toBe('u_123')
    expect(payload.exp).toBeGreaterThan(payload.iat)
  })
})

describe('requireAuth', () => {
  test('anexa dados de autenticação quando o token Bearer é válido', () => {
    const token = signAccessToken('u_123')
    const req = createReq(`Bearer ${token}`)
    const next = jest.fn()

    requireAuth(req, {}, next)

    expect(req.auth).toMatchObject({
      userId: 'u_123',
      token,
    })
    expect(req.auth.tokenPayload.sub).toBe('u_123')
    expect(next).toHaveBeenCalledWith()
  })

  test('rejeita token Bearer ausente ou malformado', () => {
    const next = jest.fn()

    requireAuth(createReq('Basic abc'), {}, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Acesso negado. Informe um token Bearer válido.',
      statusCode: 401,
    })
  })

  test('rejeita tokens inválidos com erro de sessão', () => {
    const next = jest.fn()

    requireAuth(createReq('Bearer token-invalido'), {}, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Sessão expirada ou inválida. Faça login novamente.',
      statusCode: 401,
    })
  })

  test('rejeita JWTs válidos sem subject', () => {
    const token = jwt.sign({ role: 'tester' }, process.env.JWT_SECRET, { expiresIn: '1h' })
    const next = jest.fn()

    requireAuth(createReq(`Bearer ${token}`), {}, next)

    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Token inválido.',
      statusCode: 401,
    })
  })
})
