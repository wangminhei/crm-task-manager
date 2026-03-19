const pool = require('../db')

/**
 * 📌 GET /tasks
 * Lấy danh sách task (kèm user + customer)
 */
exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        u.name AS user_name,
        c.name AS customer_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.id DESC
    `)

    res.json({
      success: true,
      data: result.rows
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách task"
    })
  }
}


/**
 * 📌 POST /tasks
 * Tạo task mới
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, customer_id, assigned_to } = req.body

    if (!title || typeof title !== 'string' || title.trim() === '') {
  return res.status(400).json({
    success: false,
    message: "Title không hợp lệ"
  })
}

    const result = await pool.query(
      `INSERT INTO tasks (title, description, customer_id, assigned_to)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description || '', customer_id || null, assigned_to || null]
    )

    res.json({
      success: true,
      data: result.rows[0]
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Tạo task thất bại"
    })
  }
}


/**
 * 📌 PUT /tasks/:id
 * Update trạng thái task
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatus = ['pending', 'done', 'cancelled']

if (!status || !validStatus.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Status không hợp lệ"
  })
}

    await pool.query(
      `UPDATE tasks SET status = $1 WHERE id = $2`,
      [status, id]
    )

    res.json({
      success: true,
      message: "Cập nhật thành công"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Update thất bại"
    })
  }
}


/**
 * 📌 DELETE /tasks/:id
 * Xóa task
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `DELETE FROM tasks WHERE id = $1`,
      [id]
    )

    res.json({
      success: true,
      message: "Đã xóa task"
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "Xóa thất bại"
    })
  }
}
