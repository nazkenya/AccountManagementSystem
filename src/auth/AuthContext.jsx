/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { ALL_ROLES } from './roles'

const STORAGE_KEY = 'auth.user'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load from localStorage on boot
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore corrupted storage
    }
    setLoading(false)
  }, [])

  // Persist to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // Fake login without backend
  async function login({ username, role }) {
    if (!username) throw new Error('Username required')
    if (!ALL_ROLES.includes(role)) throw new Error('Invalid role')
    const me = { id: crypto.randomUUID(), name: username, role }
    setUser(me)
    return me
  }

  async function logout() {
    setUser(null)
  }

  const switchRole = useCallback((role) => {
    if (!user) return
    if (!ALL_ROLES.includes(role)) return
    setUser((prev) => (prev ? { ...prev, role } : prev))
  }, [user])

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      loading,
      login,
      logout,
      switchRole,
      isAuthenticated: !!user,
      hasRole: (allowed) => {
        if (!user?.role) return false
        const arr = Array.isArray(allowed) ? allowed : [allowed]
        return arr.includes(user.role)
      },
    }),
    [user, loading, switchRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}