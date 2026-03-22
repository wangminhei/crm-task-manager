'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const EMPTY_FORM = { name: '', email: '', phone: '', company: '' }

export default function CustomersPage() {
  const { token, isAdmin } = useAuth()
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [search, setSearch]       = useState('')

  const fetchCustomers = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/api/customers`, authHeader)
      setCustomers(res.data)
    } catch (err) {
      setError('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [token])

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }
  const openEdit   = (c) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '' })
    setEditId(c.id)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM); setEditId(null) }

  const handleSubmit = async () => {
    if (!form.name) return alert('Vui lòng nhập tên khách hàng')
    try {
      setSaving(true)
      if (editId) {
        await axios.put(`${API_URL}/api/customers/${editId}`, form, authHeader)
      } else {
        await axios.post(`${API_URL}/api/customers`, form, authHeader)
      }
      closeModal()
      fetchCustomers()
    } catch (err) {
      alert(err.response?.data?.error || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return alert('Chỉ admin mới có quyền xóa')
    if (!confirm('Xóa khách hàng này?')) return
    try {
      await axios.delete(`${API_URL}/api/customers/${id}`, authHeader)
      fetchCustomers()
    } catch (err) {
      alert(err.response?.data?.error || 'Xóa thất bại')
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Khách hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý danh sách khách hàng</p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + Thêm khách hàng
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Tổng khách hàng</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Công ty</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {new Set(customers.map(c => c.company).filter(Boolean)).size}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Có email</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {customers.filter(c => c.email).length}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Tìm theo tên, công ty, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ERROR */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {search ? 'Không tìm thấy kết quả' : 'Chưa có khách hàng nào'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left text-gray-600">#</th>
                  <th className="p-4 text-left text-gray-600">Tên</th>
                  <th className="p-4 text-left text-gray-600">Email</th>
                  <th className="p-4 text-left text-gray-600">Điện thoại</th>
                  <th className="p-4 text-left text-gray-600">Công ty</th>
                  <th className="p-4 text-left text-gray-600">Tasks</th>
                  {isAdmin && <th className="p-4 text-left text-gray-600">Hành động</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{c.email || <span className="text-gray-300">---</span>}</td>
                    <td className="p-4 text-gray-500">{c.phone || <span className="text-gray-300">---</span>}</td>
                    <td className="p-4">
                      {c.company
                        ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{c.company}</span>
                        : <span className="text-gray-300">---</span>}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-700 font-medium">{c.total_tasks || 0}</span>
                      <span className="text-gray-400 text-xs ml-1">tasks</span>
                    </td>
                    {isAdmin && (
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="bg-yellow-100 hover:bg-yellow-400 text-yellow-700 hover:text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded text-xs transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL — chỉ admin */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editId ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tên <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="Nguyễn Văn A"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Điện thoại</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="0901 234 567"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Công ty</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="Tên công ty..."
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
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
