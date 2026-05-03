import { apiClient } from './apiClient'

export const reviewService = {
  listByRestaurant: (restaurantId) => apiClient.get(`/api/restaurants/${restaurantId}/reviews`),

  create: async (restaurantId, payload) => {
    const rating = Number(payload.rating)

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('A nota deve estar entre 1 e 5 estrelas.')
    }

    return apiClient.post(`/api/restaurants/${restaurantId}/reviews`, {
      rating,
      comment: payload.comment ?? '',
    })
  },
}
