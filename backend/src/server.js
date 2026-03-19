require('dotenv').config()

const express = require('express')
const cors = require('cors')

const taskRoutes = require('./routes/task.routes')

const app = express()

/* ================= MIDDLEWARE ================= */

// Cho phép gọi API từ frontend
app.use(cors())

// Đọc JSON
app.use(express.json())

/* ================= ROUTES ================= */

// Test server
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CRM Backend Running'
  })
})

// Task API
app.use('/tasks', taskRoutes)

/* ================= ERROR HANDLER ================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API không tồn tại'
  })
})

// Error chung
app.use((err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    success: false,
    message: 'Lỗi server'
  })
})

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🔥 Server chạy tại: http://localhost:${PORT}`)
})

app.get('/health', async (req, res) => {
  try {
    await require('./db').query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ status: 'error' })
  }
})
