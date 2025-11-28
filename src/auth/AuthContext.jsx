import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../api'

const STORAGE_KEY = 'auth.user'
const API_URL = 'http://localhost:8000/api'
const AuthContext = createContext(null)

function normalizeRole(raw) {
  if (raw === undefined || raw === null) return null
  let s = String(raw).trim()
  // hapus prefix umum seperti 'role_', 'role-' atau 'ROLE ' sehingga
  // 'ROLE_STAFF', 'role-staff' atau 'Role staff' -> 'staff'
  s = s.replace(/^role[_\-\s]*/i, '')
  return s.toLowerCase()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  async function bootstrap() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    let stored = null;
    try {
      stored = JSON.parse(raw);
      console.debug('[AuthProvider] bootstrap stored from localStorage:', stored)
    } catch (e) {
      console.warn('[AuthProvider] gagal parse auth.user:', e);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    if (!stored?.token) {
      console.warn('[AuthProvider] tidak ada token di auth.user');
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    try { localStorage.removeItem('token'); } catch (e) {}
    try { localStorage.removeItem('auth.token'); } catch (e) {}

    setAuthToken(stored.token);
    console.debug('[AuthProvider] setAuthToken with token from stored')

    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${stored.token}` },
      });

      if (!res.ok) throw new Error('fetch user gagal');

      const data = await res.json();
      console.debug('[AuthProvider] /user response:', data)
      // ambil role dari beberapa kemungkinan lokasi response
      const roleFromApi = data.role ?? data.user?.role ?? data.ROLE ?? data.user?.ROLE ?? stored.role ?? null
      const normalized = normalizeRole(roleFromApi)
      console.debug('[AuthProvider] resolved role:', roleFromApi, '->', normalized)
      setUser({ ...stored, role: normalized });
    } catch (err) {
      console.warn('[AuthProvider] gagal verifikasi token:', err);
      localStorage.removeItem(STORAGE_KEY);
    }

    setLoading(false);
  }

  bootstrap();
}, []);

  async function login({ username, password }) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) throw new Error('Login gagal. Periksa username/password')

    const data = await res.json()

    const me = {
      id: data.user?.id,
      username: data.user?.username,
      role: normalizeRole(data.user?.role ?? data.role ?? null),
      token: data.token,
    }
    console.debug('[AuthProvider] login success, me:', me)

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

  const hasRole = (roles) => {
    if (!user?.role) return false
    const current = normalizeRole(user.role)
    const arr = Array.isArray(roles) ? roles : [roles]
    const allowed = arr.map((r) => normalizeRole(r))
    const ok = allowed.includes(current)
    console.debug('[AuthProvider] hasRole check:', { current, allowed, ok })
    return ok
  }

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
