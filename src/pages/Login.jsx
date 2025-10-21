import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa'
import { useAuth } from '../auth/AuthContext'
import { ALL_ROLES } from '../auth/roles'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState(ALL_ROLES[0])
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    await login({ username, role })
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements (red + brand navy) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E60012]/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#2E3048]/10 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E60012] to-[#B00010] shadow-xl mb-4">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-semibold text-neutral-800 mb-2">Account Management System</h1>
          <p className="text-neutral-500">Telkom Enterprise Solution</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 backdrop-blur-sm bg-white/95">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-800 mb-1">Welcome Back</h2>
            <p className="text-sm text-neutral-500">Sign in to continue to your dashboard</p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 mb-2 block">Username</span>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <FaUser />
                </div>
                <input
                  className="w-full border-2 border-neutral-200 rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#E60012] focus:ring-4 focus:ring-[#E60012]/10 hover:border-neutral-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700 mb-2 block">Role</span>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <FaLock />
                </div>
                <select
                  className="w-full border-2 border-neutral-200 rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#E60012] focus:ring-4 focus:ring-[#E60012]/10 hover:border-neutral-300 cursor-pointer appearance-none bg-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {/* Role preview chip (UI/UX improvement without changing palette) */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-neutral-500">You will sign in as</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-[#E60012]/30 text-[#B00010] bg-[#E60012]/10">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#E60012] to-[#B00010] text-white py-3.5 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            disabled={!username}
          >
            Sign In
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <div className="pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center leading-relaxed">
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          © 2025 Telkom Indonesia. All rights reserved.
        </p>
      </div>
    </div>
  )
}