"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import TaskCard from "./components/TaskCard"

export default function Page() {

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tasks`)
      setTasks(res.data.data || [])
    } catch (err) {
      console.error("Lỗi load tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      
      <h1>📊 CRM Dashboard</h1>

      {loading && <p>Đang tải...</p>}

      {!loading && tasks.length === 0 && (
        <p>Chưa có công việc nào</p>
      )}

      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}

    </div>
  )
}
