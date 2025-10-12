import React from 'react'

export default function Select({ value, onChange, children, className = '', ...props }) {
  return (
    <select
      className={`border-2 border-neutral-200 rounded-lg px-4 py-2.5 text-sm bg-white transition-all duration-200 focus:border-[#E60012] focus:ring-2 focus:ring-[#E60012]/20 focus:outline-none hover:border-neutral-300 cursor-pointer ${className}`}
      value={value}
      onChange={onChange}
      {...props}
    >
      {children}
    </select>
  )
}
