'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crm-task-manager-production-2cd3.up.railway.app'

const EMPTY_FORM = {
  title:       '',
  description: '',
  status:      'todo',
  priority:    'medium',
  due_date:    '',
  employee_id: '',
  customer_id: '',
}

export default function NewTaskPage() {
  const router = useRouter()
  const [form, setForm]           = useState(EMPTY_FORM)
  const [employees, setEmployees] = useState([])
  const [customers, setCustomers] = useState([])
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [empRes, cusRes] = await Promise.all([
          axios.get(`${API_URL}/api/employees`),
          axios.get(`${API_URL}/api/customers`),
        ])
        setEmployees(empRes.data)
        setCustomers(cusRes.data)
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err)
      }
    }
    fetchOptions()
  }, [])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Tiêu đề là bắt buộc'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      setSaving(true)
      await axios.post(`${API_URL}/api/tasks`, {
        ...form,
        employee_id: form.employee_id || null,
        customer_id: form.customer_id || null,
        due_date:    form.due_date    || null,
      })
      router.push('/')
    } catch (err) {
      alert(err.response?.data?.error || 'Tạo task thất bại')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold">Tạo công việc mới</h1>
            <p className="text-gray-500 text-sm mt-1">Điền thông tin bên dưới để tạo task</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* FORM — LEFT */}
          <div className="col-span-2 space-y-5">

            {/* Tiêu đề */}
            <div className="bg-white rounded-lg shadow p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Thông tin cơ bản</h2>

              <Field label="Tiêu đề" required error={errors.title}>
  <input
    type="text"
    autoComplete="off"
    className={`w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-900
      focus:outline-none focus:ring-2 focus:ring-blue-300
      ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
    placeholder="Nhập tiêu đề công việc..."
    value={form.title}
    onChange={e => setForm({ ...form, title: e.target.value })}
  />
</Field>

<Field label="Mô tả">
  <textarea
    autoComplete="off"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white
      text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
    placeholder="Mô tả chi tiết công việc..."
    rows={4}
    value={form.description}
    onChange={e => setForm({ ...form, description: e.target.value })}
  />
</Field>
            </div>

            {/* Phân công */}
            <div className="bg-white rounded-lg shadow p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Phân công</h2>

              <Field label="Nhân viên phụ trách">
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  value={form.employee_id}
                  onChange={e => setForm({ ...form, employee_id: e.target.value })}
                >
                  <option value="">-- Chưa phân công --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} {emp.role ? `(${emp.role})` : ''}</option>
                  ))}
                </select>
              </Field>

              <Field label="Khách hàng liên quan">
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  value={form.customer_id}
                  onChange={e => setForm({ ...form, customer_id: e.target.value })}
                >
                  <option value="">-- Không có --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `- ${c.company}` : ''}</option>
                  ))}
                </select>
              </Field>
            </div>

          </div>

          {/* SIDEBAR — RIGHT */}
          <div className="space-y-5">

            <div className="bg-white rounded-lg shadow p-5 space-y-4">
              <h2 className="font-semibold text-gray-700 border-b pb-2">Thuộc tính</h2>

              <Field label="Trạng thái">
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">📋 Cần làm</option>
                  <option value="in_progress">▶ Đang làm</option>
                  <option value="pending">⏳ Chờ duyệt</option>
                  <option value="done">✅ Hoàn thành</option>
                </select>
              </Field>

              <Field label="Độ ưu tiên">
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">🟢 Thấp</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="high">🔴 Cao</option>
                </select>
              </Field>

              <Field label="Hạn hoàn thành">
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </Field>
            </div>

            {/* ACTIONS */}
            <div className="bg-white rounded-lg shadow p-5 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang tạo...' : '✓ Tạo công việc'}
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>

            {/* PREVIEW */}
            {form.title && (
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="font-semibold text-gray-700 border-b pb-2 mb-3">Xem trước</h2>
                <p className="font-medium text-sm">{form.title}</p>
                {form.description && (
                  <p className="text-gray-500 text-xs mt-1 line-clamp-3">{form.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{form.status}</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{form.priority}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
