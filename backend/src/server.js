require('dotenv').config()

const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
  try {
    await db.checkConnection()
    return res.status(200).json({ ok: true, service: 'backend' })
  } catch (error) {
    return res.status(503).json({ ok: false, error: error.message })
  }
})

app.get('/api/restaurants', async (_req, res) => {
  try {
    const rows = await db.listRestaurants()
    return res.status(200).json(rows)
  } catch (error) {
    return res.status(500).json({
      message: 'Template endpoint error',
      error: error.message,
    })
  }
})

app.listen(port, () => {
  console.log(`Backend running on port ${port}`)
})
