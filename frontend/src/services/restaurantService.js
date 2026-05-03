import { apiClient, ApiError } from './apiClient'

function toQueryString(filters = {}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) {
      continue
    }

    const stringValue = String(value).trim()

    if (!stringValue) {
      continue
    }

    params.set(key, stringValue)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

function isConflictError(error) {
  return error instanceof ApiError && error.status === 409
}

export const restaurantService = {
  list: (filters = {}) => apiClient.get(`/api/restaurants${toQueryString(filters)}`),

  getById: (id) => apiClient.get(`/api/restaurants/${id}`),

  getWishlist: () => apiClient.get('/api/me/wishlist'),

  toggleWishlist: async (restaurantId) => {
    try {
      return await apiClient.post(`/api/restaurants/${restaurantId}/wishlist`)
    } catch (error) {
      if (isConflictError(error)) {
        return apiClient.delete(`/api/restaurants/${restaurantId}/wishlist`)
      }

      throw error
    }
  },

  getVisited: () => apiClient.get('/api/me/visited'),

  toggleVisited: async (restaurantId, payload = {}) => {
    try {
      return await apiClient.post(`/api/restaurants/${restaurantId}/visited`, payload)
    } catch (error) {
      if (isConflictError(error)) {
        return apiClient.delete(`/api/restaurants/${restaurantId}/visited`)
      }

      throw error
    }
  },
}
