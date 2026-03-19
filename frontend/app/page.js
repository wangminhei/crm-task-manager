'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://crm-task-manager-production-2cd3.up.railway.app'

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`)
      setTasks(res.data.data)
    } catch (err) {
      console.error('Lỗi fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <main style={{ padding: 20 }}>
      <h1>📋 CRM Task Manager</h1>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>Không có task nào</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: '1px solid #ddd',
                padding: 12,
                borderRadius: 8,
                marginBottom: 10
              }}
            >
              <h3>{task.title}</h3>
              <p>{task.description}</p>

              <p>
                <strong>Status:</strong> {task.status}
              </p>

              <p>
                <strong>Customer:</strong>{' '}
                {task.customer_name || 'N/A'}
              </p>

              <p>
                <strong>Assigned:</strong>{' '}
                {task.user_name || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
