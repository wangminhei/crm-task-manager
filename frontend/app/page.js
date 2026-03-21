'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import RescheduleModal from './components/RescheduleModal'
import { useAuth } from './context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crm-task-manager-production-2cd3.up.railway.app'

const STATUS_MAP = {
  todo:        { label: 'Cần làm',    bg: 'bg-orange-100', text: 'text-orange-700' },
  in_progress: { label: 'Đang làm',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
  pending:     { label: 'Chờ duyệt',  bg: 'bg-purple-100', text: 'text-purple-700' },
  done:        { label: 'Hoàn thành', bg: 'bg-green-100',  text: 'text-green-700'  },
}

export default function Home() {
  const { token, isAdmin, user } = useAuth()

  const [tasks,   setTasks]   = useState([])
  const [filter,  setFilter]  = useState('all')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Reschedule modal
  const [rescheduleTask, setRescheduleTask] = useState(null)

  const authHeader = { headers: { Authorization: `Bearer ${token}` } }

  const fetchTasks = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/api/tasks`, authHeader)
      setTasks(res.data)
    } catch (err) {
      setError('Không thể tải danh sách công việc')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${id}`, { status }, authHeader)
      fetchTasks()
    } catch (err) {
      alert('Cập nhật thất bại')
    }
  }

  const deleteTask = async (id) => {
    if (!isAdmin) return alert('Chỉ admin mới có quyền xóa')
    if (!confirm('Bạn có chắc muốn xóa task này?')) return
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, authHeader)
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.error || 'Xóa thất bại')
    }
  }

  useEffect(() => { fetchTasks() }, [token])

  const filteredTasks = tasks.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Công việc</h1>
          <span className={`text-xs px-3 py-1 rounded-full font-medium
            ${isAdmin ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            {isAdmin ? '👑 Admin' : '🔧 Kỹ thuật'}
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-orange-400 p-4 rounded-lg text-white">
            <p className="text-xs opacity-80">Cần làm</p>
            <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'todo').length}</p>
          </div>
          <div className="bg-yellow-400 p-4 rounded-lg text-white">
            <p className="text-xs opacity-80">Đang làm</p>
            <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
          </div>
          <div className="bg-purple-400 p-4 rounded-lg text-white">
            <p className="text-xs opacity-80">Chờ duyệt</p>
            <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
          </div>
          <div className="bg-green-400 p-4 rounded-lg text-white">
            <p className="text-xs opacity-80">Hoàn thành</p>
            <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'done').length}</p>
          </div>
          <div className="bg-gray-400 p-4 rounded-lg text-white">
            <p className="text-xs opacity-80">Tổng</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {[
            { key: 'all',         label: 'Tất cả',      cls: 'bg-gray-200 text-gray-700'       },
            { key: 'todo',        label: 'Cần làm',     cls: 'bg-orange-400 text-white'        },
            { key: 'in_progress', label: 'Đang làm',    cls: 'bg-yellow-400 text-white'        },
            { key: 'pending',     label: 'Chờ duyệt',   cls: 'bg-purple-400 text-white'        },
            { key: 'done',        label: 'Hoàn thành',  cls: 'bg-green-500 text-white'         },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-lg text-sm transition-opacity
                ${filter === f.key ? f.cls + ' opacity-100' : 'bg-gray-100 text-gray-500'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Không có công việc nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-gray-600">#</th>
                  <th className="p-3 text-left text-gray-600">Trạng thái</th>
                  <th className="p-3 text-left text-gray-600">Nội dung</th>
                  <th className="p-3 text-left text-gray-600">Khách hàng</th>
                  <th className="p-3 text-left text-gray-600">Nhân viên</th>
                  <th className="p-3 text-left text-gray-600">Hạn</th>
                  <th className="p-3 text-left text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => {
                  const s = STATUS_MAP[task.status] || {}
                  return (
                    <tr key={task.id} className="border-t hover:bg-gray-50">

                      <td className="p-3 text-gray-400">{index + 1}</td>

                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${s.bg} ${s.text}`}>
                          {s.label || task.status}
                        </span>
                        {task.reschedule_count > 0 && (
                          <span className="ml-1 text-xs text-orange-400">
                            🔄×{task.reschedule_count}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <p className="font-medium text-gray-800">{task.title}</p>
                        {task.description && (
                          <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{task.description}</p>
                        )}
                        {task.reschedule_note && (
                          <p className="text-orange-500 text-xs mt-0.5">
                            📝 {task.reschedule_note}
                          </p>
                        )}
                      </td>

                      <td className="p-3 text-gray-600">{task.customer_name || '---'}</td>

                      <td className="p-3 text-gray-600">{task.employee_name || 'Chưa phân công'}</td>

                      <td className="p-3 text-gray-500 text-xs">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString('vi-VN')
                          : '---'}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">

                          {/* Done — admin + tech */}
                          {task.status !== 'done' && (
                            <button
                              onClick={() => updateStatus(task.id, 'done')}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              ✓ Done
                            </button>
                          )}

                          {/* Hẹn lại — admin + tech */}
                          {task.status !== 'done' && (
                            <button
                              onClick={() => setRescheduleTask(task)}
                              className="bg-orange-400 hover:bg-orange-500 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              📅 Hẹn lại
                            </button>
                          )}

                          {/* Xóa — chỉ admin */}
                          {isAdmin && (
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              Xóa
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleTask && (
        <RescheduleModal
          task={rescheduleTask}
          token={token}
          onClose={() => setRescheduleTask(null)}
          onSuccess={fetchTasks}
        />
      )}

    </div>
  )
}
