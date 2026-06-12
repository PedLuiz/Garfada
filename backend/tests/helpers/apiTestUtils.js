const supertest = require('supertest')
const app = require('../../src/server')
const request = supertest(app)

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

async function registerUser(overrides = {}) {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const payload = {
    name: 'Usuario Integracao',
    email: `integracao-${suffix}@garfada.test`,
    username: `int${suffix.replace(/[^a-z0-9]/gi, '').slice(0, 18)}`,
    password: 'senha123',
    ...overrides,
  }

  const response = await request
    .post('/api/auth/register')
    .send(payload)
    .expect(201)

  return {
    ...response.body,
    credentials: payload,
  }
}

module.exports = {
  app,
  authHeader,
  registerUser,
  request,
}
