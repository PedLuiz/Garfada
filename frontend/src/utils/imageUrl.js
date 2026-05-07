function isPexelsUrl(url) {
  return typeof url === 'string' && url.includes('images.pexels.com')
}

export function getOptimizedImageUrl(url, { width, height, fit = 'crop', quality = 75 } = {}) {
  if (!isPexelsUrl(url)) {
    return url
  }

  const parsedUrl = new URL(url)

  parsedUrl.searchParams.set('auto', 'compress')
  parsedUrl.searchParams.set('cs', 'tinysrgb')

  if (width) {
    parsedUrl.searchParams.set('w', String(width))
  }

  if (height) {
    parsedUrl.searchParams.set('h', String(height))
  }

  if (fit) {
    parsedUrl.searchParams.set('fit', fit)
  }

  if (quality) {
    parsedUrl.searchParams.set('q', String(quality))
  }

  return parsedUrl.toString()
}
