import React from 'react'

export function RadialProgress({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const radius = 36
  const stroke = 8
  const norm = radius - stroke / 2
  const circumference = 2 * Math.PI * norm
  const offset = circumference - (pct / 100) * circumference
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={norm} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx="50" cy="50" r={norm}
        stroke="#2C5CC5"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" dominantBaseline="middle" textAnchor="middle" className="text-sm" fill="#111827" fontWeight="700">
        {current}/{total}
      </text>
      <text x="50" y="65" dominantBaseline="middle" textAnchor="middle" className="text-[10px]" fill="#6b7280">
        Modul
      </text>
    </svg>
  )
}
