import { expect } from './fixtures'

export const API_BASE_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3002'
export const DEFAULT_PASSWORD = 'senha123'

function uniqueSuffix() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function buildUser(overrides = {}) {
  const suffix = uniqueSuffix().replace(/[^a-z0-9]/gi, '').slice(0, 18)

  return {
    name: `Usuario E2E ${suffix}`,
    email: `e2e-${suffix}@garfada.test`,
    username: `e2e${suffix}`.slice(0, 24),
    password: DEFAULT_PASSWORD,
    ...overrides,
  }
}

export async function registerUser(request, overrides = {}) {
  const credentials = buildUser(overrides)
  const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
    data: credentials,
  })
  const responseBody = await response.text()

  expect(response.ok(), responseBody).toBeTruthy()

  const session = JSON.parse(responseBody)

  return {
    credentials,
    token: session.token,
    user: session.user,
  }
}

export async function loginWithNewUser(page, request, overrides = {}) {
  const session = await registerUser(request, overrides)

  await page.addInitScript((token) => {
    window.localStorage.setItem('garfada.auth.token', token)
  }, session.token)

  return session
}
