const { authHeader, registerUser, request } = require('../helpers/apiTestUtils')

describe('Social API integration', () => {
  test('busca usuarios exclui o proprio usuario', async () => {
    const session = await registerUser({
      name: 'Usuario Busca',
      username: 'usuariobusca',
    })

    const response = await request
      .get('/api/users/search')
      .query({ q: 'usuario' })
      .set(authHeader(session.token))
      .expect(200)

    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: session.user.id }),
      ]),
    )
  })

  test('segue, rejeita duplicidade e deixa de seguir usuario', async () => {
    const follower = await registerUser({ username: 'seguidorint' })
    const followed = await registerUser({ username: 'seguidoint' })

    const followResponse = await request
      .post(`/api/users/${followed.user.id}/follow`)
      .set(authHeader(follower.token))
      .expect(201)

    expect(followResponse.body).toMatchObject({
      isFollowing: true,
      followersCount: 1,
    })

    await request
      .post(`/api/users/${followed.user.id}/follow`)
      .set(authHeader(follower.token))
      .expect(409)

    const profileResponse = await request
      .get(`/api/users/${followed.user.id}`)
      .set(authHeader(follower.token))
      .expect(200)

    expect(profileResponse.body).toMatchObject({
      id: followed.user.id,
      isFollowing: true,
      followersCount: 1,
    })

    const unfollowResponse = await request
      .delete(`/api/users/${followed.user.id}/follow`)
      .set(authHeader(follower.token))
      .expect(200)

    expect(unfollowResponse.body).toMatchObject({
      isFollowing: false,
      followersCount: 0,
    })
  })

  test('rejeita auto-follow', async () => {
    const session = await registerUser()

    await request
      .post(`/api/users/${session.user.id}/follow`)
      .set(authHeader(session.token))
      .expect(400)
  })
})
