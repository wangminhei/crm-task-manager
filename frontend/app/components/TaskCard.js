'use client'

const STATUS_MAP = {
  todo:        { label: 'Cần làm',    bg: 'bg-orange-100', text: 'text-orange-700' },
  in_progress: { label: 'Đang làm',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
  pending:     { label: 'Chờ duyệt',  bg: 'bg-purple-100', text: 'text-purple-700' },
  done:        { label: 'Hoàn thành', bg: 'bg-green-100',  text: 'text-green-700'  },
}

const PRIORITY_MAP = {
  low:    { label: 'Thấp',   bg: 'bg-gray-100',   text: 'text-gray-600'   },
  medium: { label: 'Trung',  bg: 'bg-blue-100',   text: 'text-blue-600'   },
  high:   { label: 'Cao',    bg: 'bg-red-100',    text: 'text-red-600'    },
}

export default function TaskCard({ task, onUpdateStatus, onDelete }) {
  const status   = STATUS_MAP[task.status]   || { label: task.status,   bg: 'bg-gray-100', text: 'text-gray-600' }
  const priority = PRIORITY_MAP[task.priority] || { label: task.priority, bg: 'bg-gray-100', text: 'text-gray-600' }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">

      {/* TOP ROW — status + priority */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${priority.bg} ${priority.text}`}>
          {priority.label}
        </span>
      </div>

      {/* TITLE + DESC */}
      <div>
        <h3 className="font-semibold text-gray-800 text-sm">{task.title}</h3>
        {task.description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* META */}
      <div className="text-xs text-gray-400 space-y-1">
        <div>👤 {task.employee_name || 'Chưa phân công'}</div>
        <div>🤝 {task.customer_name  || '---'}</div>
        {task.due_date && (
          <div>📅 {new Date(task.due_date).toLocaleDateString('vi-VN')}</div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        {task.status !== 'done' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'done')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 rounded transition-colors"
          >
            ✓ Done
          </button>
        )}
        {task.status === 'todo' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'in_progress')}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs py-1.5 rounded transition-colors"
          >
            ▶ Bắt đầu
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="bg-red-100 hover:bg-red-500 text-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition-colors"
        >
          Xoá
        </button>
      </div>

    </div>
  )
}
