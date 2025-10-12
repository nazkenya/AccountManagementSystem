import React from 'react'

export function ProgressBar({ value = 0, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, value))
  const heightClass = size === 'lg' ? 'h-3.5' : size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={`w-full ${heightClass} bg-neutral-200 rounded-full overflow-hidden`}>
      <div className="h-full bg-[#E60012] rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}
