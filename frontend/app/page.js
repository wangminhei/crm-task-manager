'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [schedule, setSchedule] = useState('')
  const [assigned, setAssigned] = useState('')

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  const fetchTasks = async () => {
    const res = await axios.get(`${API_URL}/tasks`)
    setTasks(res.data.data)
  }

  const createTask = async () => {
    if (!title) return

    await axios.post(`${API_URL}/tasks`, {
      title,
      description,
      note,
      schedule_time: schedule,
      assigned_to: assigned || null
    })

    setTitle('')
    setDescription('')
    setNote('')
    setSchedule('')
    fetchTasks()
  }

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/tasks/${id}`, { status })
    fetchTasks()
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`)
    fetchTasks()
  }

  const filteredTasks = tasks.filter((t) =>
    filter === 'all' ? true : t.status === filter
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-xl font-bold mb-6">📊 CRM</h2>
        <p className="mb-3 cursor-pointer hover:text-blue-400">Dashboard</p>
        <p className="mb-3 cursor-pointer hover:text-blue-400">Công việc</p>
        <p className="mb-3 cursor-pointer hover:text-blue-400">Khách hàng</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-4">CRM Task Manager</h1>

        {/* DASHBOARD */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-400 text-white p-4 rounded-xl shadow">
            Pending: {tasks.filter(t => t.status === 'pending').length}
          </div>
          <div className="bg-green-500 text-white p-4 rounded-xl shadow">
            Done: {tasks.filter(t => t.status === 'done').length}
          </div>
          <div className="bg-red-500 text-white p-4 rounded-xl shadow">
            Cancelled: {tasks.filter(t => t.status === 'cancelled').length}
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-4 space-x-2">
          <button onClick={() => setFilter('all')} className="px-3 py-1 bg-gray-300 rounded">All</button>
          <button onClick={() => setFilter('pending')} className="px-3 py-1 bg-yellow-400 text-white rounded">Pending</button>
          <button onClick={() => setFilter('done')} className="px-3 py-1 bg-green-500 text-white rounded">Done</button>
        </div>

        {/* FORM */}
        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <h2 className="font-semibold mb-3">Tạo task</h2>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="border p-2 rounded"
              placeholder="Tiêu đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="datetime-local"
              className="border p-2 rounded"
              onChange={(e) => setSchedule(e.target.value)}
            />

            <select
              className="border p-2 rounded"
              onChange={(e) => setAssigned(e.target.value)}
            >
              <option value="">Chọn kỹ thuật</option>
              <option value="1">KTV 1</option>
              <option value="2">KTV 2</option>
            </select>
          </div>

          <textarea
            className="border p-2 w-full mt-3 rounded"
            placeholder="Mang theo gì..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button
            onClick={createTask}
            className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
          >
            ➕ Tạo task
          </button>
        </div>

        {/* TASK LIST */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="font-bold">{task.title}</h3>
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">{task.note}</p>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => updateStatus(task.id, 'done')}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Done
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
