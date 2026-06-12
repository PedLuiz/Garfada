const { authHeader, registerUser, request } = require('../helpers/apiTestUtils')

describe('Profile API integration', () => {
  test('atualiza perfil e retorna estatisticas e cozinhas favoritas atualizadas', async () => {
    const session = await registerUser()

    const updateResponse = await request
      .put('/api/me')
      .set(authHeader(session.token))
      .send({
        name: 'Perfil Integracao',
        username: 'perfilintegracao',
        bio: 'Bio atualizada pelo teste.',
        avatarUrl: 'https://example.test/avatar.png',
        favoriteCuisines: ['Italiana', 'Japonesa', 'Italiana', '  Indiana  ', ''],
      })
      .expect(200)

    expect(updateResponse.body).toMatchObject({
      id: session.user.id,
      name: 'Perfil Integracao',
      username: 'perfilintegracao',
      bio: 'Bio atualizada pelo teste.',
      avatarUrl: 'https://example.test/avatar.png',
      reviewsCount: 0,
      visitedCount: 0,
      wishlistCount: 0,
      followersCount: 0,
      followingCount: 0,
    })
    expect(updateResponse.body.favoriteCuisines).toEqual([
      'Indiana',
      'Italiana',
      'Japonesa',
    ])

    const meResponse = await request
      .get('/api/me')
      .set(authHeader(session.token))
      .expect(200)

    expect(meResponse.body.favoriteCuisines).toEqual([
      'Indiana',
      'Italiana',
      'Japonesa',
    ])
  })
})
