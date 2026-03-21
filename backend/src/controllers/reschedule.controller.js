const pool = require('../db')

exports.reschedule = async (req, res) => {
  try {
    const { id }                    = req.params
    const { new_due_date, note }    = req.body

    if (!new_due_date) {
      return res.status(400).json({ error: 'Vui lòng chọn ngày hẹn mới' })
    }

    // Kiểm tra task tồn tại
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy task' })
    }

    const result = await pool.query(`
      UPDATE tasks SET
        due_date        = $1,
        status          = 'pending',
        rescheduled_at  = NOW(),
        reschedule_note = $2,
        reschedule_count = reschedule_count + 1,
        updated_at      = NOW()
      WHERE id = $3
      RETURNING *
    `, [new_due_date, note || null, id])

    res.json({
      message: 'Hẹn lại thành công',
      task:    result.rows[0],
    })
  } catch (err) {
    console.error('[reschedule]', err)
    res.status(500).json({ error: 'Lỗi server khi hẹn lại' })
  }
}
