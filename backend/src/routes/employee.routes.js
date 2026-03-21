const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/employee.controller')

// GET    /api/employees
router.get('/',      controller.getAll)

// GET    /api/employees/:id
router.get('/:id',   controller.getOne)

// POST   /api/employees
router.post('/',     controller.create)

// PUT    /api/employees/:id
router.put('/:id',   controller.update)

// DELETE /api/employees/:id
router.delete('/:id', controller.remove)

module.exports = router
