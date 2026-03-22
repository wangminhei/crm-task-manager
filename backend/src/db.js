const { Pool } = require('pg')
require('dotenv').config()

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var: DATABASE_URL')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes('neon.tech') ||
    process.env.DATABASE_URL?.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : false,
})

pool.on('connect', () => {
  console.log('✅ Kết nối PostgreSQL thành công')
})

pool.on('error', (err) => {
  console.error('❌ Lỗi PostgreSQL pool:', err.message)
})

module.exports = pool
