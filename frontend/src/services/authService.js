import { apiClient, clearStoredToken, getStoredToken, setStoredToken } from './apiClient'

function buildSession(token, user) {
  return {
    token,
    userId: user.id,
    expiresAt: null,
  }
}

export const authService = {
  getSession: async () => {
    const token = getStoredToken()

    if (!token) {
      return null
    }

    try {
      const user = await apiClient.get('/api/auth/me')
      return buildSession(token, user)
    } catch {
      clearStoredToken()
      return null
    }
  },

  login: async ({ identifier, password }) => {
    const cleanIdentifier = identifier?.trim()
    const cleanPassword = password?.trim()

    if (!cleanIdentifier || !cleanPassword) {
      throw new Error('Preencha usuário/e-mail e senha para continuar.')
    }

    const response = await apiClient.post(
      '/api/auth/login',
      {
        identifier: cleanIdentifier,
        password: cleanPassword,
      },
      { auth: false },
    )

    setStoredToken(response.token)
    return buildSession(response.token, response.user)
  },

  register: async ({ name, email, username, password }) => {
    if (!name?.trim() || !email?.trim() || !username?.trim() || !password?.trim()) {
      throw new Error('Preencha todos os campos obrigatórios para criar a conta.')
    }

    const response = await apiClient.post(
      '/api/auth/register',
      {
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim(),
      },
      { auth: false },
    )

    setStoredToken(response.token)
    return buildSession(response.token, response.user)
  },

  logout: async () => {
    clearStoredToken()
    return null
  },
}
