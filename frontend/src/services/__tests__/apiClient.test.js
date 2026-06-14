import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  ApiError,
  apiClient,
  apiRequest,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../apiClient'

function createResponse({ ok = true, status = 200, payload = null, text = '', contentType = 'application/json' } = {}) {
  return {
    ok,
    status,
    headers: {
      get: vi.fn((name) => (name.toLowerCase() === 'content-type' ? contentType : null)),
    },
    json: vi.fn().mockResolvedValue(payload),
    text: vi.fn().mockResolvedValue(text),
  }
}

describe('helpers de armazenamento do apiClient', () => {
  test('armazena, lê e limpa o token de autenticação', () => {
    setStoredToken('token-123')
    expect(getStoredToken()).toBe('token-123')

    clearStoredToken()
    expect(getStoredToken()).toBeNull()
  })
})

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  test('envia corpo JSON e cabeçalho de autenticação para caminhos relativos', async () => {
    setStoredToken('token-123')
    fetch.mockResolvedValueOnce(createResponse({ payload: { ok: true } }))

    await expect(apiRequest('/api/me', {
      method: 'PUT',
      body: { name: 'Ana' },
      headers: { 'X-Trace': 'abc' },
    })).resolves.toEqual({ ok: true })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/me', {
      method: 'PUT',
      headers: {
        'X-Trace': 'abc',
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ name: 'Ana' }),
      signal: undefined,
    })
  })

  test('não anexa autenticação quando desabilitada e preserva URLs absolutas', async () => {
    setStoredToken('token-123')
    fetch.mockResolvedValueOnce(createResponse({ payload: { token: 'new-token' } }))

    await apiRequest('https://api.example.test/login', { method: 'POST', auth: false })

    expect(fetch).toHaveBeenCalledWith('https://api.example.test/login', expect.objectContaining({
      headers: {},
    }))
  })

  test('lê respostas de texto como payloads de mensagem', async () => {
    fetch.mockResolvedValueOnce(createResponse({
      payload: null,
      text: 'ok em texto',
      contentType: 'text/plain',
    }))

    await expect(apiClient.get('/health')).resolves.toEqual({ message: 'ok em texto' })
  })

  test('lança ApiError com mensagem, status e payload para respostas com falha', async () => {
    fetch.mockResolvedValueOnce(createResponse({
      ok: false,
      status: 409,
      payload: { message: 'Duplicado' },
    }))

    await expect(apiClient.post('/api/resource', { id: 1 })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Duplicado',
      status: 409,
      payload: { message: 'Duplicado' },
    })
  })

  test('ApiError expõe status e payload', () => {
    const error = new ApiError('Falhou', 500, { debug: true })

    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(500)
    expect(error.payload).toEqual({ debug: true })
  })
})
