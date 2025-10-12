import React from 'react'

export function Tabs({ tabs = [], activeKey, onChange, color = 'red' }) {
  const colorMap = {
    red: 'text-[#E60012] border-[#E60012]',
    blue: 'text-[#2C5CC5] border-[#2C5CC5]',
    violet: 'text-[#7C3AED] border-[#7C3AED]',
  }
  const activeColor = colorMap[color] || colorMap.red
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              t.key === activeKey
                ? `${activeColor} border-b-2`
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
