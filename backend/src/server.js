require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const pool    = require('./db')

const authRoutes       = require('./routes/auth.routes')
const taskRoutes       = require('./routes/task.routes')
const employeeRoutes   = require('./routes/employee.routes')
const customerRoutes   = require('./routes/customer.routes')
const statsRoutes      = require('./routes/stats.routes')
const rescheduleRoutes = require('./routes/reschedule.routes')

const { authenticate } = require('./middleware/auth.middleware')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

app.get('/', (_req, res) => res.json({ status: 'ok', message: '🚀 CRM API đang chạy' }))
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

app.use('/api/auth',      authRoutes)
app.use('/api/tasks',     authenticate, taskRoutes)
app.use('/api/tasks',     authenticate, rescheduleRoutes)
app.use('/api/employees', authenticate, employeeRoutes)
app.use('/api/customers', authenticate, customerRoutes)
app.use('/api/stats',     authenticate, statsRoutes)

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} không tồn tại` })
})

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Lỗi server không xác định' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`)
})
