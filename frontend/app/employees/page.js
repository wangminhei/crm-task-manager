'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crm-task-manager-production-2cd3.up.railway.app'

const EMPTY_FORM = { name: '', email: '', role: '', department: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/api/employees`)
      setEmployees(res.data)
    } catch (err) {
      setError('Không thể tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEmployees() }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setForm({ name: emp.name, email: emp.email, role: emp.role || '', department: emp.department || '' })
    setEditId(emp.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setForm(EMPTY_FORM)
    setEditId(null)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email) return alert('Vui lòng nhập tên và email')
    try {
      setSaving(true)
      if (editId) {
        await axios.put(`${API_URL}/api/employees/${editId}`, form)
      } else {
        await axios.post(`${API_URL}/api/employees`, form)
      }
      closeModal()
      fetchEmployees()
    } catch (err) {
      alert(err.response?.data?.error || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này?')) return
    try {
      await axios.delete(`${API_URL}/api/employees/${id}`)
      fetchEmployees()
    } catch (err) {
      alert('Xóa thất bại')
    }
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Nhân viên</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý danh sách nhân viên</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Thêm nhân viên
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Tổng nhân viên</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{employees.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Phòng ban</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {new Set(employees.map(e => e.department).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Vai trò</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {new Set(employees.map(e => e.role).filter(Boolean)).size}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Chưa có nhân viên nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-gray-600">#</th>
                  <th className="p-4 text-left text-gray-600">Tên</th>
                  <th className="p-4 text-left text-gray-600">Email</th>
                  <th className="p-4 text-left text-gray-600">Vai trò</th>
                  <th className="p-4 text-left text-gray-600">Phòng ban</th>
                  <th className="p-4 text-left text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{emp.email}</td>
                    <td className="p-4">
                      {emp.role
                        ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{emp.role}</span>
                        : <span className="text-gray-300">---</span>
                      }
                    </td>
                    <td className="p-4">
                      {emp.department
                        ? <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">{emp.department}</span>
                        : <span className="text-gray-300">---</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(emp)}
                          className="bg-yellow-100 hover:bg-yellow-400 text-yellow-700 hover:text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editId ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tên <span className="text-red-500">*</span></label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="email@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Vai trò</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Developer, Designer, PM..."
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phòng ban</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Kỹ thuật, Kinh doanh..."
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
