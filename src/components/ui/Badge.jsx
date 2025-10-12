import React from 'react'

export function Badge({ children, variant = 'neutral', className = '' }) {
  const styles = {
    success: 'bg-green-100 text-green-700 ring-1 ring-green-200',
    danger: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    info: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    neutral: 'bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
