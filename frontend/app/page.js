'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import TaskCard from './components/TaskCard'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  // form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')
  const [schedule, setSchedule] = useState('')
  const [assigned, setAssigned] = useState('')

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  // 🔹 GET TASK
  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`)
      setTasks(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 CREATE TASK
  const createTask = async () => {
    if (!title) return alert('Nhập tiêu đề')

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
    setAssigned('')

    fetchTasks()
  }

  // 🔹 DELETE
  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`)
    fetchTasks()
  }

  // 🔹 UPDATE STATUS
  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/tasks/${id}`, {
      status
    })
    fetchTasks()
  }

  // 🔹 FILTER
  const filteredTasks = tasks.filter((t) =>
    filter === 'all' ? true : t.status === filter
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white p-5">
        <h2 className="text-xl mb-4">📊 CRM</h2>
        <p className="mb-2">Dashboard</p>
        <p className="mb-2">Công việc</p>
        <p className="mb-2">Khách hàng</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6 bg-gray-100">

        <h1 className="text-2xl mb-4">CRM Task Manager</h1>

        {/* DASHBOARD */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-yellow-400 text-white p-4 rounded">
            Pending: {tasks.filter(t => t.status === 'pending').length}
          </div>

          <div className="bg-green-500 text-white p-4 rounded">
            Done: {tasks.filter(t => t.status === 'done').length}
          </div>

          <div className="bg-red-500 text-white p-4 rounded">
            Cancelled: {tasks.filter(t => t.status === 'cancelled').length}
          </div>
        </div>

        {/* FILTER */}
        <div className="mb-4">
          <button onClick={() => setFilter('all')} className="mr-2">All</button>
          <button onClick={() => setFilter('pending')} className="mr-2">Pending</button>
          <button onClick={() => setFilter('done')} className="mr-2">Done</button>
        </div>

        {/* FORM */}
        <div className="bg-white p-4 rounded mb-4">
          <input
            className="border p-2 w-full mb-2"
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            className="border p-2 w-full mb-2"
            placeholder="Ghi chú: mang theo gì..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <input
            type="datetime-local"
            className="border p-2 w-full mb-2"
            onChange={(e) => setSchedule(e.target.value)}
          />

          <select
            className="border p-2 w-full mb-2"
            onChange={(e) => setAssigned(e.target.value)}
          >
            <option value="">Chọn kỹ thuật</option>
            <option value="1">KTV 1</option>
            <option value="2">KTV 2</option>
          </select>

          <button
            onClick={createTask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            ➕ Tạo task
          </button>
        </div>

        {/* LIST */}
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={deleteTask}
            onUpdate={updateStatus}
          />
        ))}

      </div>
    </div>
  )
}
