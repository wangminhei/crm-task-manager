const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/reschedule.controller')

// POST /api/tasks/:id/reschedule — admin + tech đều dùng được
router.post('/:id/reschedule', controller.reschedule)

module.exports = router
