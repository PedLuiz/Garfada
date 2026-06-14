import { describe, expect, test, vi } from 'vitest'
import { delay } from '../delay'

describe('delay', () => {
  test('resolve após o timeout solicitado', async () => {
    vi.useFakeTimers()

    const promise = delay(250)
    let resolved = false
    promise.then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(249)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await expect(promise).resolves.toBeUndefined()
    expect(resolved).toBe(true)

    vi.useRealTimers()
  })
})
