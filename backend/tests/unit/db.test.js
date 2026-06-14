function loadDb() {
  jest.resetModules()

  const client = {
    query: jest.fn(),
    release: jest.fn(),
  }
  const pool = {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(client),
  }
  const Pool = jest.fn(() => pool)

  jest.doMock('pg', () => ({ Pool }))

  return {
    db: require('../../src/db'),
    Pool,
    pool,
    client,
  }
}

describe('módulo de banco de dados', () => {
  afterEach(() => {
    jest.dontMock('pg')
  })

  test('cria um pool e delega consultas simples', async () => {
    const { db, Pool, pool } = loadDb()
    pool.query.mockResolvedValue({ rows: [{ ok: true }] })

    await expect(db.query('SELECT $1::int AS value', [1])).resolves.toEqual({ rows: [{ ok: true }] })

    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
    }))
    expect(pool.query).toHaveBeenCalledWith('SELECT $1::int AS value', [1])
  })

  test('verifica conectividade com SELECT 1', async () => {
    const { db, pool } = loadDb()
    pool.query.mockResolvedValue({ rows: [] })

    await db.checkConnection()

    expect(pool.query).toHaveBeenCalledWith('SELECT 1', [])
  })

  test('confirma transações bem-sucedidas e libera o client', async () => {
    const { db, client } = loadDb()
    client.query.mockResolvedValue({})

    const result = await db.transaction(async (transactionClient) => {
      expect(transactionClient).toBe(client)
      await transactionClient.query('INSERT INTO demo VALUES ($1)', [1])
      return 'ok'
    })

    expect(result).toBe('ok')
    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual([
      'BEGIN',
      'INSERT INTO demo VALUES ($1)',
      'COMMIT',
    ])
    expect(client.release).toHaveBeenCalledTimes(1)
  })

  test('desfaz transações com falha e libera o client', async () => {
    const { db, client } = loadDb()
    const error = new Error('boom')
    client.query.mockResolvedValue({})

    await expect(db.transaction(async () => {
      throw error
    })).rejects.toBe(error)

    expect(client.query.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN', 'ROLLBACK'])
    expect(client.release).toHaveBeenCalledTimes(1)
  })
})
