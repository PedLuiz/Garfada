import { beforeEach, describe, expect, test, vi } from 'vitest'

const apiClient = {
  get: vi.fn(),
  post: vi.fn(),
}
const getStoredToken = vi.fn()
const setStoredToken = vi.fn()
const clearStoredToken = vi.fn()

vi.mock('../apiClient', () => ({
  apiClient,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
}))

const { authService } = await import('../authService')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getSession retorna null quando nenhum token está armazenado', async () => {
    getStoredToken.mockReturnValueOnce(null)

    await expect(authService.getSession()).resolves.toBeNull()
    expect(apiClient.get).not.toHaveBeenCalled()
  })

  test('getSession valida o token armazenado e retorna uma sessão', async () => {
    getStoredToken.mockReturnValueOnce('token-123')
    apiClient.get.mockResolvedValueOnce({ id: 'u_1' })

    await expect(authService.getSession()).resolves.toEqual({
      token: 'token-123',
      userId: 'u_1',
      expiresAt: null,
    })
  })

  test('getSession limpa tokens armazenados inválidos', async () => {
    getStoredToken.mockReturnValueOnce('token-123')
    apiClient.get.mockRejectedValueOnce(new Error('invalid'))

    await expect(authService.getSession()).resolves.toBeNull()
    expect(clearStoredToken).toHaveBeenCalledTimes(1)
  })

  test('login valida, normaliza credenciais e armazena o token retornado', async () => {
    apiClient.post.mockResolvedValueOnce({ token: 'token-123', user: { id: 'u_1' } })

    await expect(authService.login({ identifier: ' ana ', password: ' senha123 ' })).resolves.toEqual({
      token: 'token-123',
      userId: 'u_1',
      expiresAt: null,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
      identifier: 'ana',
      password: 'senha123',
    }, { auth: false })
    expect(setStoredToken).toHaveBeenCalledWith('token-123')
  })

  test('register valida, normaliza payload e armazena o token retornado', async () => {
    apiClient.post.mockResolvedValueOnce({ token: 'token-456', user: { id: 'u_2' } })

    await expect(authService.register({
      name: ' Ana ',
      email: ' ana@garfada.test ',
      username: ' ana ',
      password: ' senha123 ',
    })).resolves.toEqual({
      token: 'token-456',
      userId: 'u_2',
      expiresAt: null,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', {
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'ana',
      password: 'senha123',
    }, { auth: false })
  })

  test('rejeita payloads vazios de login/register e limpa token no logout', async () => {
    await expect(authService.login({ identifier: ' ', password: 'senha123' })).rejects.toThrow('Preencha usuário/e-mail')
    await expect(authService.register({ name: '', email: '', username: '', password: '' })).rejects.toThrow('Preencha todos')

    await expect(authService.logout()).resolves.toBeNull()
    expect(clearStoredToken).toHaveBeenCalledTimes(1)
  })
})
