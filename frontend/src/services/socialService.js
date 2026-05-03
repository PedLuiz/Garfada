import { apiClient, ApiError } from './apiClient'

function isConflictError(error) {
  return error instanceof ApiError && error.status === 409
}

export const socialService = {
  getFeed: () => apiClient.get('/api/feed'),

  followUser: async (userId) => {
    try {
      return await apiClient.post(`/api/users/${userId}/follow`)
    } catch (error) {
      if (isConflictError(error)) {
        return apiClient.delete(`/api/users/${userId}/follow`)
      }

      throw error
    }
  },

  searchUsers: (query) => apiClient.get(`/api/users/search?q=${encodeURIComponent(query ?? '')}`),
}
