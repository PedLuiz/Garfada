import { createOrUpdateReview, listReviewsByRestaurant } from '../mocks/mockDb'
import { mockRequest } from './apiClient'

export const reviewService = {
  listByRestaurant: (restaurantId) =>
    mockRequest(() => {
      return listReviewsByRestaurant(restaurantId)
    }),

  create: (restaurantId, payload) =>
    mockRequest(() => {
      const rating = Number(payload.rating)

      if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error('A nota deve estar entre 1 e 5 estrelas.')
      }

      return createOrUpdateReview(restaurantId, {
        rating,
        comment: payload.comment ?? '',
      })
    }, { delayMs: 280 }),
}
