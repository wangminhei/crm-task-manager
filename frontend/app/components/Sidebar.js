'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',             label: '📋 Công việc'   },
  { href: '/employees',    label: '👥 Nhân viên'   },
  { href: '/customers',    label: '🤝 Khách hàng'  },
  { href: '/tasks/new',    label: '➕ Tạo task'     },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">

      {/* LOGO */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-lg font-bold tracking-wide">CRM Manager</h2>
        <p className="text-xs text-gray-400 mt-1">Quản lý công việc</p>
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

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">v1.0.0</p>
      </div>

    </aside>
  )
}
