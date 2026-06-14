const supertest = require('supertest')
const { hashPassword } = require('../../src/utils/password')

function createMockRepositories() {
  return {
    findUserForAuthByIdentifier: jest.fn(),
    getAuthUserById: jest.fn(),
    createUser: jest.fn(),
    getMeProfile: jest.fn(),
    getUserProfileById: jest.fn(),
    updateMeProfile: jest.fn(),
    listRestaurants: jest.fn(),
    getRestaurantById: jest.fn(),
    listReviewsByRestaurant: jest.fn(),
    upsertReview: jest.fn(),
    listWishlistByUser: jest.fn(),
    addWishlistItem: jest.fn(),
    removeWishlistItem: jest.fn(),
    listVisitedByUser: jest.fn(),
    addVisitedItem: jest.fn(),
    removeVisitedItem: jest.fn(),
    getUserCollections: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    searchUsers: jest.fn(),
    listFeed: jest.fn(),
    ensureRestaurantExists: jest.fn(),
    ensureUserExists: jest.fn(),
  }
}

function loadServer() {
  jest.resetModules()

  const db = {
    checkConnection: jest.fn().mockResolvedValue(undefined),
  }
  const repositories = createMockRepositories()

  jest.doMock('../../src/db', () => db)
  jest.doMock('../../src/repositories', () => repositories)

  const app = require('../../src/server')
  const { signAccessToken } = require('../../src/middleware/auth')

  return {
    app,
    request: supertest(app),
    db,
    repositories,
    signAccessToken,
  }
}

describe('saúde e erros do servidor', () => {
  test('GET /health retorna ok quando o banco responde', async () => {
    const { request, db } = loadServer()

    await request.get('/health').expect(200, { ok: true, service: 'backend' })
    expect(db.checkConnection).toHaveBeenCalledTimes(1)
  })

  test('GET /health retorna indisponível quando a verificação do banco falha', async () => {
    const { request, db } = loadServer()
    db.checkConnection.mockRejectedValueOnce(new Error('db offline'))

    await request.get('/health').expect(503, { ok: false, error: 'db offline' })
  })

  test('rotas desconhecidas retornam 404 em JSON', async () => {
    const { request } = loadServer()

    await request.get('/api/nao-existe').expect(404, { message: 'Rota não encontrada.' })
  })

  test('erros de cast do Postgres retornam requisição inválida', async () => {
    const { request, repositories } = loadServer()
    repositories.getRestaurantById.mockRejectedValueOnce({ code: '22P02' })

    await request.get('/api/restaurants/not-a-valid-id').expect(400, {
      message: 'Parâmetros inválidos para esta operação.',
    })
  })
})

describe('rotas de autenticação do servidor', () => {
  test('register valida campos obrigatórios e formatados', async () => {
    const { request } = loadServer()

    await request.post('/api/auth/register').send({}).expect(400)
    await request.post('/api/auth/register').send({
      name: 'Ana',
      email: 'email-invalido',
      username: 'ana',
      password: 'senha123',
    }).expect(400, { message: 'Digite um e-mail válido.' })
    await request.post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'an',
      password: 'senha123',
    }).expect(400, { message: 'O username precisa ter ao menos 3 caracteres.' })
    await request.post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'ana',
      password: '123',
    }).expect(400, { message: 'A senha precisa ter ao menos 6 caracteres.' })
  })

  test('register normaliza campos, cria usuário e retorna sessão', async () => {
    const { request, repositories } = loadServer()
    const user = { id: 'u_1', name: 'Ana', email: 'ana@garfada.test', username: 'ana' }
    repositories.createUser.mockResolvedValueOnce(user)

    const response = await request.post('/api/auth/register').send({
      name: ' Ana ',
      email: ' ana@garfada.test ',
      username: ' ana ',
      password: ' senha123 ',
    }).expect(201)

    expect(response.body.user).toEqual(user)
    expect(response.body.token).toEqual(expect.any(String))
    expect(repositories.createUser).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'ana',
      passwordHash: expect.stringMatching(/^pbkdf2_sha256\$/),
      avatarUrl: 'https://i.pravatar.cc/160?u=ana',
    }))
  })

  test('login valida credenciais e retorna sessão para senha válida', async () => {
    const { request, repositories } = loadServer()
    const passwordHash = hashPassword('senha123')
    const user = { id: 'u_1', name: 'Ana', username: 'ana' }
    repositories.findUserForAuthByIdentifier.mockResolvedValueOnce({ id: 'u_1', passwordHash })
    repositories.getAuthUserById.mockResolvedValueOnce(user)

    const response = await request.post('/api/auth/login').send({
      identifier: ' ana ',
      password: ' senha123 ',
    }).expect(200)

    expect(response.body.user).toEqual(user)
    expect(response.body.token).toEqual(expect.any(String))
    expect(repositories.findUserForAuthByIdentifier).toHaveBeenCalledWith('ana')
  })

  test('login rejeita credenciais ausentes ou inválidas', async () => {
    const { request, repositories } = loadServer()

    await request.post('/api/auth/login').send({}).expect(400)

    repositories.findUserForAuthByIdentifier.mockResolvedValueOnce(null)
    await request.post('/api/auth/login').send({
      identifier: 'ana',
      password: 'senha123',
    }).expect(401, { message: 'Credenciais inválidas. Confira e tente novamente.' })
  })

  test('GET /api/auth/me exige autenticação e retorna usuário autenticado', async () => {
    const { request, repositories, signAccessToken } = loadServer()
    repositories.getAuthUserById.mockResolvedValueOnce({ id: 'u_1', name: 'Ana' })

    await request.get('/api/auth/me').expect(401)

    await request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${signAccessToken('u_1')}`)
      .expect(200, { id: 'u_1', name: 'Ana' })
  })
})

describe('rotas de restaurantes e coleções do servidor', () => {
  test('lista restaurantes e retorna 404 para detalhe inexistente', async () => {
    const { request, repositories } = loadServer()
    repositories.listRestaurants.mockResolvedValueOnce([{ id: 'r_1' }])
    repositories.getRestaurantById.mockResolvedValueOnce(null)

    await request.get('/api/restaurants?search=pizza').expect(200, [{ id: 'r_1' }])
    expect(repositories.listRestaurants).toHaveBeenCalledWith(expect.objectContaining({ search: 'pizza' }))

    await request.get('/api/restaurants/r_missing').expect(404, {
      message: 'Restaurante não encontrado.',
    })
  })

  test('cria reviews apenas com notas válidas', async () => {
    const { request, repositories, signAccessToken } = loadServer()
    repositories.upsertReview.mockResolvedValueOnce({ id: 'rev_1', rating: 4 })
    const auth = `Bearer ${signAccessToken('u_1')}`

    await request.post('/api/restaurants/r_1/reviews').set('Authorization', auth).send({ rating: 6 }).expect(400, {
      message: 'A nota deve estar entre 1 e 5 estrelas.',
    })

    await request.post('/api/restaurants/r_1/reviews').set('Authorization', auth).send({
      rating: 4,
      comment: ' Muito bom ',
    }).expect(201, { id: 'rev_1', rating: 4 })

    expect(repositories.upsertReview).toHaveBeenCalledWith({
      userId: 'u_1',
      restaurantId: 'r_1',
      rating: 4,
      comment: 'Muito bom',
    })
  })

  test('busca reviews depois de verificar existência do restaurante', async () => {
    const { request, repositories } = loadServer()
    repositories.ensureRestaurantExists.mockResolvedValueOnce(undefined)
    repositories.listReviewsByRestaurant.mockResolvedValueOnce([{ id: 'rev_1' }])

    await request.get('/api/restaurants/r_1/reviews').expect(200, [{ id: 'rev_1' }])

    expect(repositories.ensureRestaurantExists).toHaveBeenCalledWith('r_1')
    expect(repositories.listReviewsByRestaurant).toHaveBeenCalledWith('r_1')
  })

  test('alterna wishlist e visitados para usuários autenticados', async () => {
    const { request, repositories, signAccessToken } = loadServer()
    const auth = `Bearer ${signAccessToken('u_1')}`
    repositories.addWishlistItem.mockResolvedValueOnce({ restaurantId: 'r_1' })
    repositories.removeWishlistItem.mockResolvedValueOnce(true)
    repositories.addVisitedItem.mockResolvedValueOnce({ restaurantId: 'r_1', userRating: null })
    repositories.removeVisitedItem.mockResolvedValueOnce(true)

    await request.post('/api/restaurants/r_1/wishlist').set('Authorization', auth).expect(201, {
      active: true,
      item: { restaurantId: 'r_1' },
    })
    await request.delete('/api/restaurants/r_1/wishlist').set('Authorization', auth).expect(200, { active: false })

    await request.post('/api/restaurants/r_1/visited').set('Authorization', auth).send({ userRating: '' }).expect(201, {
      active: true,
      item: { restaurantId: 'r_1', userRating: null },
    })
    await request.post('/api/restaurants/r_1/visited').set('Authorization', auth).send({ userRating: 0 }).expect(400, {
      message: 'A nota da visita deve estar entre 1 e 5.',
    })
    await request.delete('/api/restaurants/r_1/visited').set('Authorization', auth).expect(200, { active: false })

    expect(repositories.addVisitedItem).toHaveBeenCalledWith('u_1', 'r_1', null)
  })
})

describe('rotas de perfil e social do servidor', () => {
  test('atualiza perfil após sanitizar campos permitidos', async () => {
    const { request, repositories, signAccessToken } = loadServer()
    const auth = `Bearer ${signAccessToken('u_1')}`
    repositories.updateMeProfile.mockResolvedValueOnce({ id: 'u_1', name: 'Ana' })

    await request.put('/api/me').set('Authorization', auth).send({
      name: ' Ana ',
      username: ' ana ',
      bio: ' bio ',
      avatarUrl: ' avatar.png ',
      favoriteCuisines: ['Italiana'],
      ignored: true,
    }).expect(200, { id: 'u_1', name: 'Ana' })

    expect(repositories.updateMeProfile).toHaveBeenCalledWith('u_1', {
      name: 'Ana',
      username: 'ana',
      bio: 'bio',
      avatarUrl: 'avatar.png',
      favoriteCuisines: ['Italiana'],
    })
  })

  test('atualização de perfil rejeita payloads inválidos', async () => {
    const { request, signAccessToken } = loadServer()
    const auth = `Bearer ${signAccessToken('u_1')}`

    await request.put('/api/me').set('Authorization', auth).send({ name: ' ' }).expect(400, {
      message: 'Informe um nome válido.',
    })
    await request.put('/api/me').set('Authorization', auth).send({ username: 'ab' }).expect(400, {
      message: 'O username precisa ter ao menos 3 caracteres.',
    })
    await request.put('/api/me').set('Authorization', auth).send({ favoriteCuisines: 'Italiana' }).expect(400, {
      message: 'favoriteCuisines deve ser uma lista de textos.',
    })
  })

  test('serve perfil autenticado, coleções, feed e endpoints sociais', async () => {
    const { request, repositories, signAccessToken } = loadServer()
    const auth = `Bearer ${signAccessToken('u_1')}`
    repositories.getMeProfile.mockResolvedValueOnce({ id: 'u_1' })
    repositories.getUserCollections.mockResolvedValueOnce({ reviews: [], wishlist: [], visited: [] })
    repositories.listFeed.mockResolvedValueOnce([{ id: 'feed_1' }])
    repositories.searchUsers.mockResolvedValueOnce([{ id: 'u_2' }])
    repositories.followUser.mockResolvedValueOnce({ isFollowing: true, followersCount: 1 })
    repositories.unfollowUser.mockResolvedValueOnce({ isFollowing: false, followersCount: 0 })
    repositories.getUserProfileById.mockResolvedValueOnce({ id: 'u_2', isFollowing: false })

    await request.get('/api/me').set('Authorization', auth).expect(200, { id: 'u_1' })
    await request.get('/api/me/collections').set('Authorization', auth).expect(200, { reviews: [], wishlist: [], visited: [] })
    await request.get('/api/feed').set('Authorization', auth).expect(200, [{ id: 'feed_1' }])
    await request.get('/api/users/search?q=ana').set('Authorization', auth).expect(200, [{ id: 'u_2' }])
    await request.post('/api/users/u_2/follow').set('Authorization', auth).expect(201, { isFollowing: true, followersCount: 1 })
    await request.delete('/api/users/u_2/follow').set('Authorization', auth).expect(200, { isFollowing: false, followersCount: 0 })
    await request.get('/api/users/u_2').set('Authorization', auth).expect(200, { id: 'u_2', isFollowing: false })
  })
})
