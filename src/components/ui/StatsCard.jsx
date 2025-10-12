import React from 'react'

export default function StatsCard({ label, value, icon: Icon, className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1]/20 via-[#7C3AED]/20 to-[#EC4899]/20 text-[#2E3048] flex items-center justify-center shadow-sm">
          <Icon className="text-xl" />
        </div>
      )}
      <div className="flex-1">
        <div className="text-sm text-neutral-500 font-medium mb-1">{label}</div>
  <div className="text-2xl font-semibold text-neutral-800">{value}</div>
      </div>
    </div>
  )
}
