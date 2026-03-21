const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/customer.controller')

// GET    /api/customers
router.get('/',      controller.getAll)

// GET    /api/customers/:id
router.get('/:id',   controller.getOne)

// POST   /api/customers
router.post('/',     controller.create)

// PUT    /api/customers/:id
router.put('/:id',   controller.update)

// DELETE /api/customers/:id
router.delete('/:id', controller.remove)

module.exports = router
