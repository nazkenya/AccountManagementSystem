import React from 'react'

export default function YesNoToggle({ value, onChange, size = 'sm', className = '', ariaLabel = 'Pilihan Ya/Tidak' }) {
  const base = size === 'sm' ? 'text-[12px] h-9' : 'text-sm h-10'
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-neutral-200 overflow-hidden bg-white ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={`${base} px-3 ${!value ? 'bg-blue-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
        aria-label={`${ariaLabel}: Tidak`}
        title={`${ariaLabel}: Tidak`}
        onClick={() => onChange?.(false)}
      >Tidak</button>
      <button
        type="button"
        className={`${base} px-3 border-l border-neutral-200 ${value ? 'bg-blue-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'}`}
        aria-label={`${ariaLabel}: Ya`}
        title={`${ariaLabel}: Ya`}
        onClick={() => onChange?.(true)}
      >Ya</button>
    </div>
  )
}
