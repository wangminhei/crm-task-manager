const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/auth.controller')
const { authenticate } = require('../middleware/auth.middleware')

// POST /api/auth/login
router.post('/login', controller.login)

// GET  /api/auth/me
router.get('/me', authenticate, controller.me)

// POST /api/auth/change-password
router.post('/change-password', authenticate, controller.changePassword)

module.exports = router
