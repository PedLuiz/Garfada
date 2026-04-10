import { followUser, getFeed, searchUsers } from '../mocks/mockDb'
import { mockRequest } from './apiClient'

export const socialService = {
  getFeed: () =>
    mockRequest(() => {
      return getFeed()
    }),

  followUser: (userId) =>
    mockRequest(() => {
      return followUser(userId)
    }, { delayMs: 250 }),

  searchUsers: (query) =>
    mockRequest(() => {
      return searchUsers(query)
    }, { delayMs: 220 }),
}
