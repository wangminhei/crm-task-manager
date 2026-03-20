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
    const {
      title,
      description,
      customer_id,
      assigned_to,
      note,
      schedule_time
    } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Thiếu title' })
    }

    const result = await pool.query(
      `INSERT INTO tasks 
      (title, description, customer_id, assigned_to, note, schedule_time)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        title,
        description || '',
        customer_id || null,
        assigned_to || null,
        note || '',
        schedule_time || null
      ]
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi tạo task' })
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

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { status, schedule_time, assigned_to } = req.body

    await pool.query(
      `UPDATE tasks 
       SET status=$1, schedule_time=$2, assigned_to=$3, updated_at=NOW()
       WHERE id=$4`,
      [status, schedule_time, assigned_to, id]
    )

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Update lỗi' })
  }
}
