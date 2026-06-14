const { AppError } = require('../../src/errors')

function loadRepositories() {
  jest.resetModules()

  const db = {
    query: jest.fn(),
    transaction: jest.fn(),
  }

  jest.doMock('../../src/db', () => db)
  jest.doMock('../../src/utils/ids', () => ({
    createId: jest.fn((prefix) => `${prefix}_fixed`),
  }))

  return {
    repositories: require('../../src/repositories'),
    db,
  }
}

describe('proteções de entidade dos repositórios', () => {
  test('ensureRestaurantExists é resolvida quando o restaurante existe', async () => {
    const { repositories } = loadRepositories()
    const executor = { query: jest.fn().mockResolvedValue({ rowCount: 1 }) }

    await expect(repositories.ensureRestaurantExists('r_1', executor)).resolves.toBeUndefined()

    expect(executor.query).toHaveBeenCalledWith(expect.stringContaining('FROM restaurants'), ['r_1'])
  })

  test('ensureRestaurantExists lança 404 quando o restaurante não existe', async () => {
    const { repositories } = loadRepositories()
    const executor = { query: jest.fn().mockResolvedValue({ rowCount: 0 }) }

    await expect(repositories.ensureRestaurantExists('r_missing', executor)).rejects.toMatchObject({
      message: 'Restaurante não encontrado.',
      statusCode: 404,
    })
  })

  test('ensureUserExists lança 404 quando o usuário não existe', async () => {
    const { repositories } = loadRepositories()
    const executor = { query: jest.fn().mockResolvedValue({ rowCount: 0 }) }

    await expect(repositories.ensureUserExists('u_missing', executor)).rejects.toMatchObject({
      message: 'Usuário não encontrado.',
      statusCode: 404,
    })
  })
})

describe('leituras dos repositórios', () => {
  test('findUserForAuthByIdentifier retorna a primeira linha de autenticação ou null', async () => {
    const { repositories } = loadRepositories()
    const user = { id: 'u_1', email: 'ana@garfada.test' }
    const executor = { query: jest.fn().mockResolvedValueOnce({ rows: [user] }) }

    await expect(repositories.findUserForAuthByIdentifier('Ana', executor)).resolves.toBe(user)

    executor.query.mockResolvedValueOnce({ rows: [] })
    await expect(repositories.findUserForAuthByIdentifier('Ninguem', executor)).resolves.toBeNull()
  })

  test('listRestaurants monta filtros parametrizados e mapeia linhas JSON de restaurante', async () => {
    const { repositories } = loadRepositories()
    const restaurants = [{ id: 'r_1', name: 'Pizza Boa' }]
    const executor = {
      query: jest.fn().mockResolvedValue({
        rows: restaurants.map((restaurant) => ({ restaurant })),
      }),
    }

    await expect(repositories.listRestaurants({
      search: ' Pizza ',
      location: ' Savassi ',
      cuisine: 'Italiana',
      priceRange: '$$',
      minRating: '4',
    }, executor)).resolves.toEqual(restaurants)

    const [sql, values] = executor.query.mock.calls[0]
    expect(sql).toContain('LOWER(r.name) LIKE $1')
    expect(sql).toContain('LOWER(r.address) LIKE $4')
    expect(sql).toContain('c.name = $5')
    expect(sql).toContain('r.price_range = $6')
    expect(sql).toContain('COALESCE(vrs.average_rating, 0) >= $7')
    expect(values).toEqual(['%pizza%', '%pizza%', '%pizza%', '%savassi%', 'Italiana', '$$', 4])
  })

  test('getRestaurantById retorna JSON do restaurante ou null', async () => {
    const { repositories } = loadRepositories()
    const restaurant = { id: 'r_1' }
    const executor = { query: jest.fn().mockResolvedValueOnce({ rows: [{ restaurant }] }) }

    await expect(repositories.getRestaurantById('r_1', executor)).resolves.toBe(restaurant)

    executor.query.mockResolvedValueOnce({ rows: [] })
    await expect(repositories.getRestaurantById('r_missing', executor)).resolves.toBeNull()
  })

  test('remoção de itens de coleção informa se uma linha foi apagada', async () => {
    const { repositories } = loadRepositories()
    const executor = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 0 }),
    }

    await expect(repositories.removeWishlistItem('u_1', 'r_1', executor)).resolves.toBe(true)
    await expect(repositories.removeVisitedItem('u_1', 'r_1', executor)).resolves.toBe(false)
  })

  test('searchUsers normaliza a busca e exclui o visualizador', async () => {
    const { repositories } = loadRepositories()
    const rows = [{ id: 'u_2', isFollowing: true }]
    const executor = { query: jest.fn().mockResolvedValue({ rows }) }

    await expect(repositories.searchUsers('u_1', ' Ana ', executor)).resolves.toBe(rows)

    expect(executor.query).toHaveBeenCalledWith(expect.stringContaining('WHERE u.id <> $1'), [
      'u_1',
      'ana',
      '%ana%',
    ])
  })

  test('getUserCollections agrega reviews, wishlist e visitados de um usuário existente', async () => {
    const { repositories } = loadRepositories()
    const executor = {
      query: jest.fn(async (sql) => {
        if (sql.includes('SELECT 1') && sql.includes('FROM users')) {
          return { rowCount: 1 }
        }

        if (sql.includes('FROM reviews rv') && sql.includes('WHERE rv.user_id = $1')) {
          return { rows: [{ id: 'rev_1' }] }
        }

        if (sql.includes('FROM wishlist_items')) {
          return { rows: [{ restaurantId: 'r_wish' }] }
        }

        if (sql.includes('FROM visited_restaurants')) {
          return { rows: [{ restaurantId: 'r_visit' }] }
        }

        throw new Error(`Unexpected query: ${sql}`)
      }),
    }

    await expect(repositories.getUserCollections('u_1', executor)).resolves.toEqual({
      reviews: [{ id: 'rev_1' }],
      wishlist: [{ restaurantId: 'r_wish' }],
      visited: [{ restaurantId: 'r_visit' }],
    })
  })
})

describe('escritas dos repositórios', () => {
  test('createUser insere um usuário em transação e retorna o contrato de autenticação', async () => {
    const { repositories, db } = loadRepositories()
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ id: 'u_fixed', name: 'Ana' }] }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.createUser({
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'ana',
      passwordHash: 'hash',
      avatarUrl: 'avatar.png',
      bio: 'bio',
    })).resolves.toEqual({ id: 'u_fixed', name: 'Ana' })

    expect(client.query).toHaveBeenNthCalledWith(1, expect.stringContaining('INSERT INTO users'), [
      'u_fixed',
      'Ana',
      'ana@garfada.test',
      'ana',
      'hash',
      'avatar.png',
      'bio',
    ])
  })

  test('createUser traduz violações de unicidade em conflitos amigáveis', async () => {
    const { repositories, db } = loadRepositories()
    const client = {
      query: jest.fn().mockRejectedValue({
        code: '23505',
        constraint: 'users_username_key',
      }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.createUser({
      name: 'Ana',
      email: 'ana@garfada.test',
      username: 'ana',
      passwordHash: 'hash',
    })).rejects.toMatchObject({
      message: 'Esse username já foi escolhido por outra pessoa.',
      statusCode: 409,
    })
  })

  test('updateMeProfile atualiza campos enviados e sincroniza cozinhas favoritas', async () => {
    const { repositories, db } = loadRepositories()
    const profile = { id: 'u_1', name: 'Ana' }
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ name_key: 'italiana' }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [profile] }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.updateMeProfile('u_1', {
      name: 'Ana',
      favoriteCuisines: [' Italiana ', 'Japonesa', 'ITALIANA', '', 123],
    })).resolves.toBe(profile)

    expect(client.query).toHaveBeenNthCalledWith(1, expect.stringContaining('UPDATE users'), ['Ana', 'u_1'])
    expect(client.query).toHaveBeenNthCalledWith(4, expect.stringContaining('INSERT INTO cuisines'), ['Japonesa'])
    expect(client.query).toHaveBeenNthCalledWith(6, expect.stringContaining('INSERT INTO user_favorite_cuisines'), ['u_1', [1, 2]])
  })

  test('updateMeProfile verifica existência quando campos relacionais são omitidos', async () => {
    const { repositories, db } = loadRepositories()
    const client = { query: jest.fn().mockResolvedValueOnce({ rowCount: 0 }) }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.updateMeProfile('u_missing', {})).rejects.toMatchObject({
      message: 'Usuário não encontrado.',
      statusCode: 404,
    })
  })

  test('upsertReview verifica restaurante, faz upsert e cria evento de feed', async () => {
    const { repositories, db } = loadRepositories()
    const review = { id: 'rev_saved', restaurantId: 'r_1', userId: 'u_1', rating: 4, comment: 'Bom' }
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rows: [review] })
        .mockResolvedValueOnce({ rowCount: 1 }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.upsertReview({
      userId: 'u_1',
      restaurantId: 'r_1',
      rating: 4,
      comment: 'Bom',
    })).resolves.toBe(review)

    expect(client.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO reviews'), [
      'rev_fixed',
      'r_1',
      'u_1',
      4,
      'Bom',
    ])
    expect(client.query).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO feed_events'), [
      'feed_fixed',
      'review',
      'u_1',
      null,
      'r_1',
      'rev_saved',
    ])
  })

  test('addWishlistItem retorna conflito quando o item já existe', async () => {
    const { repositories, db } = loadRepositories()
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockRejectedValueOnce({ code: '23505' }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.addWishlistItem('u_1', 'r_1')).rejects.toMatchObject({
      message: 'Restaurante já está na sua lista de desejos.',
      statusCode: 409,
    })
  })

  test('addVisitedItem insere a visita e cria evento de feed', async () => {
    const { repositories, db } = loadRepositories()
    const item = { userId: 'u_1', restaurantId: 'r_1', userRating: 5 }
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rows: [item] })
        .mockResolvedValueOnce({ rowCount: 1 }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.addVisitedItem('u_1', 'r_1', 5)).resolves.toBe(item)

    expect(client.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO visited_restaurants'), [
      'u_1',
      'r_1',
      5,
    ])
    expect(client.query).toHaveBeenNthCalledWith(3, expect.stringContaining('INSERT INTO feed_events'), [
      'feed_fixed',
      'visited',
      'u_1',
      null,
      'r_1',
      null,
    ])
  })
})

describe('fluxos sociais dos repositórios', () => {
  test('followUser rejeita seguir o próprio perfil antes de abrir transação', async () => {
    const { repositories, db } = loadRepositories()

    await expect(repositories.followUser('u_1', 'u_1')).rejects.toMatchObject({
      message: 'Você não pode seguir o próprio perfil.',
      statusCode: 400,
    })
    expect(db.transaction).not.toHaveBeenCalled()
  })

  test('followUser insere relação, evento de feed e retorna contagem de seguidores', async () => {
    const { repositories, db } = loadRepositories()
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ followersCount: 7 }] }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.followUser('u_1', 'u_2')).resolves.toEqual({
      isFollowing: true,
      followersCount: 7,
    })
  })

  test('followUser traduz relações duplicadas em conflitos', async () => {
    const { repositories, db } = loadRepositories()
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockRejectedValueOnce({ code: '23505' }),
    }
    db.transaction.mockImplementation((handler) => handler(client))

    await expect(repositories.followUser('u_1', 'u_2')).rejects.toMatchObject({
      message: 'Você já está seguindo este usuário.',
      statusCode: 409,
    })
  })

  test('unfollowUser apaga relação e retorna a contagem atualizada', async () => {
    const { repositories, db } = loadRepositories()
    db.query
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ followersCount: 3 }] })

    await expect(repositories.unfollowUser('u_1', 'u_2')).resolves.toEqual({
      isFollowing: false,
      followersCount: 3,
    })

    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('DELETE FROM user_follows'), ['u_1', 'u_2'])
  })

  test('listFeed retorna linhas de eventos do feed pelo executor', async () => {
    const { repositories } = loadRepositories()
    const rows = [{ id: 'feed_1', type: 'review' }]
    const executor = { query: jest.fn().mockResolvedValue({ rows }) }

    await expect(repositories.listFeed(executor)).resolves.toBe(rows)
    expect(executor.query).toHaveBeenCalledWith(expect.stringContaining('FROM feed_events fe'))
  })
})
