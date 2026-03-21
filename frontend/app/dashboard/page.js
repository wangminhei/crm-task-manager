'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crm-task-manager-production-2cd3.up.railway.app'

const fmt = (n) => parseInt(n || 0)

function StatCard({ label, value, sub, color }) {
  const colors = {
    blue:   'border-blue-500   bg-blue-50   text-blue-600',
    green:  'border-green-500  bg-green-50  text-green-600',
    orange: 'border-orange-500 bg-orange-50 text-orange-600',
    red:    'border-red-500    bg-red-50    text-red-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    yellow: 'border-yellow-500 bg-yellow-50 text-yellow-600',
  }
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${colors[color] || colors.blue}`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]?.split(' ')[2]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-gray-700 mb-3">{children}</h2>
}

function Badge({ status }) {
  const STATUS_MAP = {
    todo:        { label: 'Cần làm',    bg: 'bg-orange-100', text: 'text-orange-700' },
    in_progress: { label: 'Đang làm',   bg: 'bg-yellow-100', text: 'text-yellow-700' },
    pending:     { label: 'Chờ duyệt',  bg: 'bg-purple-100', text: 'text-purple-700' },
    done:        { label: 'Hoàn thành', bg: 'bg-green-100',  text: 'text-green-700'  },
  }
  const s = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${s.bg} ${s.text}`}>{s.label}</span>
}

function PriorityBadge({ priority }) {
  const PRIORITY_MAP = {
    high:   { label: 'Cao',        bg: 'bg-red-100',  text: 'text-red-600'  },
    medium: { label: 'Trung bình', bg: 'bg-blue-100', text: 'text-blue-600' },
    low:    { label: 'Thấp',       bg: 'bg-gray-100', text: 'text-gray-500' },
  }
  const p = PRIORITY_MAP[priority] || { label: priority, bg: 'bg-gray-100', text: 'text-gray-500' }
  return <span className={`text-xs px-2 py-0.5 rounded ${p.bg} ${p.text}`}>{p.label}</span>
}

function ProgressBar({ done, total, color = 'bg-green-400' }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + fmt(d.count), 0)
  if (total === 0) return <p className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu</p>
  const COLORS = { todo: '#fb923c', in_progress: '#facc15', pending: '#a78bfa', done: '#4ade80' }
  const STATUS_MAP = { todo: 'Cần làm', in_progress: 'Đang làm', pending: 'Chờ duyệt', done: 'Hoàn thành' }
  const R = 60; const cx = 80; const cy = 80
  let cumAngle = -Math.PI / 2
  const slices = data.map(d => {
    const val = fmt(d.count)
    const angle = (val / total) * 2 * Math.PI
    const x1 = cx + R * Math.cos(cumAngle)
    const y1 = cy + R * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + R * Math.cos(cumAngle)
    const y2 = cy + R * Math.sin(cumAngle)
    return {
      path: `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`,
      color: COLORS[d.status] || '#d1d5db',
      label: STATUS_MAP[d.status] || d.status,
      count: val,
    }
  })
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth="2" />)}
        <circle cx={cx} cy={cy} r="36" fill="white" />
        <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="18" fontWeight="600" fill="#111827">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9ca3af">tasks</text>
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600">{s.label}</span>
            <span className="font-semibold text-gray-800 ml-auto pl-4">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchStats = async () => {
    if (!token) return
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [token])

  if (loading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Đang tải dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={fetchStats} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Thử lại</button>
          </div>
        </div>
      </div>
    )
  }

  const ov = stats.overview

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống CRM</p>
          </div>
          <button onClick={fetchStats} className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
            ↻ Làm mới
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Tổng công việc"  value={fmt(ov.total_tasks)}      sub={`${fmt(ov.tasks_done)} đã hoàn thành`} color="blue"   />
          <StatCard label="Nhân viên"        value={fmt(ov.total_employees)}  sub="Đang hoạt động"                         color="purple" />
          <StatCard label="Khách hàng"       value={fmt(ov.total_customers)}  sub="Trong hệ thống"                         color="green"  />
          <StatCard label="Quá hạn"          value={fmt(ov.overdue_tasks)}    sub="Cần xử lý ngay"                         color={fmt(ov.overdue_tasks) > 0 ? 'red' : 'green'} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Cần làm"    value={fmt(ov.tasks_todo)}        color="orange" />
          <StatCard label="Đang làm"   value={fmt(ov.tasks_in_progress)} color="yellow" />
          <StatCard label="Chờ duyệt"  value={fmt(ov.tasks_pending)}     color="purple" />
          <StatCard label="Hoàn thành" value={fmt(ov.tasks_done)}        color="green"  />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>Phân bổ theo trạng thái</SectionTitle>
            <DonutChart data={stats.by_status} />
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>Phân bổ theo độ ưu tiên</SectionTitle>
            <div className="space-y-4 mt-2">
              {stats.by_priority.map(p => {
                const total = fmt(ov.total_tasks)
                const count = fmt(p.count)
                const pct   = total > 0 ? Math.round((count / total) * 100) : 0
                const PRIORITY_MAP = { high: { label: 'Cao', bg: 'bg-red-100', text: 'text-red-600' }, medium: { label: 'Trung bình', bg: 'bg-blue-100', text: 'text-blue-600' }, low: { label: 'Thấp', bg: 'bg-gray-100', text: 'text-gray-500' } }
                const pr = PRIORITY_MAP[p.priority] || {}
                const barColor = p.priority === 'high' ? 'bg-red-400' : p.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-300'
                return (
                  <div key={p.priority}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${pr.bg} ${pr.text}`}>{pr.label || p.priority}</span>
                      <span className="text-gray-700 font-semibold">{count} tasks</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>Top nhân viên theo công việc</SectionTitle>
            {stats.top_employees.length === 0 ? <p className="text-gray-400 text-sm">Chưa có dữ liệu</p> : (
              <div className="space-y-4">
                {stats.top_employees.map((emp, i) => (
                  <div key={emp.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">{emp.name}</p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{fmt(emp.total_tasks)} tasks</span>
                        </div>
                        {emp.role && <p className="text-xs text-gray-400">{emp.role}</p>}
                      </div>
                    </div>
                    <div className="ml-10">
                      <ProgressBar done={fmt(emp.tasks_done)} total={fmt(emp.total_tasks)} />
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-green-600">{fmt(emp.tasks_done)} done</span>
                        <span className="text-xs text-orange-500">{fmt(emp.tasks_open)} open</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>Top khách hàng theo công việc</SectionTitle>
            {stats.top_customers.length === 0 ? <p className="text-gray-400 text-sm">Chưa có dữ liệu</p> : (
              <div className="space-y-4">
                {stats.top_customers.map((c, i) => (
                  <div key={c.id}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{fmt(c.total_tasks)} tasks</span>
                        </div>
                        {c.company && <p className="text-xs text-gray-400">{c.company}</p>}
                      </div>
                    </div>
                    <div className="ml-10">
                      <ProgressBar done={fmt(c.tasks_done)} total={fmt(c.total_tasks)} color="bg-green-400" />
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-green-600">{fmt(c.tasks_done)} done</span>
                        <span className="text-xs text-orange-500">{fmt(c.tasks_open)} open</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>
              Tasks quá hạn
              {fmt(ov.overdue_tasks) > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{fmt(ov.overdue_tasks)}</span>
              )}
            </SectionTitle>
            {stats.overdue_tasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-400 text-sm">Không có task quá hạn</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.overdue_tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        <span className="text-xs text-red-500">Quá {fmt(t.days_overdue)} ngày</span>
                      </div>
                      {t.employee_name && <p className="text-xs text-gray-400 mt-1">👤 {t.employee_name}</p>}
                    </div>
                    <div className="text-xs text-red-400 flex-shrink-0">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <SectionTitle>Tasks mới nhất</SectionTitle>
            {stats.recent_tasks.length === 0 ? <p className="text-gray-400 text-sm">Chưa có task nào</p> : (
              <div className="space-y-3">
                {stats.recent_tasks.map(t => (
                  <div key={t.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                      {t.employee_name && <p className="text-xs text-gray-400 mt-1">👤 {t.employee_name}</p>}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
