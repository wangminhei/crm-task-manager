export default function TaskCard({ task }) {

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "#2ecc71"
      case "pending":
        return "#f39c12"
      default:
        return "#95a5a6"
    }
  }

  return (
    <div style={{
      background: "#fff",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      <h3 style={{ margin: 0 }}>{task.title}</h3>

      <p style={{ margin: "6px 0" }}>
        👤 {task.user_name || "Chưa gán"}
      </p>

      <p style={{ margin: "6px 0" }}>
        🏢 {task.customer_name || "Không có"}
      </p>

      <span style={{
        padding: "4px 10px",
        borderRadius: 20,
        background: getStatusColor(task.status),
        color: "#fff",
        fontSize: 12
      }}>
        {task.status}
      </span>
    </div>
  )
}
