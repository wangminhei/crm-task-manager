const { Pool } = require('pg')

// ⚠️ Load biến môi trường
require('dotenv').config()

// Tạo pool kết nối DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Dùng khi deploy (Render / Railway / Supabase)
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
})

// Test kết nối (debug cực hữu ích)
pool.connect()
  .then(() => console.log('✅ Kết nối PostgreSQL thành công'))
  .catch(err => console.error('❌ Lỗi kết nối DB:', err))

module.exports = pool
