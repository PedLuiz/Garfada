const db = require('./db')
const { AppError, isUniqueViolation } = require('./errors')
const { createId } = require('./utils/ids')

const FAVORITE_CUISINES_SQL = `
COALESCE(
  (
    SELECT json_agg(c.name ORDER BY c.name)
    FROM user_favorite_cuisines ufc
    JOIN cuisines c ON c.id = ufc.cuisine_id
    WHERE ufc.user_id = u.id
  ),
  '[]'::json
)
`

const RESTAURANT_JSON_SQL = `
json_build_object(
  'id', r.id,
  'name', r.name,
  'cuisine', c.name,
  'priceRange', r.price_range,
  'description', r.description,
  'address', r.address,
  'photos',
    COALESCE(
      (
        SELECT json_agg(rp.photo_url ORDER BY rp.sort_order)
        FROM restaurant_photos rp
        WHERE rp.restaurant_id = r.id
      ),
      '[]'::json
    ),
  'menuPreview',
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('item', mi.item_name, 'price', mi.price_label)
          ORDER BY mi.sort_order
        )
        FROM restaurant_menu_items mi
        WHERE mi.restaurant_id = r.id
      ),
      '[]'::json
    ),
  'stats',
    json_build_object(
      'averageRating', COALESCE(vrs.average_rating, 0)::float,
      'reviewsCount', COALESCE(vrs.reviews_count, 0)::int,
      'commentsCount', COALESCE(vrs.comments_count, 0)::int,
      'visitsCount', COALESCE(vrs.visits_count, 0)::int
    )
)
`

function resolveExecutor(executor) {
  return executor || db
}

async function ensureRestaurantExists(restaurantId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rowCount } = await queryExecutor.query(
    `SELECT 1
     FROM restaurants
     WHERE id = $1`,
    [restaurantId],
  )

  if (rowCount === 0) {
    throw new AppError('Restaurante não encontrado.', 404)
  }
}

async function ensureUserExists(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rowCount } = await queryExecutor.query(
    `SELECT 1
     FROM users
     WHERE id = $1`,
    [userId],
  )

  if (rowCount === 0) {
    throw new AppError('Usuário não encontrado.', 404)
  }
}

function sanitizeCuisineNames(cuisines = []) {
  const uniqueByLower = new Map()

  for (const cuisine of cuisines) {
    if (typeof cuisine !== 'string') {
      continue
    }

    const trimmed = cuisine.trim()

    if (!trimmed) {
      continue
    }

    const key = trimmed.toLowerCase()

    if (!uniqueByLower.has(key)) {
      uniqueByLower.set(key, trimmed)
    }
  }

  return [...uniqueByLower.values()]
}

async function syncFavoriteCuisines(userId, cuisines, executor) {
  const queryExecutor = resolveExecutor(executor)
  const names = sanitizeCuisineNames(cuisines)

  await queryExecutor.query(
    `DELETE FROM user_favorite_cuisines
     WHERE user_id = $1`,
    [userId],
  )

  if (names.length === 0) {
    return
  }

  const loweredNames = names.map((name) => name.toLowerCase())

  const existingResult = await queryExecutor.query(
    `SELECT LOWER(name) AS name_key
     FROM cuisines
     WHERE LOWER(name) = ANY($1::text[])`,
    [loweredNames],
  )

  const existingKeys = new Set(existingResult.rows.map((row) => row.name_key))
  const missingNames = names.filter((name) => !existingKeys.has(name.toLowerCase()))

  if (missingNames.length > 0) {
    const placeholders = missingNames.map((_, index) => `($${index + 1})`).join(', ')
    await queryExecutor.query(
      `INSERT INTO cuisines (name)
       VALUES ${placeholders}
       ON CONFLICT (name) DO NOTHING`,
      missingNames,
    )
  }

  const cuisineIdsResult = await queryExecutor.query(
    `SELECT id
     FROM cuisines
     WHERE LOWER(name) = ANY($1::text[])`,
    [loweredNames],
  )

  const cuisineIds = cuisineIdsResult.rows.map((row) => row.id)

  if (cuisineIds.length === 0) {
    return
  }

  await queryExecutor.query(
    `INSERT INTO user_favorite_cuisines (user_id, cuisine_id)
     SELECT $1, UNNEST($2::bigint[])
     ON CONFLICT (user_id, cuisine_id) DO NOTHING`,
    [userId, cuisineIds],
  )
}

async function getAuthUserById(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.username,
      u.avatar_url AS "avatarUrl",
      u.bio,
      ${FAVORITE_CUISINES_SQL} AS "favoriteCuisines"
    FROM users u
    WHERE u.id = $1`,
    [userId],
  )

  return rows[0] || null
}

async function findUserForAuthByIdentifier(identifier, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      id,
      name,
      email,
      username,
      password_hash AS "passwordHash",
      avatar_url AS "avatarUrl",
      bio
    FROM users
    WHERE LOWER(email) = LOWER($1)
      OR LOWER(username) = LOWER($1)
    LIMIT 1`,
    [identifier],
  )

  return rows[0] || null
}

async function createUser({ name, email, username, passwordHash, avatarUrl, bio }) {
  return db.transaction(async (client) => {
    try {
      const userId = createId('u')

      await client.query(
        `INSERT INTO users (
          id,
          name,
          email,
          username,
          password_hash,
          avatar_url,
          bio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, name, email, username, passwordHash, avatarUrl, bio],
      )

      return getAuthUserById(userId, client)
    } catch (error) {
      if (isUniqueViolation(error, 'ux_users_email_ci')) {
        throw new AppError('Esse e-mail já está em uso.', 409)
      }

      if (isUniqueViolation(error, 'ux_users_username_ci')) {
        throw new AppError('Esse username já foi escolhido por outra pessoa.', 409)
      }

      throw error
    }
  })
}

async function getMeProfile(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      u.id,
      u.name,
      u.email,
      u.username,
      u.avatar_url AS "avatarUrl",
      u.bio,
      ${FAVORITE_CUISINES_SQL} AS "favoriteCuisines",
      COALESCE(vus.reviews_count, 0)::int AS "reviewsCount",
      COALESCE(vus.visited_count, 0)::int AS "visitedCount",
      COALESCE(vus.wishlist_count, 0)::int AS "wishlistCount",
      COALESCE(vus.followers_count, 0)::int AS "followersCount",
      COALESCE(vus.following_count, 0)::int AS "followingCount"
    FROM users u
    LEFT JOIN v_user_stats vus ON vus.user_id = u.id
    WHERE u.id = $1`,
    [userId],
  )

  return rows[0] || null
}

async function getUserProfileById(targetUserId, viewerUserId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      u.id,
      u.name,
      u.username,
      u.avatar_url AS "avatarUrl",
      u.bio,
      ${FAVORITE_CUISINES_SQL} AS "favoriteCuisines",
      COALESCE(vus.reviews_count, 0)::int AS "reviewsCount",
      COALESCE(vus.visited_count, 0)::int AS "visitedCount",
      COALESCE(vus.wishlist_count, 0)::int AS "wishlistCount",
      COALESCE(vus.followers_count, 0)::int AS "followersCount",
      COALESCE(vus.following_count, 0)::int AS "followingCount",
      CASE
        WHEN $2::text IS NULL THEN FALSE
        ELSE EXISTS (
          SELECT 1
          FROM user_follows uf
          WHERE uf.follower_user_id = $2
            AND uf.followed_user_id = u.id
        )
      END AS "isFollowing"
    FROM users u
    LEFT JOIN v_user_stats vus ON vus.user_id = u.id
    WHERE u.id = $1`,
    [targetUserId, viewerUserId ?? null],
  )

  return rows[0] || null
}

async function updateMeProfile(userId, payload) {
  return db.transaction(async (client) => {
    const assignments = []
    const values = []
    let index = 1

    if (payload.name !== undefined) {
      assignments.push(`name = $${index}`)
      values.push(payload.name)
      index += 1
    }

    if (payload.username !== undefined) {
      assignments.push(`username = $${index}`)
      values.push(payload.username)
      index += 1
    }

    if (payload.bio !== undefined) {
      assignments.push(`bio = $${index}`)
      values.push(payload.bio)
      index += 1
    }

    if (payload.avatarUrl !== undefined) {
      assignments.push(`avatar_url = $${index}`)
      values.push(payload.avatarUrl)
      index += 1
    }

    if (assignments.length > 0) {
      assignments.push('updated_at = NOW()')
      values.push(userId)

      try {
        const updateResult = await client.query(
          `UPDATE users
           SET ${assignments.join(', ')}
           WHERE id = $${index}
           RETURNING id`,
          values,
        )

        if (updateResult.rowCount === 0) {
          throw new AppError('Usuário não encontrado.', 404)
        }
      } catch (error) {
        if (isUniqueViolation(error, 'ux_users_username_ci')) {
          throw new AppError('Username indisponível no momento.', 409)
        }

        if (isUniqueViolation(error, 'ux_users_email_ci')) {
          throw new AppError('Esse e-mail já está em uso.', 409)
        }

        throw error
      }
    } else {
      await ensureUserExists(userId, client)
    }

    if (payload.favoriteCuisines !== undefined) {
      await syncFavoriteCuisines(userId, payload.favoriteCuisines, client)
    }

    return getMeProfile(userId, client)
  })
}

async function listRestaurants(filters = {}, executor) {
  const queryExecutor = resolveExecutor(executor)
  const conditions = []
  const values = []

  const search = filters.search?.trim().toLowerCase()
  const location = filters.location?.trim().toLowerCase()
  const cuisine = filters.cuisine?.trim()
  const priceRange = filters.priceRange?.trim()
  const minRating = Number(filters.minRating ?? 0)

  if (search) {
    values.push(`%${search}%`)
    const searchNameParam = `$${values.length}`
    values.push(`%${search}%`)
    const searchDescriptionParam = `$${values.length}`
    values.push(`%${search}%`)
    const searchAddressParam = `$${values.length}`

    conditions.push(
      `(LOWER(r.name) LIKE ${searchNameParam} OR LOWER(r.description) LIKE ${searchDescriptionParam} OR LOWER(r.address) LIKE ${searchAddressParam})`,
    )
  }

  if (location) {
    values.push(`%${location}%`)
    conditions.push(`LOWER(r.address) LIKE $${values.length}`)
  }

  if (cuisine && cuisine !== 'all') {
    values.push(cuisine)
    conditions.push(`c.name = $${values.length}`)
  }

  if (priceRange && priceRange !== 'all') {
    values.push(priceRange)
    conditions.push(`r.price_range = $${values.length}`)
  }

  if (!Number.isNaN(minRating) && minRating > 0) {
    values.push(minRating)
    conditions.push(`COALESCE(vrs.average_rating, 0) >= $${values.length}`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await queryExecutor.query(
    `SELECT ${RESTAURANT_JSON_SQL} AS restaurant
     FROM restaurants r
     JOIN cuisines c ON c.id = r.cuisine_id
     LEFT JOIN v_restaurant_stats vrs ON vrs.restaurant_id = r.id
     ${whereClause}
     ORDER BY COALESCE(vrs.average_rating, 0) DESC, r.name ASC`,
    values,
  )

  return rows.map((row) => row.restaurant)
}

async function getRestaurantById(restaurantId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT ${RESTAURANT_JSON_SQL} AS restaurant
     FROM restaurants r
     JOIN cuisines c ON c.id = r.cuisine_id
     LEFT JOIN v_restaurant_stats vrs ON vrs.restaurant_id = r.id
     WHERE r.id = $1`,
    [restaurantId],
  )

  return rows[0]?.restaurant || null
}

async function listReviewsByRestaurant(restaurantId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      rv.id,
      rv.restaurant_id AS "restaurantId",
      rv.user_id AS "userId",
      rv.rating::float AS rating,
      rv.comment,
      rv.updated_at AS "createdAt",
      json_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) AS user
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    WHERE rv.restaurant_id = $1
    ORDER BY rv.updated_at DESC`,
    [restaurantId],
  )

  return rows
}

async function listReviewsByUser(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      rv.id,
      rv.restaurant_id AS "restaurantId",
      rv.user_id AS "userId",
      rv.rating::float AS rating,
      rv.comment,
      rv.updated_at AS "createdAt",
      json_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) AS user,
      ${RESTAURANT_JSON_SQL} AS restaurant
    FROM reviews rv
    JOIN users u ON u.id = rv.user_id
    JOIN restaurants r ON r.id = rv.restaurant_id
    JOIN cuisines c ON c.id = r.cuisine_id
    LEFT JOIN v_restaurant_stats vrs ON vrs.restaurant_id = r.id
    WHERE rv.user_id = $1
    ORDER BY rv.updated_at DESC`,
    [userId],
  )

  return rows
}

async function createFeedEvent(client, payload) {
  await client.query(
    `INSERT INTO feed_events (
      id,
      type,
      user_id,
      target_user_id,
      restaurant_id,
      review_id
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      createId('feed'),
      payload.type,
      payload.userId,
      payload.targetUserId || null,
      payload.restaurantId || null,
      payload.reviewId || null,
    ],
  )
}

async function upsertReview({ userId, restaurantId, rating, comment }) {
  return db.transaction(async (client) => {
    await ensureRestaurantExists(restaurantId, client)

    const reviewId = createId('rev')
    const { rows } = await client.query(
      `INSERT INTO reviews (
        id,
        restaurant_id,
        user_id,
        rating,
        comment,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (user_id, restaurant_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        updated_at = NOW()
      RETURNING
        id,
        restaurant_id AS "restaurantId",
        user_id AS "userId",
        rating::float AS rating,
        comment,
        updated_at AS "createdAt"`,
      [reviewId, restaurantId, userId, rating, comment],
    )

    const review = rows[0]

    await createFeedEvent(client, {
      type: 'review',
      userId,
      restaurantId,
      reviewId: review.id,
    })

    return review
  })
}

async function listWishlistByUser(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      wi.user_id AS "userId",
      wi.restaurant_id AS "restaurantId",
      wi.added_at AS "addedAt",
      ${RESTAURANT_JSON_SQL} AS restaurant
    FROM wishlist_items wi
    JOIN restaurants r ON r.id = wi.restaurant_id
    JOIN cuisines c ON c.id = r.cuisine_id
    LEFT JOIN v_restaurant_stats vrs ON vrs.restaurant_id = r.id
    WHERE wi.user_id = $1
    ORDER BY wi.added_at DESC`,
    [userId],
  )

  return rows
}

async function addWishlistItem(userId, restaurantId) {
  return db.transaction(async (client) => {
    await ensureRestaurantExists(restaurantId, client)

    try {
      const insertResult = await client.query(
        `INSERT INTO wishlist_items (user_id, restaurant_id, added_at)
         VALUES ($1, $2, NOW())
         RETURNING
           user_id AS "userId",
           restaurant_id AS "restaurantId",
           added_at AS "addedAt"`,
        [userId, restaurantId],
      )

      const item = insertResult.rows[0]

      await createFeedEvent(client, {
        type: 'wishlist',
        userId,
        restaurantId,
      })

      return item
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError('Restaurante já está na sua lista de desejos.', 409)
      }

      throw error
    }
  })
}

async function removeWishlistItem(userId, restaurantId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rowCount } = await queryExecutor.query(
    `DELETE FROM wishlist_items
     WHERE user_id = $1
       AND restaurant_id = $2`,
    [userId, restaurantId],
  )

  return rowCount > 0
}

async function listVisitedByUser(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      vr.user_id AS "userId",
      vr.restaurant_id AS "restaurantId",
      vr.visited_at AS "visitedAt",
      vr.user_rating::float AS "userRating",
      ${RESTAURANT_JSON_SQL} AS restaurant
    FROM visited_restaurants vr
    JOIN restaurants r ON r.id = vr.restaurant_id
    JOIN cuisines c ON c.id = r.cuisine_id
    LEFT JOIN v_restaurant_stats vrs ON vrs.restaurant_id = r.id
    WHERE vr.user_id = $1
    ORDER BY vr.visited_at DESC`,
    [userId],
  )

  return rows
}

async function addVisitedItem(userId, restaurantId, userRating) {
  return db.transaction(async (client) => {
    await ensureRestaurantExists(restaurantId, client)

    try {
      const insertResult = await client.query(
        `INSERT INTO visited_restaurants (user_id, restaurant_id, visited_at, user_rating)
         VALUES ($1, $2, NOW(), $3)
         RETURNING
           user_id AS "userId",
           restaurant_id AS "restaurantId",
           visited_at AS "visitedAt",
           user_rating::float AS "userRating"`,
        [userId, restaurantId, userRating],
      )

      const item = insertResult.rows[0]

      await createFeedEvent(client, {
        type: 'visited',
        userId,
        restaurantId,
      })

      return item
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError('Restaurante já está marcado como visitado.', 409)
      }

      throw error
    }
  })
}

async function removeVisitedItem(userId, restaurantId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rowCount } = await queryExecutor.query(
    `DELETE FROM visited_restaurants
     WHERE user_id = $1
       AND restaurant_id = $2`,
    [userId, restaurantId],
  )

  return rowCount > 0
}

async function getFollowersCount(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT COALESCE(vus.followers_count, 0)::int AS "followersCount"
     FROM v_user_stats vus
     WHERE vus.user_id = $1`,
    [userId],
  )

  return rows[0]?.followersCount ?? 0
}

async function followUser(followerUserId, followedUserId) {
  if (followerUserId === followedUserId) {
    throw new AppError('Você não pode seguir o próprio perfil.', 400)
  }

  return db.transaction(async (client) => {
    await ensureUserExists(followedUserId, client)

    try {
      await client.query(
        `INSERT INTO user_follows (follower_user_id, followed_user_id, created_at)
         VALUES ($1, $2, NOW())`,
        [followerUserId, followedUserId],
      )

      await createFeedEvent(client, {
        type: 'follow',
        userId: followerUserId,
        targetUserId: followedUserId,
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError('Você já está seguindo este usuário.', 409)
      }

      throw error
    }

    const followersCount = await getFollowersCount(followedUserId, client)

    return {
      isFollowing: true,
      followersCount,
    }
  })
}

async function unfollowUser(followerUserId, followedUserId) {
  if (followerUserId === followedUserId) {
    throw new AppError('Você não pode deixar de seguir o próprio perfil.', 400)
  }

  await ensureUserExists(followedUserId)

  await db.query(
    `DELETE FROM user_follows
     WHERE follower_user_id = $1
       AND followed_user_id = $2`,
    [followerUserId, followedUserId],
  )

  const followersCount = await getFollowersCount(followedUserId)

  return {
    isFollowing: false,
    followersCount,
  }
}

async function searchUsers(viewerUserId, query = '', executor) {
  const queryExecutor = resolveExecutor(executor)
  const trimmedQuery = query.trim().toLowerCase()
  const likeValue = `%${trimmedQuery}%`

  const { rows } = await queryExecutor.query(
    `SELECT
      u.id,
      u.name,
      u.username,
      u.avatar_url AS "avatarUrl",
      COALESCE(vus.reviews_count, 0)::int AS "reviewsCount",
      COALESCE(vus.visited_count, 0)::int AS "visitedCount",
      COALESCE(vus.wishlist_count, 0)::int AS "wishlistCount",
      COALESCE(vus.followers_count, 0)::int AS "followersCount",
      COALESCE(vus.following_count, 0)::int AS "followingCount",
      EXISTS (
        SELECT 1
        FROM user_follows uf
        WHERE uf.follower_user_id = $1
          AND uf.followed_user_id = u.id
      ) AS "isFollowing"
    FROM users u
    LEFT JOIN v_user_stats vus ON vus.user_id = u.id
    WHERE u.id <> $1
      AND (
        $2 = ''
        OR LOWER(u.name) LIKE $3
        OR LOWER(u.username) LIKE $3
      )
    ORDER BY COALESCE(vus.followers_count, 0) DESC, u.name ASC
    LIMIT 30`,
    [viewerUserId, trimmedQuery, likeValue],
  )

  return rows
}

async function listFeed(executor) {
  const queryExecutor = resolveExecutor(executor)
  const { rows } = await queryExecutor.query(
    `SELECT
      fe.id,
      fe.type,
      fe.user_id AS "userId",
      fe.target_user_id AS "targetUserId",
      fe.restaurant_id AS "restaurantId",
      fe.review_id AS "reviewId",
      fe.created_at AS "createdAt",
      json_build_object(
        'id', u.id,
        'name', u.name,
        'username', u.username,
        'avatarUrl', u.avatar_url
      ) AS user,
      CASE
        WHEN tu.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', tu.id,
          'name', tu.name,
          'username', tu.username,
          'avatarUrl', tu.avatar_url
        )
      END AS "targetUser",
      CASE
        WHEN r.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', r.id,
          'name', r.name,
          'cuisine', c.name,
          'priceRange', r.price_range,
          'address', r.address
        )
      END AS restaurant,
      CASE
        WHEN rv.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', rv.id,
          'restaurantId', rv.restaurant_id,
          'userId', rv.user_id,
          'rating', rv.rating::float,
          'comment', rv.comment,
          'createdAt', rv.updated_at
        )
      END AS review
    FROM feed_events fe
    JOIN users u ON u.id = fe.user_id
    LEFT JOIN users tu ON tu.id = fe.target_user_id
    LEFT JOIN restaurants r ON r.id = fe.restaurant_id
    LEFT JOIN cuisines c ON c.id = r.cuisine_id
    LEFT JOIN reviews rv ON rv.id = fe.review_id
    ORDER BY fe.created_at DESC
    LIMIT 100`,
  )

  return rows
}

async function getUserCollections(userId, executor) {
  const queryExecutor = resolveExecutor(executor)
  await ensureUserExists(userId, queryExecutor)

  const [reviews, wishlist, visited] = await Promise.all([
    listReviewsByUser(userId, queryExecutor),
    listWishlistByUser(userId, queryExecutor),
    listVisitedByUser(userId, queryExecutor),
  ])

  return {
    reviews,
    wishlist,
    visited,
  }
}

module.exports = {
  findUserForAuthByIdentifier,
  getAuthUserById,
  createUser,
  getMeProfile,
  getUserProfileById,
  updateMeProfile,
  listRestaurants,
  getRestaurantById,
  listReviewsByRestaurant,
  upsertReview,
  listWishlistByUser,
  addWishlistItem,
  removeWishlistItem,
  listVisitedByUser,
  addVisitedItem,
  removeVisitedItem,
  getUserCollections,
  followUser,
  unfollowUser,
  searchUsers,
  listFeed,
  ensureRestaurantExists,
  ensureUserExists,
}
