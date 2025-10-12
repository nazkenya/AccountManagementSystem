import React from 'react'

// Simple 4-step indicator for the validation flow
// Props: current (1..4)
export default function FlowSteps({ current = 1 }) {
  const steps = [
    { id: 1, label: 'ATM' },
    { id: 2, label: 'CA' },
    { id: 3, label: 'TEMP' },
    { id: 4, label: 'Generate' },
  ]
  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200 p-3">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => {
          const active = s.id === current
          const done = s.id < current
          return (
            <li key={s.id} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 grid place-items-center rounded-full border text-xs font-semibold ${
                active
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : done
                  ? 'bg-[#EDE9FE] text-[#7C3AED] border-[#C4B5FD]'
                  : 'bg-white text-neutral-400 border-neutral-300'
              }`}>
                {s.id}
              </div>
              <span className={`text-sm ${active ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>{s.label}</span>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-px bg-neutral-200 mx-2" />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
