import { describe, expect, test } from 'vitest'
import { getOptimizedImageUrl } from '../imageUrl'

describe('getOptimizedImageUrl', () => {
  test('retorna URLs que não são do Pexels sem alteração', () => {
    expect(getOptimizedImageUrl('/local/image.png', { width: 320 })).toBe('/local/image.png')
    expect(getOptimizedImageUrl(null)).toBeNull()
  })

  test('adiciona parâmetros de otimização em URLs do Pexels', () => {
    const optimized = getOptimizedImageUrl('https://images.pexels.com/photos/1/food.jpeg?foo=bar', {
      width: 640,
      height: 480,
      fit: 'contain',
      quality: 80,
    })
    const url = new URL(optimized)

    expect(url.searchParams.get('foo')).toBe('bar')
    expect(url.searchParams.get('auto')).toBe('compress')
    expect(url.searchParams.get('cs')).toBe('tinysrgb')
    expect(url.searchParams.get('w')).toBe('640')
    expect(url.searchParams.get('h')).toBe('480')
    expect(url.searchParams.get('fit')).toBe('contain')
    expect(url.searchParams.get('q')).toBe('80')
  })
})
