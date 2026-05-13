require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./db')
const repositories = require('./repositories')
const { AppError } = require('./errors')
const { signAccessToken, requireAuth } = require('./middleware/auth')
const { hashPassword, verifyPassword } = require('./utils/password')

const app = express()
const port = Number(process.env.PORT) || 3001

// CORS fica configuravel por ambiente para permitir o frontend local e,
// em producao, restringir quais origens podem consumir a API.
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

// Centraliza erros de rotas async sem repetir try/catch em cada endpoint.
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

// Normaliza campos textuais vindos do cliente antes das validacoes.
function trimOrEmpty(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

// Login e cadastro devolvem sempre o mesmo contrato: token JWT + usuario.
function buildSessionResponse(user) {
  return {
    token: signAccessToken(user.id),
    user,
  }
}

// Mantem o PUT /api/me restrito aos campos permitidos e valida cada um deles.
function sanitizeProfileUpdatePayload(payload) {
  const sanitized = {}

  if (payload.name !== undefined) {
    const name = trimOrEmpty(payload.name)

    if (!name) {
      throw new AppError('Informe um nome válido.', 400)
    }

    sanitized.name = name
  }

  if (payload.username !== undefined) {
    const username = trimOrEmpty(payload.username)

    if (!username) {
      throw new AppError('Informe um username válido.', 400)
    }

    if (username.length < 3) {
      throw new AppError('O username precisa ter ao menos 3 caracteres.', 400)
    }

    sanitized.username = username
  }

  if (payload.bio !== undefined) {
    if (typeof payload.bio !== 'string') {
      throw new AppError('A bio deve ser um texto.', 400)
    }

    sanitized.bio = payload.bio.trim()
  }

  if (payload.avatarUrl !== undefined) {
    if (typeof payload.avatarUrl !== 'string') {
      throw new AppError('A URL do avatar deve ser um texto.', 400)
    }

    sanitized.avatarUrl = payload.avatarUrl.trim()
  }

  if (payload.favoriteCuisines !== undefined) {
    if (!Array.isArray(payload.favoriteCuisines)) {
      throw new AppError('favoriteCuisines deve ser uma lista de textos.', 400)
    }

    sanitized.favoriteCuisines = payload.favoriteCuisines
  }

  return sanitized
}

// Endpoint de observabilidade para confirmar se API e banco estao respondendo.
app.get('/health', async (_req, res) => {
  try {
    await db.checkConnection()
    return res.status(200).json({ ok: true, service: 'backend' })
  } catch (error) {
    return res.status(503).json({ ok: false, error: error.message })
  }
})

app.post(
  '/api/auth/register',
  asyncHandler(async (req, res) => {
    // Revalidamos dados obrigatorios no backend para nao depender do frontend.
    const name = trimOrEmpty(req.body?.name)
    const email = trimOrEmpty(req.body?.email)
    const username = trimOrEmpty(req.body?.username)
    const password = trimOrEmpty(req.body?.password)

    if (!name || !email || !username || !password) {
      throw new AppError('Preencha todos os campos obrigatórios para criar a conta.', 400)
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new AppError('Digite um e-mail válido.', 400)
    }

    if (username.length < 3) {
      throw new AppError('O username precisa ter ao menos 3 caracteres.', 400)
    }

    if (password.length < 6) {
      throw new AppError('A senha precisa ter ao menos 6 caracteres.', 400)
    }

    // A senha nunca e salva em texto puro: apenas o hash vai para o banco.
    const user = await repositories.createUser({
      name,
      email,
      username,
      passwordHash: hashPassword(password),
      avatarUrl: `https://i.pravatar.cc/160?u=${encodeURIComponent(username)}`,
      bio: 'Novo no Garfada. Em busca dos próximos favoritos.',
    })

    return res.status(201).json(buildSessionResponse(user))
  }),
)

app.post(
  '/api/auth/login',
  asyncHandler(async (req, res) => {
    // O identificador aceita email ou username, comparados sem diferenciar maiusculas.
    const identifier = trimOrEmpty(req.body?.identifier)
    const password = trimOrEmpty(req.body?.password)

    if (!identifier || !password) {
      throw new AppError('Preencha usuário/e-mail e senha para continuar.', 400)
    }

    const existingUser = await repositories.findUserForAuthByIdentifier(identifier)

    if (!existingUser || !verifyPassword(password, existingUser.passwordHash)) {
      throw new AppError('Credenciais inválidas. Confira e tente novamente.', 401)
    }

    const user = await repositories.getAuthUserById(existingUser.id)

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    return res.status(200).json(buildSessionResponse(user))
  }),
)

app.get(
  '/api/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await repositories.getAuthUserById(req.auth.userId)

    if (!user) {
      throw new AppError('Sessão inválida. Faça login novamente.', 401)
    }

    return res.status(200).json(user)
  }),
)

app.get(
  '/api/restaurants',
  asyncHandler(async (req, res) => {
    // O repositorio monta uma consulta parametrizada so com os filtros enviados.
    const restaurants = await repositories.listRestaurants({
      search: req.query.search,
      location: req.query.location,
      cuisine: req.query.cuisine,
      priceRange: req.query.priceRange,
      minRating: req.query.minRating,
    })

    return res.status(200).json(restaurants)
  }),
)

app.get(
  '/api/restaurants/:id',
  asyncHandler(async (req, res) => {
    const restaurant = await repositories.getRestaurantById(req.params.id)

    if (!restaurant) {
      throw new AppError('Restaurante não encontrado.', 404)
    }

    return res.status(200).json(restaurant)
  }),
)

app.get(
  '/api/restaurants/:id/reviews',
  asyncHandler(async (req, res) => {
    await repositories.ensureRestaurantExists(req.params.id)
    const reviews = await repositories.listReviewsByRestaurant(req.params.id)

    return res.status(200).json(reviews)
  }),
)

app.post(
  '/api/restaurants/:id/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Cada usuario tem no maximo uma review por restaurante; o repositorio faz upsert.
    const rating = Number(req.body?.rating)
    const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : ''

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      throw new AppError('A nota deve estar entre 1 e 5 estrelas.', 400)
    }

    const review = await repositories.upsertReview({
      userId: req.auth.userId,
      restaurantId: req.params.id,
      rating,
      comment,
    })

    return res.status(201).json(review)
  }),
)

app.get(
  '/api/me/wishlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    const wishlist = await repositories.listWishlistByUser(req.auth.userId)
    return res.status(200).json(wishlist)
  }),
)

app.post(
  '/api/restaurants/:id/wishlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await repositories.addWishlistItem(req.auth.userId, req.params.id)

    return res.status(201).json({
      active: true,
      item,
    })
  }),
)

app.delete(
  '/api/restaurants/:id/wishlist',
  requireAuth,
  asyncHandler(async (req, res) => {
    await repositories.removeWishlistItem(req.auth.userId, req.params.id)
    return res.status(200).json({ active: false })
  }),
)

app.get(
  '/api/me/visited',
  requireAuth,
  asyncHandler(async (req, res) => {
    const visited = await repositories.listVisitedByUser(req.auth.userId)
    return res.status(200).json(visited)
  }),
)

app.post(
  '/api/restaurants/:id/visited',
  requireAuth,
  asyncHandler(async (req, res) => {
    // userRating e opcional; vazio vira NULL no banco.
    const rawRating = req.body?.userRating
    const userRating = rawRating === undefined || rawRating === null || rawRating === '' ? null : Number(rawRating)

    if (userRating !== null && (Number.isNaN(userRating) || userRating < 1 || userRating > 5)) {
      throw new AppError('A nota da visita deve estar entre 1 e 5.', 400)
    }

    const item = await repositories.addVisitedItem(req.auth.userId, req.params.id, userRating)

    return res.status(201).json({
      active: true,
      item,
    })
  }),
)

app.delete(
  '/api/restaurants/:id/visited',
  requireAuth,
  asyncHandler(async (req, res) => {
    await repositories.removeVisitedItem(req.auth.userId, req.params.id)
    return res.status(200).json({ active: false })
  }),
)

app.get(
  '/api/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await repositories.getMeProfile(req.auth.userId)

    if (!profile) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    return res.status(200).json(profile)
  }),
)

app.put(
  '/api/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = sanitizeProfileUpdatePayload(req.body || {})
    const updatedProfile = await repositories.updateMeProfile(req.auth.userId, payload)

    return res.status(200).json(updatedProfile)
  }),
)

app.get(
  '/api/me/collections',
  requireAuth,
  asyncHandler(async (req, res) => {
    const collections = await repositories.getUserCollections(req.auth.userId)
    return res.status(200).json(collections)
  }),
)

app.get(
  '/api/feed',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const feed = await repositories.listFeed()
    return res.status(200).json(feed)
  }),
)

app.get(
  '/api/users/search',
  requireAuth,
  asyncHandler(async (req, res) => {
    const users = await repositories.searchUsers(req.auth.userId, trimOrEmpty(req.query.q))
    return res.status(200).json(users)
  }),
)

app.post(
  '/api/users/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await repositories.followUser(req.auth.userId, req.params.id)
    return res.status(201).json(result)
  }),
)

app.delete(
  '/api/users/:id/follow',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await repositories.unfollowUser(req.auth.userId, req.params.id)
    return res.status(200).json(result)
  }),
)

app.get(
  '/api/users/:id/collections',
  requireAuth,
  asyncHandler(async (req, res) => {
    const collections = await repositories.getUserCollections(req.params.id)
    return res.status(200).json(collections)
  }),
)

app.get(
  '/api/users/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const profile = await repositories.getUserProfileById(req.params.id, req.auth.userId)

    if (!profile) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    return res.status(200).json(profile)
  }),
)

app.use((_req, res) => {
  return res.status(404).json({ message: 'Rota não encontrada.' })
})

// Resposta de erro padronizada para o frontend.
// AppError representa falhas esperadas; erros inesperados viram 500 generico.
app.use((error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details || undefined,
    })
  }

  if (error?.code === '22P02') {
    return res.status(400).json({ message: 'Parâmetros inválidos para esta operação.' })
  }

  console.error(error)
  const payload = { message: 'Erro interno do servidor.' }

  if (process.env.NODE_ENV !== 'production') {
    payload.debug = {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      constraint: error?.constraint,
    }
  }

  return res.status(500).json(payload)
})

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})
