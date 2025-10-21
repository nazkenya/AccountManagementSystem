import React from 'react'
import FormInput from './FormInput'
import Button from './Button'
import YesNoToggle from './YesNoToggle'

/**
 * Reusable add-task row.
 * Props:
 * - value: { title: string, requiresCustomer: boolean }
 * - onChange: (draft) => void
 * - onAdd: () => void
 * - size: 'sm' | 'md'
 * - className: string
 * - label: left label text for toggle (default: 'Butuh customer?')
 */
export default function TaskAddRow({ value = { title: '', requiresCustomer: false }, onChange, onAdd, size = 'md', className = '', label = 'Butuh customer?' }) {
  const isSm = size === 'sm'
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="text-[12px] text-neutral-600">{label}</span>
        <YesNoToggle
          value={!!value?.requiresCustomer}
          onChange={(v) => onChange?.({ ...(value || { title: '' }), requiresCustomer: !!v })}
          ariaLabel={label}
          size={isSm ? 'sm' : 'md'}
        />
      </div>
      <FormInput
        type="text"
        placeholder="Tambah task..."
        value={value?.title || ''}
        onChange={(v) => onChange?.({ ...(value || { requiresCustomer: false }), title: v })}
        size={isSm ? 'sm' : 'md'}
        onKeyDown={(e) => { if (e.key === 'Enter') onAdd?.() }}
      />
      <Button size={isSm ? 'sm' : 'md'} variant="secondary" onClick={onAdd}>Tambah</Button>
    </div>
  )
}
