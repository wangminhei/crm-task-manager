const express = require('express')
const router = express.Router()

const taskController = require('../controllers/task.controller')

/**
 * 📌 GET /tasks
 * Lấy danh sách task
 */
router.get('/', taskController.getTasks)

/**
 * 📌 POST /tasks
 * Tạo task mới
 */
router.post('/', taskController.createTask)

/**
 * 📌 PUT /tasks/:id
 * Update trạng thái task
 */
router.put('/:id', taskController.updateTaskStatus)

/**
 * 📌 DELETE /tasks/:id
 * Xóa task
 */
router.delete('/:id', taskController.deleteTask)

module.exports = router

router.put('/tasks/:id', updateTask)
