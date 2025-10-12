import React from 'react'

/**
 * PageHeader
 * - Simple: compact title/subtitle row
 * - Hero: reusable gradient header card with icon, consistent across pages
 */
export default function PageHeader({
  title,
  subtitle,
  right,
  icon: Icon,
  variant = 'simple', // 'simple' | 'hero'
  className = '',
}) {
  if (variant === 'hero') {
    // Render a minimal header (same style as simple), ignoring hero visuals
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                <Icon className="text-lg" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-[28px] font-semibold">{title}</h1>
              {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {right}
        </div>
      </div>
    )
  }

  // simple (default)
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}
