import React from 'react'
import { Link } from 'react-router-dom'

export default function NotAuthorized() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-semibold mb-2">403 — Tidak Diizinkan</h1>
      <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
      <Link to="/" className="text-[#E60012] hover:underline">Kembali ke Beranda</Link>
    </div>
  )
}