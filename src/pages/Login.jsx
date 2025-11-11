import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login({ username, password }) 
      navigate(from, { replace: true })  
    } catch (err) {
      alert(err.message || 'Login gagal, periksa username & password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E60012]/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#2E3048]/10 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        
        {/* Logo Section */}
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

            {/* Username */}
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 mb-2 block">Username / Email</span>
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

            {/* Password */}
            <label className="block">
              <span className="text-sm font-medium text-neutral-700 mb-2 block">Password</span>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  className="w-full border-2 border-neutral-200 rounded-xl pl-11 pr-4 py-3 outline-none transition-all duration-200 focus:border-[#E60012] focus:ring-4 focus:ring-[#E60012]/10 hover:border-neutral-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </label>

          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#E60012] to-[#B00010] text-white py-3.5 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            disabled={!username || !password}
          >
            Sign In
            <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          © 2025 Telkom Indonesia. All rights reserved.
        </p>
      </div>
    </div>
  )
}
