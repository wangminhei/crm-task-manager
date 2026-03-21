'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { href: '/dashboard', label: '📊 Dashboard'  },
  { href: '/',          label: '📋 Công việc'  },
  { href: '/employees', label: '👥 Nhân viên'  },
  { href: '/customers', label: '🤝 Khách hàng' },
  { href: '/tasks/new', label: '➕ Tạo task'    },
]

export default function Sidebar() {
  const pathname        = usePathname()
  const router          = useRouter()
  const { user, logout, isAdmin, ready } = useAuth()

  // Redirect về login nếu chưa đăng nhập
  useEffect(() => {
    if (ready && !user) {
      router.push('/login')
    }
  }, [ready, user])

  if (!user) return null

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-lg font-bold tracking-wide">CRM Manager</h2>
        <p className="text-xs text-gray-400 mt-1">Quản lý công việc</p>
      </div>

      {/* USER INFO */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
            ${isAdmin ? 'bg-yellow-500 text-yellow-900' : 'bg-blue-500 text-white'}`}>
            {user.full_name?.charAt(0) || user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name || user.username}</p>
            <p className={`text-xs ${isAdmin ? 'text-yellow-400' : 'text-blue-400'}`}>
              {isAdmin ? '👑 Admin' : '🔧 Kỹ thuật'}
            </p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-3 py-4 border-t border-gray-700 space-y-2">
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400
            hover:bg-red-600 hover:text-white transition-colors"
        >
          🚪 Đăng xuất
        </button>
        <p className="text-xs text-gray-600 px-3">v1.0.0</p>
      </div>

    </aside>
  )
}
