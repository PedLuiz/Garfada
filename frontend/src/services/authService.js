import { getSession, login, logout, register } from '../mocks/mockDb'
import { mockRequest } from './apiClient'

export const authService = {
  getSession: () => mockRequest(() => getSession(), { delayMs: 120 }),

  login: ({ identifier, password }) =>
    mockRequest(() => {
      if (!identifier?.trim() || !password?.trim()) {
        throw new Error('Preencha usuário/e-mail e senha para continuar.')
      }

      return login({ identifier: identifier.trim(), password: password.trim() })
    }),

  register: ({ name, email, username, password }) =>
    mockRequest(() => {
      if (!name?.trim() || !email?.trim() || !username?.trim() || !password?.trim()) {
        throw new Error('Preencha todos os campos obrigatórios para criar a conta.')
      }

      return register({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim(),
      })
    }),

  logout: () =>
    mockRequest(() => {
      logout()
      return null
    }, { delayMs: 120 }),
}
