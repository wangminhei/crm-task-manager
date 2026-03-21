const pool = require('../db')

// ─────────────────────────────────────────────────────────────
// GET /api/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      overview,
      byStatus,
      byPriority,
      topEmployees,
      topCustomers,
      overdue,
      recentTasks,
    ] = await Promise.all([

      // Tổng quan
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM tasks)                                    AS total_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'todo')             AS tasks_todo,
          (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress')      AS tasks_in_progress,
          (SELECT COUNT(*) FROM tasks WHERE status = 'pending')          AS tasks_pending,
          (SELECT COUNT(*) FROM tasks WHERE status = 'done')             AS tasks_done,
          (SELECT COUNT(*) FROM employees)                               AS total_employees,
          (SELECT COUNT(*) FROM customers)                               AS total_customers,
          (SELECT COUNT(*) FROM tasks WHERE due_date < CURRENT_DATE
            AND status NOT IN ('done'))                                  AS overdue_tasks
      `),

      // Tasks theo status
      pool.query(`
        SELECT
          status,
          COUNT(*) AS count
        FROM tasks
        GROUP BY status
        ORDER BY count DESC
      `),

      // Tasks theo priority
      pool.query(`
        SELECT
          priority,
          COUNT(*) AS count
        FROM tasks
        GROUP BY priority
        ORDER BY
          CASE priority
            WHEN 'high'   THEN 1
            WHEN 'medium' THEN 2
            WHEN 'low'    THEN 3
          END
      `),

      // Top 5 nhân viên nhiều task nhất
      pool.query(`
        SELECT
          e.id,
          e.name,
          e.role,
          COUNT(t.id)                                         AS total_tasks,
          COUNT(t.id) FILTER (WHERE t.status = 'done')        AS tasks_done,
          COUNT(t.id) FILTER (WHERE t.status NOT IN ('done')) AS tasks_open
        FROM employees e
        LEFT JOIN tasks t ON t.employee_id = e.id
        GROUP BY e.id
        ORDER BY total_tasks DESC
        LIMIT 5
      `),

      // Top 5 khách hàng nhiều task nhất
      pool.query(`
        SELECT
          c.id,
          c.name,
          c.company,
          COUNT(t.id)                                         AS total_tasks,
          COUNT(t.id) FILTER (WHERE t.status = 'done')        AS tasks_done,
          COUNT(t.id) FILTER (WHERE t.status NOT IN ('done')) AS tasks_open
        FROM customers c
        LEFT JOIN tasks t ON t.customer_id = c.id
        GROUP BY c.id
        ORDER BY total_tasks DESC
        LIMIT 5
      `),

      // Tasks quá hạn
      pool.query(`
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.due_date,
          e.name AS employee_name,
          c.name AS customer_name,
          CURRENT_DATE - t.due_date AS days_overdue
        FROM tasks t
        LEFT JOIN employees e ON t.employee_id = e.id
        LEFT JOIN customers c ON t.customer_id = c.id
        WHERE t.due_date < CURRENT_DATE
          AND t.status NOT IN ('done')
        ORDER BY t.due_date ASC
        LIMIT 10
      `),

      // 5 tasks mới nhất
      pool.query(`
        SELECT
          t.id,
          t.title,
          t.status,
          t.priority,
          t.created_at,
          e.name AS employee_name
        FROM tasks t
        LEFT JOIN employees e ON t.employee_id = e.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `),
    ])

    res.json({
      overview:      overview.rows[0],
      by_status:     byStatus.rows,
      by_priority:   byPriority.rows,
      top_employees: topEmployees.rows,
      top_customers: topCustomers.rows,
      overdue_tasks: overdue.rows,
      recent_tasks:  recentTasks.rows,
    })
  } catch (err) {
    console.error('[stats.getStats]', err)
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê' })
  }
}
