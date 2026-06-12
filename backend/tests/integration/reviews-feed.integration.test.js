const { authHeader, registerUser, request } = require('../helpers/apiTestUtils')

describe('Reviews and feed API integration', () => {
  test('cria review, lista no restaurante, atualiza estatisticas e publica no feed', async () => {
    const session = await registerUser()

    const createResponse = await request
      .post('/api/restaurants/r1/reviews')
      .set(authHeader(session.token))
      .send({
        rating: 5,
        comment: 'Teste de integracao delicioso.',
      })
      .expect(201)

    expect(createResponse.body).toMatchObject({
      restaurantId: 'r1',
      userId: session.user.id,
      rating: 5,
      comment: 'Teste de integracao delicioso.',
    })

    const reviewsResponse = await request
      .get('/api/restaurants/r1/reviews')
      .expect(200)

    expect(reviewsResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createResponse.body.id,
          userId: session.user.id,
          user: expect.objectContaining({
            id: session.user.id,
            username: session.credentials.username,
          }),
        }),
      ]),
    )

    const restaurantResponse = await request.get('/api/restaurants/r1').expect(200)

    expect(restaurantResponse.body.stats.reviewsCount).toBe(3)
    expect(restaurantResponse.body.stats.commentsCount).toBe(3)
    expect(restaurantResponse.body.stats.averageRating).toBe(4.7)

    const feedResponse = await request
      .get('/api/feed')
      .set(authHeader(session.token))
      .expect(200)

    expect(feedResponse.body[0]).toEqual(
      expect.objectContaining({
        type: 'review',
        userId: session.user.id,
        restaurantId: 'r1',
        reviewId: createResponse.body.id,
        user: expect.objectContaining({
          username: session.credentials.username,
        }),
        review: expect.objectContaining({
          comment: 'Teste de integracao delicioso.',
          rating: 5,
        }),
      }),
    )
  })

  test('rejeita nota de review fora do intervalo permitido', async () => {
    const session = await registerUser()

    await request
      .post('/api/restaurants/r1/reviews')
      .set(authHeader(session.token))
      .send({ rating: 6, comment: 'Nota invalida' })
      .expect(400)
  })
})
