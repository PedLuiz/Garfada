const { Pool } = require('pg')

const poolConfig = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'garfada',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: Number(process.env.PGPOOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS) || 5000,
}

if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL
}

if (process.env.NODE_ENV === 'production' && process.env.PGSSLMODE === 'require') {
  poolConfig.ssl = { rejectUnauthorized: false }
}

const pool = new Pool(poolConfig)

async function query(text, params = []) {
  return pool.query(text, params)
}

async function checkConnection() {
  await query('SELECT 1')
}

async function transaction(handler) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await handler(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  pool,
  query,
  transaction,
  checkConnection,
}
