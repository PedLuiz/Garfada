import { getMe, getProfile, getUserCollections, updateMe } from '../mocks/mockDb'
import { mockRequest } from './apiClient'

export const userService = {
  getMe: () =>
    mockRequest(() => {
      return getMe()
    }),

  updateProfile: (payload) =>
    mockRequest(() => {
      return updateMe(payload)
    }, { delayMs: 300 }),

  getProfile: (userId) =>
    mockRequest(() => {
      return getProfile(userId)
    }),

  getMyCollections: async () => {
    const me = await userService.getMe()
    return mockRequest(() => getUserCollections(me.id))
  },

  getCollectionsByUser: (userId) =>
    mockRequest(() => {
      return getUserCollections(userId)
    }),
}
