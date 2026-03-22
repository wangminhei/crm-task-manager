'use client'

import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function RescheduleModal({ task, token, onClose, onSuccess }) {
  const [date,    setDate]    = useState('')
  const [note,    setNote]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!date) return setError('Vui lòng chọn ngày hẹn mới')
    try {
      setSaving(true)
      setError('')
      await axios.post(
        `${API_URL}/api/tasks/${task.id}/reschedule`,
        { new_due_date: date, note },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Hẹn lại thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">📅 Hẹn lại lịch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Task info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-800">{task.title}</p>
          {task.due_date && (
            <p className="text-xs text-gray-500 mt-1">
              Hạn cũ: {new Date(task.due_date).toLocaleDateString('vi-VN')}
            </p>
          )}
          {task.reschedule_count > 0 && (
            <p className="text-xs text-orange-500 mt-1">
              Đã hẹn lại {task.reschedule_count} lần
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Ngày hẹn mới <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Lý do hẹn lại
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              placeholder="Khách bận, cần chuẩn bị thêm tài liệu..."
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg
              text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Đang lưu...' : '📅 Xác nhận hẹn lại'}
          </button>
        </div>

      </div>
    </div>
  )
}
