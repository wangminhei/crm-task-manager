const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const pool   = require('../db')

const JWT_SECRET  = process.env.JWT_SECRET  || 'crm_secret_key_2026'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập username và password' })
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Sai username hoặc password' })
    }

    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ error: 'Sai username hoặc password' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.json({
      token,
      user: {
        id:        user.id,
        username:  user.username,
        role:      user.role,
        full_name: user.full_name,
      },
    })
  } catch (err) {
    console.error('[auth.login]', err)
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' })
  }
}

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, full_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' })
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu mới phải ít nhất 6 ký tự' })
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])
    const user   = result.rows[0]
    const match  = await bcrypt.compare(old_password, user.password)

    if (!match) {
      return res.status(401).json({ error: 'Mật khẩu cũ không đúng' })
    }

    const hashed = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id])

    res.json({ message: 'Đổi mật khẩu thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
}
