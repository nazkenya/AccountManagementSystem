import React from 'react'
import clsx from 'clsx'

/**
 * variant: 'blue' | 'purple'
 */
export default function Tag({ children, variant = 'blue', className }) {
  const classes =
    variant === 'purple'
      ? 'bg-[#F3E8FF] text-[#6D28D9]'
      : 'bg-[#E9F2FF] text-[#2C5CC5]'

  return (
    <span
      className={clsx(
        'inline-block text-[11px] font-semibold px-2 py-0.5 rounded ml-2',
        classes,
        className
      )}
    >
      {children}
    </span>
  )
}