const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/reschedule.controller')
const { authenticate } = require('../middleware/auth.middleware')

// POST /api/tasks/:id/reschedule — admin + tech đều dùng được
router.post('/:id/reschedule', authenticate, controller.reschedule)

module.exports = router
