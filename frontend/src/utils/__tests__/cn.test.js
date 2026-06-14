import { describe, expect, test } from 'vitest'
import { cn } from '../cn'

describe('cn', () => {
  test('junta classes verdadeiras e descarta valores falsy', () => {
    const hidden = false

    expect(cn('base', hidden ? 'hidden' : '', '', null, undefined, 'active')).toBe('base active')
  })
})
