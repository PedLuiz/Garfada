const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

require('./env')

function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Nome de banco de teste invalido: ${identifier}`)
  }

  return `"${identifier}"`
}

async function ensureTestDatabase() {
  const database = process.env.PGDATABASE
  const maintenancePool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.TEST_PGMAINTENANCE_DATABASE || 'postgres',
  })

  try {
    const result = await maintenancePool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database],
    )

    if (result.rowCount === 0) {
      await maintenancePool.query(`CREATE DATABASE ${quoteIdentifier(database)}`)
    }
  } finally {
    await maintenancePool.end()
  }
}

async function resetSchema() {
  const initSql = fs.readFileSync(
    process.env.TEST_INIT_SQL_PATH || path.resolve(__dirname, '../../../db/init.sql'),
    'utf8',
  )
  const testPool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  })

  try {
    await testPool.query(initSql)
  } finally {
    await testPool.end()
  }
}

module.exports = async () => {
  await ensureTestDatabase()
  await resetSchema()
}
