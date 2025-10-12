import React from 'react'

export default function Toolbar({ children, className = '' }) {
  return (
    <div className={`flex flex-col md:flex-row gap-3 md:gap-4 md:items-center ${className}`}>
      {children}
    </div>
  )
}
