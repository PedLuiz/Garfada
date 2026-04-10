import {
  feedSeed,
  followingSeed,
  restaurantsSeed,
  reviewsSeed,
  usersSeed,
  visitedSeed,
  wishlistSeed,
} from './seed'

const clone = (value) => JSON.parse(JSON.stringify(value))

const INITIAL_STATE = {
  users: clone(usersSeed),
  restaurants: clone(restaurantsSeed),
  reviews: clone(reviewsSeed),
  wishlistByUser: clone(wishlistSeed),
  visitedByUser: clone(visitedSeed),
  followingByUser: clone(followingSeed),
  feed: clone(feedSeed),
  session: null,
}

const state = clone(INITIAL_STATE)

function getCurrentUserId() {
  if (!state.session) {
    throw new Error('Sessão expirada. Faça login novamente para continuar.')
  }

  return state.session.userId
}

function stripPassword(user) {
  const { password: _password, ...publicData } = user
  return publicData
}

function findUserById(id) {
  const user = state.users.find((candidate) => candidate.id === id)

  if (!user) {
    throw new Error('Usuário não encontrado.')
  }

  return user
}

function findRestaurantById(id) {
  const restaurant = state.restaurants.find((candidate) => candidate.id === id)

  if (!restaurant) {
    throw new Error('Restaurante não encontrado.')
  }

  return restaurant
}

function getFollowersCount(userId) {
  return Object.values(state.followingByUser).filter((followedList) => followedList.includes(userId)).length
}

function buildRestaurantStats(restaurantId) {
  const restaurantReviews = state.reviews.filter((review) => review.restaurantId === restaurantId)
  const visitedCount = Object.values(state.visitedByUser)
    .flat()
    .filter((visit) => visit.restaurantId === restaurantId).length
  const averageRating =
    restaurantReviews.length === 0
      ? 0
      : Number(
          (
            restaurantReviews.reduce((sum, review) => sum + review.rating, 0) / restaurantReviews.length
          ).toFixed(1),
        )

  return {
    averageRating,
    reviewsCount: restaurantReviews.length,
    commentsCount: restaurantReviews.filter((review) => review.comment.trim().length > 0).length,
    visitsCount: visitedCount,
  }
}

function buildUserStats(userId) {
  const reviewsCount = state.reviews.filter((review) => review.userId === userId).length
  const visitedCount = state.visitedByUser[userId]?.length ?? 0
  const wishlistCount = state.wishlistByUser[userId]?.length ?? 0
  const followingCount = state.followingByUser[userId]?.length ?? 0
  const followersCount = getFollowersCount(userId)

  return {
    reviewsCount,
    visitedCount,
    wishlistCount,
    followersCount,
    followingCount,
  }
}

function hydrateRestaurant(baseRestaurant) {
  const stats = buildRestaurantStats(baseRestaurant.id)

  return {
    ...clone(baseRestaurant),
    stats,
    ratingAverage: stats.averageRating,
    reviewsCount: stats.reviewsCount,
    visitsCount: stats.visitsCount,
  }
}

function buildSession(userId) {
  const now = Date.now()
  return {
    token: `mock-token-${userId}-${now}`,
    userId,
    expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
  }
}

function appendFeedItem(item) {
  state.feed.unshift({
    id: `feed${state.feed.length + 1}`,
    createdAt: new Date().toISOString(),
    ...item,
  })
}

export function getSession() {
  return clone(state.session)
}

export function login({ identifier, password }) {
  const user = state.users.find(
    (candidate) =>
      candidate.email.toLowerCase() === identifier.toLowerCase() ||
      candidate.username.toLowerCase() === identifier.toLowerCase(),
  )

  if (!user || user.password !== password) {
    throw new Error('Credenciais inválidas. Confira e tente novamente.')
  }

  state.session = buildSession(user.id)
  return clone(state.session)
}

export function register({ name, email, username, password }) {
  const emailTaken = state.users.some(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
  )
  const usernameTaken = state.users.some(
    (candidate) => candidate.username.toLowerCase() === username.toLowerCase(),
  )

  if (emailTaken) {
    throw new Error('Esse e-mail já está em uso.')
  }

  if (usernameTaken) {
    throw new Error('Esse username já foi escolhido por outra pessoa.')
  }

  const newUser = {
    id: `u${state.users.length + 1}`,
    name,
    email,
    username,
    password,
    avatarUrl: `https://i.pravatar.cc/160?u=${username}`,
    bio: 'Novo no Garfada. Em busca dos próximos favoritos.',
    favoriteCuisines: [],
  }

  state.users.push(newUser)
  state.wishlistByUser[newUser.id] = []
  state.visitedByUser[newUser.id] = []
  state.followingByUser[newUser.id] = []
  state.session = buildSession(newUser.id)

  return clone(state.session)
}

export function logout() {
  state.session = null
}

export function getMe() {
  const userId = getCurrentUserId()
  const user = findUserById(userId)

  return {
    ...stripPassword(user),
    ...buildUserStats(userId),
  }
}

export function updateMe(payload) {
  const userId = getCurrentUserId()
  const user = findUserById(userId)

  if (payload.username && payload.username !== user.username) {
    const taken = state.users.some(
      (candidate) => candidate.username.toLowerCase() === payload.username.toLowerCase(),
    )

    if (taken) {
      throw new Error('Username indisponível no momento.')
    }
  }

  Object.assign(user, {
    name: payload.name ?? user.name,
    username: payload.username ?? user.username,
    bio: payload.bio ?? user.bio,
    avatarUrl: payload.avatarUrl ?? user.avatarUrl,
    favoriteCuisines: payload.favoriteCuisines ?? user.favoriteCuisines,
  })

  return {
    ...stripPassword(user),
    ...buildUserStats(userId),
  }
}

export function listRestaurants(filters = {}) {
  const search = (filters.search ?? '').trim().toLowerCase()
  const location = (filters.location ?? '').trim().toLowerCase()
  const cuisine = filters.cuisine ?? 'all'
  const priceRange = filters.priceRange ?? 'all'
  const minRating = Number(filters.minRating ?? 0)

  const filtered = state.restaurants
    .map((restaurant) => hydrateRestaurant(restaurant))
    .filter((restaurant) => {
      const matchesSearch =
        search.length === 0 ||
        restaurant.name.toLowerCase().includes(search) ||
        restaurant.description.toLowerCase().includes(search) ||
        restaurant.address.toLowerCase().includes(search)
      const matchesLocation =
        location.length === 0 || restaurant.address.toLowerCase().includes(location)
      const matchesCuisine = cuisine === 'all' || restaurant.cuisine === cuisine
      const matchesPriceRange = priceRange === 'all' || restaurant.priceRange === priceRange
      const matchesRating = restaurant.stats.averageRating >= minRating

      return matchesSearch && matchesLocation && matchesCuisine && matchesPriceRange && matchesRating
    })
    .sort((left, right) => right.stats.averageRating - left.stats.averageRating)

  return clone(filtered)
}

export function getRestaurantById(id) {
  const restaurant = findRestaurantById(id)
  return hydrateRestaurant(restaurant)
}

export function listReviewsByRestaurant(restaurantId) {
  return clone(
    state.reviews
      .filter((review) => review.restaurantId === restaurantId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .map((review) => ({
        ...review,
        user: stripPassword(findUserById(review.userId)),
      })),
  )
}

export function createOrUpdateReview(restaurantId, payload) {
  const userId = getCurrentUserId()
  findRestaurantById(restaurantId)

  const existingReview = state.reviews.find(
    (review) => review.restaurantId === restaurantId && review.userId === userId,
  )

  if (existingReview) {
    existingReview.rating = payload.rating
    existingReview.comment = payload.comment.trim()
    existingReview.createdAt = new Date().toISOString()
    appendFeedItem({
      type: 'review',
      userId,
      restaurantId,
      reviewId: existingReview.id,
    })

    return clone(existingReview)
  }

  const newReview = {
    id: `rev${state.reviews.length + 1}`,
    restaurantId,
    userId,
    rating: payload.rating,
    comment: payload.comment.trim(),
    createdAt: new Date().toISOString(),
  }

  state.reviews.unshift(newReview)
  appendFeedItem({
    type: 'review',
    userId,
    restaurantId,
    reviewId: newReview.id,
  })

  return clone(newReview)
}

export function getWishlist(userId = null) {
  const targetUserId = userId ?? getCurrentUserId()
  const items = state.wishlistByUser[targetUserId] ?? []

  return clone(
    items
      .map((item) => ({
        ...item,
        restaurant: hydrateRestaurant(findRestaurantById(item.restaurantId)),
      }))
      .sort((left, right) => new Date(right.addedAt) - new Date(left.addedAt)),
  )
}

export function toggleWishlist(restaurantId) {
  const userId = getCurrentUserId()
  findRestaurantById(restaurantId)

  const currentList = state.wishlistByUser[userId] ?? []
  const index = currentList.findIndex((item) => item.restaurantId === restaurantId)

  if (index >= 0) {
    const [removed] = currentList.splice(index, 1)
    state.wishlistByUser[userId] = currentList
    return { active: false, item: clone(removed) }
  }

  const newItem = {
    userId,
    restaurantId,
    addedAt: new Date().toISOString(),
  }

  currentList.unshift(newItem)
  state.wishlistByUser[userId] = currentList
  appendFeedItem({ type: 'wishlist', userId, restaurantId })

  return { active: true, item: clone(newItem) }
}

export function getVisited(userId = null) {
  const targetUserId = userId ?? getCurrentUserId()
  const items = state.visitedByUser[targetUserId] ?? []

  return clone(
    items
      .map((item) => ({
        ...item,
        restaurant: hydrateRestaurant(findRestaurantById(item.restaurantId)),
      }))
      .sort((left, right) => new Date(right.visitedAt) - new Date(left.visitedAt)),
  )
}

export function toggleVisited(restaurantId, payload = {}) {
  const userId = getCurrentUserId()
  findRestaurantById(restaurantId)

  const currentList = state.visitedByUser[userId] ?? []
  const index = currentList.findIndex((item) => item.restaurantId === restaurantId)

  if (index >= 0) {
    const [removed] = currentList.splice(index, 1)
    state.visitedByUser[userId] = currentList
    return { active: false, item: clone(removed) }
  }

  const newItem = {
    userId,
    restaurantId,
    visitedAt: new Date().toISOString(),
    userRating: payload.userRating ?? null,
  }

  currentList.unshift(newItem)
  state.visitedByUser[userId] = currentList
  appendFeedItem({ type: 'visited', userId, restaurantId })

  return { active: true, item: clone(newItem) }
}

export function getProfile(userId) {
  const viewerId = state.session?.userId
  const user = findUserById(userId)

  return {
    ...stripPassword(user),
    ...buildUserStats(userId),
    isFollowing: viewerId ? (state.followingByUser[viewerId] ?? []).includes(userId) : false,
  }
}

export function getUserCollections(userId) {
  const reviews = state.reviews
    .filter((review) => review.userId === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((review) => ({
      ...review,
      restaurant: hydrateRestaurant(findRestaurantById(review.restaurantId)),
      user: stripPassword(findUserById(userId)),
    }))

  const wishlist = getWishlist(userId)
  const visited = getVisited(userId)

  return clone({ reviews, wishlist, visited })
}

export function searchUsers(query = '') {
  const currentUserId = getCurrentUserId()
  const lowered = query.trim().toLowerCase()

  const results = state.users
    .filter((user) => user.id !== currentUserId)
    .filter((user) => {
      if (!lowered) {
        return true
      }

      return (
        user.name.toLowerCase().includes(lowered) || user.username.toLowerCase().includes(lowered)
      )
    })
    .map((user) => ({
      ...stripPassword(user),
      ...buildUserStats(user.id),
      isFollowing: (state.followingByUser[currentUserId] ?? []).includes(user.id),
    }))
    .sort((left, right) => right.followersCount - left.followersCount)

  return clone(results)
}

export function followUser(userId) {
  const currentUserId = getCurrentUserId()

  if (currentUserId === userId) {
    throw new Error('Você não pode seguir o próprio perfil.')
  }

  findUserById(userId)
  const following = state.followingByUser[currentUserId] ?? []
  const index = following.indexOf(userId)

  if (index >= 0) {
    following.splice(index, 1)
    state.followingByUser[currentUserId] = following
    return {
      isFollowing: false,
      followersCount: getFollowersCount(userId),
    }
  }

  following.push(userId)
  state.followingByUser[currentUserId] = following
  appendFeedItem({
    type: 'follow',
    userId: currentUserId,
    targetUserId: userId,
  })

  return {
    isFollowing: true,
    followersCount: getFollowersCount(userId),
  }
}

export function getFeed() {
  getCurrentUserId()

  return clone(
    state.feed
      .map((item) => ({
        ...item,
        user: stripPassword(findUserById(item.userId)),
        restaurant: item.restaurantId ? hydrateRestaurant(findRestaurantById(item.restaurantId)) : null,
        targetUser: item.targetUserId ? stripPassword(findUserById(item.targetUserId)) : null,
        review: item.reviewId ? state.reviews.find((review) => review.id === item.reviewId) : null,
      }))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)),
  )
}
