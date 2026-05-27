// client/src/context/AuthContext.jsx
// Very small auth state manager using React Context.
// Stores token + user in localStorage so the login persists on refresh.

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Load saved auth state once.
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken) setToken(savedToken)
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }

    setInitializing(false)
  }, [])

  async function register({ name, email, password }) {
    const data = await authService.register({ name, email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  async function login({ email, password }) {
    const data = await authService.login({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, token, initializing, login, register, logout, isAuthenticated: !!token }),
    [user, token, initializing]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
