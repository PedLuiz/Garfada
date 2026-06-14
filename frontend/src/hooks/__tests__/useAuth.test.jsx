import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach } from 'vitest'

const authService = {
  getSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}
const userService = {
  getMe: vi.fn(),
}

vi.mock('../../services/authService', () => ({ authService }))
vi.mock('../../services/userService', () => ({ userService }))

const { AuthProvider, useAuth } = await import('../useAuth')

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthProvider/useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('inicializa uma sessão existente e o perfil', async () => {
    authService.getSession.mockResolvedValueOnce({ token: 'token-123', userId: 'u_1' })
    userService.getMe.mockResolvedValueOnce({ id: 'u_1', name: 'Ana' })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isBootstrapping).toBe(true)

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.session).toEqual({ token: 'token-123', userId: 'u_1' })
    expect(result.current.me).toEqual({ id: 'u_1', name: 'Ana' })
  })

  test('limpa o estado quando a inicialização falha', async () => {
    authService.getSession.mockRejectedValueOnce(new Error('invalid'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.me).toBeNull()
  })

  test('login, refreshMe e logout atualizam o estado do contexto', async () => {
    authService.getSession.mockResolvedValueOnce(null)
    authService.login.mockResolvedValueOnce({ token: 'token-123', userId: 'u_1' })
    authService.logout.mockResolvedValueOnce(null)
    userService.getMe
      .mockResolvedValueOnce({ id: 'u_1', name: 'Ana' })
      .mockResolvedValueOnce({ id: 'u_1', name: 'Ana Atualizada' })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await expect(result.current.login({ identifier: 'ana', password: 'senha123' })).resolves.toEqual({
        session: { token: 'token-123', userId: 'u_1' },
        profile: { id: 'u_1', name: 'Ana' },
      })
    })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await expect(result.current.refreshMe()).resolves.toEqual({ id: 'u_1', name: 'Ana Atualizada' })
    })
    expect(result.current.me.name).toBe('Ana Atualizada')

    await act(async () => {
      await result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.me).toBeNull()
  })

  test('register armazena a nova sessão e o perfil', async () => {
    authService.getSession.mockResolvedValueOnce(null)
    authService.register.mockResolvedValueOnce({ token: 'token-456', userId: 'u_2' })
    userService.getMe.mockResolvedValueOnce({ id: 'u_2', name: 'Bia' })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))

    await act(async () => {
      await result.current.register({ name: 'Bia' })
    })

    expect(result.current.session).toEqual({ token: 'token-456', userId: 'u_2' })
    expect(result.current.me).toEqual({ id: 'u_2', name: 'Bia' })
  })

  test('refreshMe retorna null quando não há sessão', async () => {
    authService.getSession.mockResolvedValueOnce(null)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isBootstrapping).toBe(false))
    await expect(result.current.refreshMe()).resolves.toBeNull()
    expect(userService.getMe).not.toHaveBeenCalled()
  })

  test('useAuth lança erro fora do AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth deve ser usado dentro de AuthProvider.')
  })
})
