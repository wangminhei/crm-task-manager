'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      // FIX 1: đổi /tasks → /api/tasks
      const res = await axios.get(`${API_URL}/api/tasks`)
      // FIX 2: backend trả array trực tiếp, không có .data wrapper
      setTasks(res.data)
    } catch (err) {
      setError('Không thể tải danh sách công việc')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      // FIX 3: đổi /tasks/:id → /api/tasks/:id
      await axios.put(`${API_URL}/api/tasks/${id}`, { status })
      fetchTasks()
    } catch (err) {
      alert('Cập nhật thất bại')
      console.error(err)
    }
  }

  const deleteTask = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa task này?')) return
    try {
      // FIX 4: đổi /tasks/:id → /api/tasks/:id
      await axios.delete(`${API_URL}/api/tasks/${id}`)
      fetchTasks()
    } catch (err) {
      alert('Xóa thất bại')
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4">Công việc</h1>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-orange-400 p-4 rounded text-white">
            Cần làm {tasks.filter(t => t.status === 'todo').length}
          </div>
          <div className="bg-yellow-400 p-4 rounded text-white">
            Đang làm {tasks.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="bg-purple-400 p-4 rounded text-white">
            Chờ duyệt {tasks.filter(t => t.status === 'pending').length}
          </div>
          <div className="bg-green-400 p-4 rounded text-white">
            Hoàn thành {tasks.filter(t => t.status === 'done').length}
          </div>
          <div className="bg-red-400 p-4 rounded text-white">
            Tổng {tasks.length}
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-200'}`}>
            Tất cả
          </button>
          <button onClick={() => setFilter('todo')} className={`px-3 py-1 rounded ${filter === 'todo' ? 'bg-orange-500 text-white' : 'bg-orange-200'}`}>
            Cần làm
          </button>
          <button onClick={() => setFilter('in_progress')} className={`px-3 py-1 rounded ${filter === 'in_progress' ? 'bg-yellow-500 text-white' : 'bg-yellow-200'}`}>
            Đang làm
          </button>
          <button onClick={() => setFilter('done')} className={`px-3 py-1 rounded ${filter === 'done' ? 'bg-green-600 text-white' : 'bg-green-200'}`}>
            Hoàn thành
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Đang tải...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Không có công việc nào</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Nội dung</th>
                  <th className="p-3 text-left">Khách hàng</th>
                  {/* FIX 5: đổi Nhân viên hiển thị employee_name */}
                  <th className="p-3 text-left">Nhân viên</th>
                  <th className="p-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">

                    <td className="p-3">{index + 1}</td>

                    <td className="p-3">
                      {task.status === 'todo' && (
                        <span className="bg-orange-100 px-2 py-1 rounded text-orange-700 text-xs">Cần làm</span>
                      )}
                      {task.status === 'in_progress' && (
                        <span className="bg-yellow-100 px-2 py-1 rounded text-yellow-700 text-xs">Đang làm</span>
                      )}
                      {task.status === 'pending' && (
                        <span className="bg-purple-100 px-2 py-1 rounded text-purple-700 text-xs">Chờ duyệt</span>
                      )}
                      {task.status === 'done' && (
                        <span className="bg-green-100 px-2 py-1 rounded text-green-700 text-xs">Hoàn thành</span>
                      )}
                    </td>

                    <td className="p-3">
                      <b>{task.title}</b>
                      {task.description && (
                        <p className="text-gray-500 text-xs">{task.description}</p>
                      )}
                    </td>

                    <td className="p-3">{task.customer_name || '---'}</td>

                    {/* FIX 5: task.user_name → task.employee_name */}
                    <td className="p-3">{task.employee_name || 'Chưa phân công'}</td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        {task.status !== 'done' && (
                          <button
                            onClick={() => updateStatus(task.id, 'done')}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Xoá
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
    </div>
  )
}
