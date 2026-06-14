const { authHeader, registerUser, request } = require('../helpers/apiTestUtils')

describe('Integração da API de autenticação', () => {
  test('cadastro persiste usuário, retorna token e permite login', async () => {
    const session = await registerUser({
      name: 'Maria Integracao',
      email: 'maria.integracao@garfada.test',
      username: 'mariaintegracao',
    })

    expect(session.token).toEqual(expect.any(String))
    expect(session.user).toMatchObject({
      name: 'Maria Integracao',
      email: 'maria.integracao@garfada.test',
      username: 'mariaintegracao',
      favoriteCuisines: [],
    })
    expect(session.user.passwordHash).toBeUndefined()

    const loginResponse = await request
      .post('/api/auth/login')
      .send({
        identifier: 'mariaintegracao',
        password: 'senha123',
      })
      .expect(200)

    expect(loginResponse.body.token).toEqual(expect.any(String))
    expect(loginResponse.body.user.id).toBe(session.user.id)
  })

  test('GET /api/auth/me exige token bearer válido e retorna usuário autenticado', async () => {
    await request.get('/api/auth/me').expect(401)

    const session = await registerUser()
    const response = await request
      .get('/api/auth/me')
      .set(authHeader(session.token))
      .expect(200)

    expect(response.body).toMatchObject({
      id: session.user.id,
      email: session.credentials.email,
      username: session.credentials.username,
    })
  })

  test('cadastro rejeita email ou username duplicado com conflito', async () => {
    await registerUser({
      email: 'duplicado@garfada.test',
      username: 'duplicado',
    })

    await request
      .post('/api/auth/register')
      .send({
        name: 'Outro Usuario',
        email: 'duplicado@garfada.test',
        username: 'outrodup',
        password: 'senha123',
      })
      .expect(409)

    await request
      .post('/api/auth/register')
      .send({
        name: 'Outro Usuario',
        email: 'outro.duplicado@garfada.test',
        username: 'duplicado',
        password: 'senha123',
      })
      .expect(409)
  })
})
