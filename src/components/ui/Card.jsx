import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  )
}
