import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useAsyncData } from '../useAsyncData'

describe('useAsyncData', () => {
  test('carrega dados na montagem e expõe reload', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(['pizza'])
      .mockResolvedValueOnce(['sushi'])

    const { result } = renderHook(() => useAsyncData(fetcher))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(['pizza'])
    expect(result.current.error).toBeNull()

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.data).toEqual(['sushi'])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  test('armazena instâncias de Error e usa alternativa para lançamentos que não são Error', async () => {
    const fetcher = vi.fn()
      .mockRejectedValueOnce('falha bruta')
      .mockRejectedValueOnce(new Error('falha nomeada'))

    const { result } = renderHook(() => useAsyncData(fetcher))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error.message).toBe('Erro inesperado.')

    await act(async () => {
      await result.current.reload()
    })

    expect(result.current.error.message).toBe('falha nomeada')
  })

  test('permite que chamadores atualizem os dados diretamente', async () => {
    const { result } = renderHook(() => useAsyncData(() => Promise.resolve(['pizza'])))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setData(['manual'])
    })

    expect(result.current.data).toEqual(['manual'])
  })
})
