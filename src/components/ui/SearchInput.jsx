import React from 'react'
import { FaSearch } from 'react-icons/fa'

export default function SearchInput({ value, onChange, placeholder = 'Cari Pelanggan' }) {
  return (
    <label className="flex items-center gap-3 border-2 border-neutral-200 rounded-lg px-4 max-w-md w-full bg-white transition-all duration-200 focus-within:border-[#E60012] focus-within:ring-2 focus-within:ring-[#E60012]/20 hover:border-neutral-300">
      <FaSearch className="text-neutral-400 text-sm" aria-hidden="true" />
      <input
        className="w-full py-2.5 outline-none text-sm bg-transparent placeholder:text-neutral-400"
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}