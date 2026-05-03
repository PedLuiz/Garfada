/**
 * Contratos de dados do frontend Garfada.
 * Estes tipos representam os modelos esperados para integração futura com backend.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {string} avatarUrl
 * @property {string} bio
 * @property {string[]} favoriteCuisines
 */

/**
 * @typedef {Object} RestaurantStats
 * @property {number} averageRating
 * @property {number} reviewsCount
 * @property {number} commentsCount
 * @property {number} visitsCount
 */

/**
 * @typedef {Object} Restaurant
 * @property {string} id
 * @property {string} name
 * @property {string} cuisine
 * @property {string} priceRange
 * @property {string} description
 * @property {string} address
 * @property {string[]} photos
 * @property {{ item: string, price: string }[]} menuPreview
 * @property {RestaurantStats} stats
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} restaurantId
 * @property {string} userId
 * @property {number} rating
 * @property {string} comment
 * @property {string} createdAt
 */

/**
 * @typedef {Object} FeedItem
 * @property {string} id
 * @property {'review'|'visited'|'wishlist'|'follow'} type
 * @property {string} userId
 * @property {string=} targetUserId
 * @property {string=} restaurantId
 * @property {string=} reviewId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} WishlistItem
 * @property {string} userId
 * @property {string} restaurantId
 * @property {string} addedAt
 */

/**
 * @typedef {Object} VisitedItem
 * @property {string} userId
 * @property {string} restaurantId
 * @property {string} visitedAt
 * @property {number | null} userRating
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} token
 * @property {string} userId
 * @property {string} expiresAt
 */

export const modelContracts = {
  entities: [
    'User',
    'Restaurant',
    'Review',
    'FeedItem',
    'WishlistItem',
    'VisitedItem',
    'AuthSession',
    'RestaurantStats',
  ],
}
