import React from 'react'

/**
 * Unified Button component
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'back'
 * - size: 'sm' | 'md' | 'lg'
 * - fullWidth: boolean
 * - isLoading: boolean
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  type = 'button',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const variants = {
    // Primary action: shift to soft CRM blue
    primary: 'bg-[#2C5CC5] text-white hover:bg-[#234AA0] active:bg-[#1C3A80] focus:ring-[#2C5CC5]/30 shadow-sm hover:shadow',
    // Secondary: subtle blue outline
    secondary: 'bg-white border border-neutral-300 text-neutral-800 hover:border-[#2C5CC5] hover:text-neutral-900 focus:ring-[#2C5CC5]/20 shadow-sm',
    // Ghost: subtle text button with hover surface
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-[#7C3AED]/20',
    // Back: gentle neutral treatment for navigation/back actions
    back: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 active:bg-neutral-200 focus:ring-neutral-300/30 shadow-sm',
    // Semantic variants
    success: 'bg-[#2ECC71] text-white hover:bg-[#27AE60] focus:ring-[#2ECC71]/30 shadow-sm',
    danger: 'bg-[#E74C3C] text-white hover:bg-[#C0392B] focus:ring-[#E74C3C]/30 shadow-sm',
  }

  const spinner = (
    <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  return (
    <button
      className={[
        base,
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        fullWidth ? 'w-full' : '',
        isLoading ? 'cursor-progress opacity-75' : '',
        className,
      ].join(' ').trim()}
      aria-busy={isLoading || undefined}
      disabled={isLoading || props.disabled}
      type={type}
      {...props}
    >
      {isLoading && spinner}
      {children}
    </button>
  )
}
