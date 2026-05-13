const { Pool } = require('pg')

// Configuracao padrao para desenvolvimento local; variaveis de ambiente
// permitem trocar host, banco e credenciais no Docker ou em producao.
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
  // DATABASE_URL tem prioridade quando a infraestrutura fornece a string completa.
  poolConfig.connectionString = process.env.DATABASE_URL
}

if (process.env.NODE_ENV === 'production' && process.env.PGSSLMODE === 'require') {
  // Alguns provedores exigem SSL para conexao com Postgres em producao.
  poolConfig.ssl = { rejectUnauthorized: false }
}

const pool = new Pool(poolConfig)

async function query(text, params = []) {
  return pool.query(text, params)
}

async function checkConnection() {
  await query('SELECT 1')
}

// Executa operacoes atomicas: commit quando tudo da certo, rollback em erro.
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
