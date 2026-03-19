'use client'

export default function TaskCard({ task, onDelete, onUpdate }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      background: '#fff'
    }}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>

      <p><b>Status:</b> {task.status}</p>
      <p><b>Customer:</b> {task.customer_name || 'N/A'}</p>
      <p><b>User:</b> {task.user_name || 'N/A'}</p>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => onUpdate(task.id, 'done')}>
          ✅ Done
        </button>

        <button onClick={() => onDelete(task.id)} style={{ marginLeft: 10 }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
