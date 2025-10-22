import React from 'react'

export const Field = ({ idFor, label, children, hint, required, className = '', stacked = false }) => (
  <div className={`grid ${stacked ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-[180px_1fr] gap-3 sm:gap-6'} items-start py-2.5 ${className}`}>
    <label htmlFor={idFor} className="text-sm text-neutral-500 font-normal leading-relaxed">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="space-y-1 min-w-0">
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  </div>
)

export const Group = ({ title, description, children, gridClassName = '' }) => (
  <div className="space-y-4 pt-5 border-t border-neutral-200 first:pt-0 first:border-t-0">
    {title && (
      <div className="flex items-baseline justify-between mb-1">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" aria-hidden />
          {title}
        </div>
        {description && <div className="text-xs text-neutral-400">{description}</div>}
      </div>
    )}
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 ${gridClassName}`}>
      {children}
    </div>
  </div>
)
