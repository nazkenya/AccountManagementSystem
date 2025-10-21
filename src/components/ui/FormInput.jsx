import React from 'react'
import Select from './Select'

/**
 * Unified form input used across the app.
 * Props:
 * - type: 'text' | 'textarea' | 'date' | 'select'
 * - value, onChange, disabled, placeholder
 * - options: string[] (for select)
 * - datalistId: string (for text)
 * - suggestions: string[] (chips below textarea)
 */
export default function FormInput({
  type = 'text',
  value,
  onChange,
  disabled,
  placeholder = '',
  options = [],
  datalistId,
  suggestions = [],
  className = '',
  error = false,
  size = 'md', // 'sm' | 'md'
  ...rest
}) {
  const textSize = size === 'sm' ? 'text-[13px]' : 'text-sm'
  const pad = size === 'sm' ? 'px-3 py-2.5' : 'px-4 py-2.5'
  const borderW = size === 'sm' ? 'border' : 'border-2'
  const base = `w-full rounded-lg ${textSize} bg-white transition-all duration-200 disabled:bg-neutral-50 focus:outline-none`
  const field = `${pad} ${borderW} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:border-[#E60012] focus:ring-2 focus:ring-[#E60012]/20 hover:border-neutral-300'}`

  if (type === 'select') {
    return (
      <Select
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`${base} ${field} ${className}`}
        {...rest}
      >
        <option value="">Pilih...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    )
  }

  if (type === 'textarea') {
    return (
      <div>
        <textarea
          className={`${base} ${field} resize-y ${size === 'sm' ? 'min-h-[38px]' : 'min-h-[42px]'} ${className}`}
          disabled={disabled}
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          {...rest}
        />
        {Array.isArray(suggestions) && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="px-3 py-1 rounded-full border text-xs text-neutral-600 bg-white hover:bg-neutral-50 border-neutral-200"
                onClick={() => {
                  const current = String(value || '')
                  const lowerSet = current
                    .split(',')
                    .map((x) => x.trim().toLowerCase())
                    .filter(Boolean)
                  if (!lowerSet.includes(s.toLowerCase())) onChange?.(current ? current + ', ' + s : s)
                }}
                disabled={disabled}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (type === 'date') {
    return (
      <input
        type="date"
        className={`${base} ${field} ${className}`}
        disabled={disabled}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
    )
  }

  // default text
  return (
    <input
      type="text"
      list={datalistId}
      className={`${base} ${field} ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      {...rest}
    />
  )
}
