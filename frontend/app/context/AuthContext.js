'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem('crm_token')
    const savedUser  = localStorage.getItem('crm_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setReady(true)
  }, [])

  const login = (token, user) => {
    localStorage.setItem('crm_token', token)
    localStorage.setItem('crm_user',  JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('crm_token')
    localStorage.removeItem('crm_user')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  const isAdmin = user?.role === 'admin'
  const isTech  = user?.role === 'tech'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isTech, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
