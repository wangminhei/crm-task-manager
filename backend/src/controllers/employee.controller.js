const pool = require('../db')

// ─────────────────────────────────────────────────────────────
// GET /api/employees
// Query params: department, role
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { department, role } = req.query

    const conditions = []
    const values     = []
    let   idx        = 1

    if (department) {
      conditions.push(`e.department ILIKE $${idx++}`)
      values.push(`%${department}%`)
    }
    if (role) {
      conditions.push(`e.role ILIKE $${idx++}`)
      values.push(`%${role}%`)
    }

    const where = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const result = await pool.query(`
      SELECT
        e.*,
        COUNT(t.id)                                        AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')       AS tasks_todo,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS tasks_in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')    AS tasks_pending,
        COUNT(t.id) FILTER (WHERE t.status = 'done')       AS tasks_done
      FROM employees e
      LEFT JOIN tasks t ON t.employee_id = e.id
      ${where}
      GROUP BY e.id
      ORDER BY e.name ASC
    `, values)

    res.json(result.rows)
  } catch (err) {
    console.error('[employee.getAll]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách nhân viên' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/employees/:id
// ─────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params

    // Thông tin nhân viên
    const empResult = await pool.query(`
      SELECT
        e.*,
        COUNT(t.id)                                         AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')        AS tasks_todo,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS tasks_in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')     AS tasks_pending,
        COUNT(t.id) FILTER (WHERE t.status = 'done')        AS tasks_done
      FROM employees e
      LEFT JOIN tasks t ON t.employee_id = e.id
      WHERE e.id = $1
      GROUP BY e.id
    `, [id])

    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
    }

    // Danh sách tasks của nhân viên này
    const taskResult = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.due_date,
        c.name AS customer_name
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.employee_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `, [id])

    res.json({
      ...empResult.rows[0],
      recent_tasks: taskResult.rows,
    })
  } catch (err) {
    console.error('[employee.getOne]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy nhân viên' })
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/employees
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { name, email, role, department } = req.body

    // Validate
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Tên nhân viên là bắt buộc' })
    }
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email nhân viên là bắt buộc' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Email không đúng định dạng' })
    }

    const result = await pool.query(`
      INSERT INTO employees (name, email, role, department)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      name.trim(),
      email.trim().toLowerCase(),
      role?.trim()       || null,
      department?.trim() || null,
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email nhân viên đã tồn tại' })
    }
    console.error('[employee.create]', err)
    res.status(500).json({ error: 'Lỗi server khi tạo nhân viên' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/employees/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id }                          = req.params
    const { name, email, role, department } = req.body

    // Kiểm tra tồn tại
    const existing = await pool.query('SELECT id FROM employees WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
    }

    // Validate email nếu có truyền lên
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Email không đúng định dạng' })
      }
    }

    const result = await pool.query(`
      UPDATE employees SET
        name       = COALESCE($1, name),
        email      = COALESCE($2, email),
        role       = COALESCE($3, role),
        department = COALESCE($4, department),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [
      name?.trim()       || null,
      email?.trim().toLowerCase() || null,
      role?.trim()       || null,
      department?.trim() || null,
      id,
    ])

    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email nhân viên đã tồn tại' })
    }
    console.error('[employee.update]', err)
    res.status(500).json({ error: 'Lỗi server khi cập nhật nhân viên' })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/employees/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    // Kiểm tra còn task đang gán không
    const taskCheck = await pool.query(`
      SELECT COUNT(*) FROM tasks
      WHERE employee_id = $1
        AND status NOT IN ('done')
    `, [id])

    if (parseInt(taskCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Nhân viên này còn task chưa hoàn thành. Hãy chuyển task trước khi xóa.',
      })
    }

    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nhân viên' })
    }

    res.json({ message: 'Xóa nhân viên thành công', employee: result.rows[0] })
  } catch (err) {
    console.error('[employee.remove]', err)
    res.status(500).json({ error: 'Lỗi server khi xóa nhân viên' })
  }
}
