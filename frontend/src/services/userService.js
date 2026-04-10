import { apiClient } from './apiClient'

export const userService = {
  getMe: () => apiClient.get('/api/me'),

  updateProfile: (payload) => apiClient.put('/api/me', payload),

  getProfile: (userId) => apiClient.get(`/api/users/${userId}`),

  getMyCollections: () => apiClient.get('/api/me/collections'),

  getCollectionsByUser: (userId) => apiClient.get(`/api/users/${userId}/collections`),
}
