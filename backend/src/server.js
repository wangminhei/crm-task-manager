require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const pool    = require('./db')

// Routes
const taskRoutes     = require('./routes/task.routes')
const employeeRoutes = require('./routes/employee.routes')
const customerRoutes = require('./routes/customer.routes')
const statsRoutes    = require('./routes/stats.routes')

const app  = express()
const PORT = process.env.PORT || 3001

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/tasks',     taskRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/stats',     statsRoutes)

// ─── Health check ─────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: '🚀 CRM API đang chạy' })
})

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} không tồn tại` })
})

// ─── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Lỗi server không xác định' })
})

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
})
