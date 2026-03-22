'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      return setError('Vui lòng nhập đầy đủ thông tin')
    }
    try {
      setLoading(true)
      setError('')
      const res = await axios.post(`${API_URL}/api/auth/login`, form)
      login(res.data.token, res.data.user)
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nhật Ký Công Việc</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <input
              type="text"
              autoComplete="username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="admin hoặc tech"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Mật khẩu</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm
                bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg
              font-medium text-sm disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>

        {/* HINT */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-600 mb-2">Tài khoản mặc định:</p>
          <p>👑 Admin: <code className="bg-gray-200 px-1 rounded">admin</code> / <code className="bg-gray-200 px-1 rounded">password</code></p>
          <p>🔧 Kỹ thuật: <code className="bg-gray-200 px-1 rounded">tech</code> / <code className="bg-gray-200 px-1 rounded">password</code></p>
        </div>

      </div>
    </div>
  )
}
