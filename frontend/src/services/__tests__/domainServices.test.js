import { beforeEach, describe, expect, test, vi } from 'vitest'

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const apiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../apiClient', () => ({
  ApiError,
  apiClient,
}))

const { restaurantService } = await import('../restaurantService')
const { reviewService } = await import('../reviewService')
const { socialService } = await import('../socialService')
const { userService } = await import('../userService')

describe('serviços de domínio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('restaurantService monta strings de consulta normalizadas', () => {
    restaurantService.list({
      search: ' pizza ',
      empty: ' ',
      cuisine: 'Italiana',
      minRating: 4,
      ignored: null,
    })

    expect(apiClient.get).toHaveBeenCalledWith('/api/restaurants?search=pizza&cuisine=Italiana&minRating=4')
  })

  test('restaurantService desativa wishlist e visitados em conflitos', async () => {
    apiClient.post
      .mockRejectedValueOnce(new ApiError('Duplicado', 409))
      .mockRejectedValueOnce(new ApiError('Duplicado', 409))
    apiClient.delete
      .mockResolvedValueOnce({ active: false })
      .mockResolvedValueOnce({ active: false })

    await expect(restaurantService.toggleWishlist('r_1')).resolves.toEqual({ active: false })
    await expect(restaurantService.toggleVisited('r_1', { userRating: 5 })).resolves.toEqual({ active: false })

    expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/api/restaurants/r_1/wishlist')
    expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/api/restaurants/r_1/visited')
  })

  test('restaurantService propaga erros inesperados de alternância', async () => {
    const error = new ApiError('Falhou', 500)
    apiClient.post.mockRejectedValueOnce(error)

    await expect(restaurantService.toggleWishlist('r_1')).rejects.toBe(error)
  })

  test('reviewService valida notas e envia payloads normalizados', async () => {
    apiClient.post.mockResolvedValueOnce({ id: 'rev_1' })

    await expect(reviewService.create('r_1', { rating: '4', comment: undefined })).resolves.toEqual({ id: 'rev_1' })
    await expect(reviewService.create('r_1', { rating: 0 })).rejects.toThrow('A nota deve estar entre 1 e 5 estrelas.')

    expect(apiClient.post).toHaveBeenCalledWith('/api/restaurants/r_1/reviews', {
      rating: 4,
      comment: '',
    })
  })

  test('socialService desativa relação em conflito e codifica busca', async () => {
    apiClient.post.mockRejectedValueOnce(new ApiError('Duplicado', 409))
    apiClient.delete.mockResolvedValueOnce({ isFollowing: false })

    await expect(socialService.followUser('u_2')).resolves.toEqual({ isFollowing: false })
    socialService.searchUsers('Ana Maria')

    expect(apiClient.delete).toHaveBeenCalledWith('/api/users/u_2/follow')
    expect(apiClient.get).toHaveBeenCalledWith('/api/users/search?q=Ana%20Maria')
  })

  test('userService delega endpoints de perfil e coleções', () => {
    userService.getMe()
    userService.updateProfile({ name: 'Ana' })
    userService.getProfile('u_2')
    userService.getMyCollections()
    userService.getCollectionsByUser('u_2')

    expect(apiClient.get).toHaveBeenNthCalledWith(1, '/api/me')
    expect(apiClient.put).toHaveBeenCalledWith('/api/me', { name: 'Ana' })
    expect(apiClient.get).toHaveBeenNthCalledWith(2, '/api/users/u_2')
    expect(apiClient.get).toHaveBeenNthCalledWith(3, '/api/me/collections')
    expect(apiClient.get).toHaveBeenNthCalledWith(4, '/api/users/u_2/collections')
  })
})
