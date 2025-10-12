import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireRole({ allowed }) {
  const { hasRole } = useAuth()
  if (!allowed || allowed.length === 0) return <Outlet />
  if (!hasRole(allowed)) return <Navigate to="/403" replace />
  return <Outlet />
}