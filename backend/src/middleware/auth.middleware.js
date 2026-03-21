const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_key_2026'

// Xác thực token
exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Chỉ admin mới được dùng
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ admin mới có quyền thực hiện thao tác này' })
  }
  next()
}
