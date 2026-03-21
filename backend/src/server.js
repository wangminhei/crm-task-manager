require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Database ────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') || process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

// Test kết nối DB khi khởi động
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Lỗi kết nối database:', err.message);
  } else {
    console.log('✅ Kết nối database thành công');
    release();
  }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Task Manager API đang chạy 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ─────────────────────────────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/tasks — lấy toàn bộ tasks (kèm tên nhân viên và khách hàng)
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        e.id   AS employee_id,
        e.name AS employee_name,
        c.id   AS customer_id,
        c.name AS customer_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách tasks' });
  }
});

// GET /api/tasks/:id — lấy 1 task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        t.*,
        e.name AS employee_name,
        c.name AS customer_name
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// POST /api/tasks — tạo task mới
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, employee_id, customer_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Tiêu đề task là bắt buộc' });
    }

    const result = await pool.query(`
      INSERT INTO tasks (title, description, status, priority, due_date, employee_id, customer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title,
      description || null,
      status || 'todo',
      priority || 'medium',
      due_date || null,
      employee_id || null,
      customer_id || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi tạo task' });
  }
});

// PUT /api/tasks/:id — cập nhật task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, employee_id, customer_id } = req.body;

    const result = await pool.query(`
      UPDATE tasks
      SET
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
    `, [title, description, status, priority, due_date, employee_id, customer_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật task' });
  }
});

// DELETE /api/tasks/:id — xóa task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' });
    }
    res.json({ message: 'Xóa task thành công', task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi xóa task' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEES
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách nhân viên' });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Tên và email là bắt buộc' });
    }
    const result = await pool.query(`
      INSERT INTO employees (name, email, role, department)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [name, email, role || null, department || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email nhân viên đã tồn tại' });
    res.status(500).json({ error: 'Lỗi server khi tạo nhân viên' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    const result = await pool.query(`
      UPDATE employees
      SET name=$1, email=$2, role=$3, department=$4, updated_at=NOW()
      WHERE id=$5 RETURNING *
    `, [name, email, role, department, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi cập nhật nhân viên' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi xóa nhân viên' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách khách hàng' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên khách hàng là bắt buộc' });
    const result = await pool.query(`
      INSERT INTO customers (name, email, phone, company)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [name, email || null, phone || null, company || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email khách hàng đã tồn tại' });
    res.status(500).json({ error: 'Lỗi server khi tạo khách hàng' });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    const result = await pool.query(`
      UPDATE customers
      SET name=$1, email=$2, phone=$3, company=$4, updated_at=NOW()
      WHERE id=$5 RETURNING *
    `, [name, email, phone, company, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi cập nhật khách hàng' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
    res.json({ message: 'Xóa khách hàng thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi xóa khách hàng' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STATS (dành cho dashboard)
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const [tasks, employees, customers, byStatus] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tasks'),
      pool.query('SELECT COUNT(*) FROM employees'),
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM tasks GROUP BY status
      `),
    ]);
    res.json({
      total_tasks:     parseInt(tasks.rows[0].count),
      total_employees: parseInt(employees.rows[0].count),
      total_customers: parseInt(customers.rows[0].count),
      tasks_by_status: byStatus.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê' });
  }
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} không tồn tại` });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend đang chạy tại http://localhost:${PORT}`);
});
