const { authHeader, registerUser, request } = require('../helpers/apiTestUtils')

describe('Integração da API de coleções', () => {
  test('adiciona, lista e remove item de wishlist', async () => {
    const session = await registerUser()

    const addResponse = await request
      .post('/api/restaurants/r3/wishlist')
      .set(authHeader(session.token))
      .expect(201)

    expect(addResponse.body).toMatchObject({
      active: true,
      item: {
        userId: session.user.id,
        restaurantId: 'r3',
      },
    })

    const listResponse = await request
      .get('/api/me/wishlist')
      .set(authHeader(session.token))
      .expect(200)

    expect(listResponse.body).toEqual([
      expect.objectContaining({
        userId: session.user.id,
        restaurantId: 'r3',
        restaurant: expect.objectContaining({
          id: 'r3',
          name: 'Forno da Vila',
        }),
      }),
    ])

    await request
      .delete('/api/restaurants/r3/wishlist')
      .set(authHeader(session.token))
      .expect(200)

    const afterDeleteResponse = await request
      .get('/api/me/wishlist')
      .set(authHeader(session.token))
      .expect(200)

    expect(afterDeleteResponse.body).toEqual([])
  })

  test('rejeita item duplicado de wishlist', async () => {
    const session = await registerUser()

    await request
      .post('/api/restaurants/r4/wishlist')
      .set(authHeader(session.token))
      .expect(201)

    await request
      .post('/api/restaurants/r4/wishlist')
      .set(authHeader(session.token))
      .expect(409)
  })

  test('adiciona, lista e remove restaurante visitado', async () => {
    const session = await registerUser()

    await request
      .post('/api/restaurants/r5/visited')
      .set(authHeader(session.token))
      .send({ userRating: 4.5 })
      .expect(201)

    const listResponse = await request
      .get('/api/me/visited')
      .set(authHeader(session.token))
      .expect(200)

    expect(listResponse.body).toEqual([
      expect.objectContaining({
        userId: session.user.id,
        restaurantId: 'r5',
        userRating: 4.5,
        restaurant: expect.objectContaining({
          id: 'r5',
          name: 'Brasa & Pimenta BBQ',
        }),
      }),
    ])

    await request
      .delete('/api/restaurants/r5/visited')
      .set(authHeader(session.token))
      .expect(200)

    const afterDeleteResponse = await request
      .get('/api/me/visited')
      .set(authHeader(session.token))
      .expect(200)

    expect(afterDeleteResponse.body).toEqual([])
  })

  test('rejeita nota de visita fora do intervalo permitido', async () => {
    const session = await registerUser()

    await request
      .post('/api/restaurants/r5/visited')
      .set(authHeader(session.token))
      .send({ userRating: 0 })
      .expect(400)
  })
})
