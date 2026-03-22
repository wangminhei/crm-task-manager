const pool = require('../db')

// ─────────────────────────────────────────────────────────────
// GET /api/customers
// Query params: search, company
// ─────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { search, company } = req.query

    const conditions = []
    const values     = []
    let   idx        = 1

    if (search) {
      conditions.push(`(
        c.name    ILIKE $${idx}   OR
        c.email   ILIKE $${idx}   OR
        c.company ILIKE $${idx}   OR
        c.phone   ILIKE $${idx}
      )`)
      values.push(`%${search}%`)
      idx++
    }
    if (company) {
      conditions.push(`c.company ILIKE $${idx++}`)
      values.push(`%${company}%`)
    }

    const where = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : ''

    const result = await pool.query(`
      SELECT
        c.*,
        COUNT(t.id)                                         AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')        AS tasks_todo,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS tasks_in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')     AS tasks_pending,
        COUNT(t.id) FILTER (WHERE t.status = 'done')        AS tasks_done
      FROM customers c
      LEFT JOIN tasks t ON t.customer_id = c.id
      ${where}
      GROUP BY c.id
      ORDER BY c.name ASC
    `, values)

    res.json(result.rows)
  } catch (err) {
    console.error('[customer.getAll]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách khách hàng' })
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/customers/:id
// ─────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params

    const cusResult = await pool.query(`
      SELECT
        c.*,
        COUNT(t.id)                                         AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')        AS tasks_todo,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS tasks_in_progress,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')     AS tasks_pending,
        COUNT(t.id) FILTER (WHERE t.status = 'done')        AS tasks_done
      FROM customers c
      LEFT JOIN tasks t ON t.customer_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id])

    if (cusResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    // Danh sách tasks gần nhất của khách hàng
    const taskResult = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.due_date,
        e.name AS employee_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE t.customer_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `, [id])

    res.json({
      ...cusResult.rows[0],
      recent_tasks: taskResult.rows,
    })
  } catch (err) {
    console.error('[customer.getOne]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy khách hàng' })
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/customers
// ─────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Tên khách hàng là bắt buộc' })
    }

    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Email không đúng định dạng' })
      }
    }

    const result = await pool.query(`
      INSERT INTO customers (name, email, phone, company)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      name.trim(),
      email?.trim().toLowerCase() || null,
      phone?.trim()   || null,
      company?.trim() || null,
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email khách hàng đã tồn tại' })
    }
    console.error('[customer.create]', err)
    res.status(500).json({ error: 'Lỗi server khi tạo khách hàng' })
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/customers/:id
// ─────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id }                      = req.params
    const { email } = req.body

    const existing = await pool.query('SELECT id FROM customers WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    if (email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Email không đúng định dạng' })
      }
    }

    const updates = []
    const values = []
    let idx = 1

    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      updates.push(`name = $${idx++}`)
      values.push(req.body.name?.trim() || null)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      updates.push(`email = $${idx++}`)
      values.push(req.body.email?.trim().toLowerCase() || null)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'phone')) {
      updates.push(`phone = $${idx++}`)
      values.push(req.body.phone?.trim() || null)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'company')) {
      updates.push(`company = $${idx++}`)
      values.push(req.body.company?.trim() || null)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu cần cập nhật' })
    }

    updates.push('updated_at = NOW()')
    values.push(id)

    const result = await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    res.json(result.rows[0])
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email khách hàng đã tồn tại' })
    }
    console.error('[customer.update]', err)
    res.status(500).json({ error: 'Lỗi server khi cập nhật khách hàng' })
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/customers/:id
// ─────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params

    // Kiểm tra còn task đang mở không
    const taskCheck = await pool.query(`
      SELECT COUNT(*) FROM tasks
      WHERE customer_id = $1
        AND status NOT IN ('done')
    `, [id])

    if (parseInt(taskCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Khách hàng này còn task chưa hoàn thành. Hãy xử lý task trước khi xóa.',
      })
    }

    const result = await pool.query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khách hàng' })
    }

    res.json({ message: 'Xóa khách hàng thành công', customer: result.rows[0] })
  } catch (err) {
    console.error('[customer.remove]', err)
    res.status(500).json({ error: 'Lỗi server khi xóa khách hàng' })
  }
}
