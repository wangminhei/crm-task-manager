const pool = require('../db')

// ─────────────────────────────────────────────────────────────
// GET /api/tasks
// Query params: status, priority, employee_id, customer_id
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { status, priority, employee_id, customer_id } = req.query

    // Build WHERE động theo filter
    const conditions = []
    const values     = []
    let   idx        = 1

    if (status) {
      conditions.push(`t.status = $${idx++}`)
      values.push(status)
    }
    if (priority) {
      conditions.push(`t.priority = $${idx++}`)
      values.push(priority)
    }
    if (employee_id) {
      conditions.push(`t.employee_id = $${idx++}`)
      values.push(employee_id)
    }
    if (customer_id) {
      conditions.push(`t.customer_id = $${idx++}`)
      values.push(customer_id)
    }

    const where = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const result = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.updated_at,
        e.id   AS employee_id,
        e.name AS employee_name,
        e.role AS employee_role,
        c.id   AS customer_id,
        c.name AS customer_name,
        c.company AS customer_company
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN customers c ON t.customer_id = c.id
      ${where}
      ORDER BY
        CASE t.priority
          WHEN 'high'   THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low'    THEN 3
        END,
        t.created_at DESC
    `, values)

    res.json(result.rows)
  } catch (err) {
    console.error('[task.getAll]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách tasks' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/tasks/:id
// ─────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(`
      SELECT
        t.*,
        e.name    AS employee_name,
        e.role    AS employee_role,
        e.email   AS employee_email,
        c.name    AS customer_name,
        c.company AS customer_company,
        c.email   AS customer_email,
        c.phone   AS customer_phone
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('[task.getOne]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy task' })
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/tasks
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      status      = 'todo',
      priority    = 'medium',
      due_date,
      employee_id,
      customer_id,
    } = req.body

    // Validate
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Tiêu đề task là bắt buộc' })
    }

    const VALID_STATUS   = ['todo', 'in_progress', 'pending', 'done']
    const VALID_PRIORITY = ['low', 'medium', 'high']

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `Status không hợp lệ. Chọn: ${VALID_STATUS.join(', ')}` })
    }
    if (!VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ error: `Priority không hợp lệ. Chọn: ${VALID_PRIORITY.join(', ')}` })
    }

    const result = await pool.query(`
      INSERT INTO tasks
        (title, description, status, priority, due_date, employee_id, customer_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title.trim(),
      description?.trim() || null,
      status,
      priority,
      due_date    || null,
      employee_id || null,
      customer_id || null,
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[task.create]', err)
    res.status(500).json({ error: 'Lỗi server khi tạo task' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/tasks/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      status,
      priority,
      due_date,
      employee_id,
      customer_id,
    } = req.body

    // Kiểm tra task tồn tại
    const existing = await pool.query('SELECT id FROM tasks WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' })
    }

    // Validate nếu có truyền lên
    const VALID_STATUS   = ['todo', 'in_progress', 'pending', 'done']
    const VALID_PRIORITY = ['low', 'medium', 'high']

    if (status   && !VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: `Status không hợp lệ. Chọn: ${VALID_STATUS.join(', ')}` })
    }
    if (priority && !VALID_PRIORITY.includes(priority)) {
      return res.status(400).json({ error: `Priority không hợp lệ. Chọn: ${VALID_PRIORITY.join(', ')}` })
    }

    const result = await pool.query(`
      UPDATE tasks SET
        title       = COALESCE($1, title),
        description = COALESCE($2, description),
        status      = COALESCE($3, status),
        priority    = COALESCE($4, priority),
        due_date    = COALESCE($5, due_date),
        employee_id = COALESCE($6, employee_id),
        customer_id = COALESCE($7, customer_id),
        updated_at  = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      title?.trim()   || null,
      description?.trim() || null,
      status          || null,
      priority        || null,
      due_date        || null,
      employee_id     || null,
      customer_id     || null,
      id,
    ])

    res.json(result.rows[0])
  } catch (err) {
    console.error('[task.update]', err)
    res.status(500).json({ error: 'Lỗi server khi cập nhật task' })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/tasks/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' })
    }

    res.json({ message: 'Xóa task thành công', task: result.rows[0] })
  } catch (err) {
    console.error('[task.remove]', err)
    res.status(500).json({ error: 'Lỗi server khi xóa task' })
  }
}
