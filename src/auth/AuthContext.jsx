import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../api'

const STORAGE_KEY = 'auth.user'
const API_URL = 'http://localhost:8000/api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return setLoading(false)

      const stored = JSON.parse(raw)
      if (!stored?.token) return setLoading(false)

      setAuthToken(stored.token)

      try {
        const res = await fetch(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${stored.token}` },
        })

        if (!res.ok) throw new Error()

        const data = await res.json()
        setUser({ ...stored, role: data.role })
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }

      setLoading(false)
    }
    bootstrap()
  }, [])

  async function login({ username, password }) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) throw new Error('Login gagal. Periksa username/password')

    const data = await res.json()

    const me = {
      id: data.user.id,
      username: data.user.username,
      role: data.user.role,
      token: data.token,
    }

    setAuthToken(me.token)
    setUser(me)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(me))
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
      })
    } catch (e) {}

    setAuthToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const hasRole = (roles) =>
    user?.role && (Array.isArray(roles) ? roles : [roles]).includes(user.role)

  const value = useMemo(
    () => ({
      user,
      role: user?.role,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      hasRole,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
