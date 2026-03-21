const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/task.controller')

// GET    /api/tasks
router.get('/',     controller.getAll)

// GET    /api/tasks/:id
router.get('/:id',  controller.getOne)

// POST   /api/tasks
router.post('/',    controller.create)

// PUT    /api/tasks/:id
router.put('/:id',  controller.update)

// DELETE /api/tasks/:id
router.delete('/:id', controller.remove)

module.exports = router
