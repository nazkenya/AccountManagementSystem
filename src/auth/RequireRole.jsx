import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireRole({ allowed }) {
  const { hasRole } = useAuth()
  // debug: tunjukkan role saat ini dan allowed list
  console.debug('[RequireRole] allowed:', allowed)
  if (!allowed || allowed.length === 0) return <Outlet />
  const ok = hasRole(allowed)
  console.debug('[RequireRole] hasRole result:', ok)
  if (!ok) return <Navigate to="/403" replace />
  return <Outlet />
}