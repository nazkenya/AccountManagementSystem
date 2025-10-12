import React from 'react'

export default function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="text-center py-10">
  <div className="text-base font-medium text-neutral-800">{title}</div>
  {description && <div className="text-sm text-neutral-500 mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
