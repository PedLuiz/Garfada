const { request } = require('../helpers/apiTestUtils')

describe('Restaurants API integration', () => {
  test('lista restaurantes agregados com fotos, menu e estatisticas', async () => {
    const response = await request.get('/api/restaurants').expect(200)

    expect(response.body).toHaveLength(8)
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        cuisine: expect.any(String),
        priceRange: expect.any(String),
        photos: expect.any(Array),
        menuPreview: expect.any(Array),
        stats: expect.objectContaining({
          averageRating: expect.any(Number),
          reviewsCount: expect.any(Number),
          commentsCount: expect.any(Number),
          visitsCount: expect.any(Number),
        }),
      }),
    )
  })

  test('filtra por busca, cozinha, faixa de preco e nota minima', async () => {
    const response = await request
      .get('/api/restaurants')
      .query({
        search: 'sakura',
        cuisine: 'Japonesa',
        priceRange: '$$$',
        minRating: '4.7',
      })
      .expect(200)

    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toMatchObject({
      id: 'r2',
      name: 'Sakura Izakaya',
      cuisine: 'Japonesa',
      priceRange: '$$$',
    })
    expect(response.body[0].stats.averageRating).toBeGreaterThanOrEqual(4.7)
  })

  test('retorna 404 para restaurante inexistente', async () => {
    await request.get('/api/restaurants/restaurante-inexistente').expect(404)
  })
})
