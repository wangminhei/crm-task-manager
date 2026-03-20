'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  const fetchTasks = async () => {
    const res = await axios.get(`${API_URL}/tasks`)
    setTasks(res.data.data)
  }

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/tasks/${id}`, { status })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`)
    fetchTasks()
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <Sidebar />

      <div className="flex-1 p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4">Công việc</h1>

        {/* STATS */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-orange-400 p-4 rounded text-white">Cần làm {tasks.filter(t=>t.status==='pending').length}</div>
          <div className="bg-gray-200 p-4 rounded">Chưa có lịch</div>
          <div className="bg-purple-400 p-4 rounded text-white">Đã hẹn</div>
          <div className="bg-green-400 p-4 rounded text-white">Hoàn thành {tasks.filter(t=>t.status==='done').length}</div>
          <div className="bg-red-400 p-4 rounded text-white">Đã huỷ</div>
        </div>

        {/* FILTER */}
        <div className="mb-4 flex gap-2">
          <button onClick={()=>setFilter('all')} className="px-3 py-1 bg-gray-200 rounded">Tất cả</button>
          <button onClick={()=>setFilter('pending')} className="px-3 py-1 bg-orange-400 text-white rounded">Cần làm</button>
          <button onClick={()=>setFilter('done')} className="px-3 py-1 bg-green-500 text-white rounded">Hoàn thành</button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow">
          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Nội dung</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {tasks
                .filter(t => filter==='all' ? true : t.status===filter)
                .map((task, index) => (
                <tr key={task.id} className="border-t">

                  <td className="p-3">{index + 1}</td>

                  <td className="p-3">
                    {task.status === 'pending' && (
                      <span className="bg-orange-200 px-2 py-1 rounded text-orange-700">
                        Chưa nhận
                      </span>
                    )}

                    {task.status === 'done' && (
                      <span className="bg-green-200 px-2 py-1 rounded text-green-700">
                        Hoàn thành
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <b>{task.title}</b>
                    <p className="text-gray-500 text-xs">{task.description}</p>
                  </td>

                  <td className="p-3">
                    {task.customer_name || '---'}
                  </td>

                  <td className="p-3">
                    {task.user_name || 'Chưa phân công'}
                  </td>

                  <td className="p-3 flex gap-2">

                    <button
                      onClick={()=>updateStatus(task.id,'done')}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Done
                    </button>

                    <button
                      onClick={()=>deleteTask(task.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Xoá
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  )
}
