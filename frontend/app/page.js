'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import TaskCard from './components/TaskCard'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  // 🔹 GET
  const fetchTasks = async () => {
    const res = await axios.get(`${API_URL}/tasks`)
    setTasks(res.data.data)
  }

  // 🔹 CREATE
  const createTask = async () => {
    if (!title) return

    await axios.post(`${API_URL}/tasks`, {
      title,
      description
    })

    setTitle('')
    setDescription('')
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

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: 220,
        height: '100vh',
        background: '#111',
        color: '#fff',
        padding: 20
      }}>
        <h2>📊 CRM</h2>
        <p>Dashboard</p>
        <p>Công việc</p>
        <p>Khách hàng</p>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 20 }}>
        <h1>CRM Task Manager</h1>

        {/* FORM */}
        <div style={{
          marginBottom: 20,
          padding: 15,
          border: '1px solid #ddd',
          borderRadius: 10
        }}>
          <input
            placeholder="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: 'block', marginBottom: 10, width: '100%' }}
          />

          <input
            placeholder="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: 'block', marginBottom: 10, width: '100%' }}
          />

          <button onClick={createTask}>➕ Tạo task</button>
        </div>

        {/* LIST */}
        {tasks.map((task) => (
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

<div className="grid grid-cols-3 gap-4 mb-4">
  <div className="bg-yellow-300 p-4 rounded">
    Pending: {tasks.filter(t=>t.status==='pending').length}
  </div>

  <div className="bg-green-300 p-4 rounded">
    Done: {tasks.filter(t=>t.status==='done').length}
  </div>

  <div className="bg-red-300 p-4 rounded">
    Cancelled
  </div>
</div>
