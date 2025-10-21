import React from 'react'
import { FaSearch } from 'react-icons/fa'

export default function SearchInput({ value, onChange, placeholder = 'Cari Pelanggan', autoFocus = false, variant = 'default' }) {
  const base = 'flex items-center gap-3 rounded-lg px-4 max-w-md w-full bg-white transition-all duration-200'
  const styles = variant === 'subtle'
    ? 'border border-neutral-200 focus-within:ring-1 focus-within:ring-blue-200 hover:border-neutral-300'
    : 'border-2 border-neutral-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-200 hover:border-neutral-300'
  return (
    <label className={`${base} ${styles}`}>
      <FaSearch className="text-neutral-400 text-sm" aria-hidden="true" />
      <input
        className="w-full py-2.5 outline-none text-sm bg-transparent placeholder:text-neutral-400"
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </label>
  )
}