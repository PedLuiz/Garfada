import { act, renderHook } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { useDebouncedValue } from '../useDebouncedValue'

describe('useDebouncedValue', () => {
  test('mantém o valor anterior até o delay expirar', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'pizza' },
    })

    expect(result.current).toBe('pizza')

    rerender({ value: 'sushi' })
    expect(result.current).toBe('pizza')

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('pizza')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('sushi')

    vi.useRealTimers()
  })

  test('cancela atualizações antigas quando o valor muda novamente', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('c')
    vi.useRealTimers()
  })
})
