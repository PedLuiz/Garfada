import {
  getRestaurantById,
  getVisited,
  getWishlist,
  listRestaurants,
  toggleVisited,
  toggleWishlist,
} from '../mocks/mockDb'
import { mockRequest } from './apiClient'

export const restaurantService = {
  list: (filters = {}) =>
    mockRequest(() => {
      return listRestaurants(filters)
    }),

  getById: (id) =>
    mockRequest(() => {
      return getRestaurantById(id)
    }),

  getWishlist: () =>
    mockRequest(() => {
      return getWishlist()
    }),

  toggleWishlist: (restaurantId) =>
    mockRequest(() => {
      return toggleWishlist(restaurantId)
    }, { delayMs: 250 }),

  getVisited: () =>
    mockRequest(() => {
      return getVisited()
    }),

  toggleVisited: (restaurantId, payload = {}) =>
    mockRequest(() => {
      return toggleVisited(restaurantId, payload)
    }, { delayMs: 250 }),
}
