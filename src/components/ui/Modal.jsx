import React from 'react'

export default function Modal({ open, onClose, title, children, footer, panelClassName = '' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${panelClassName || 'max-w-md'} bg-white rounded-2xl shadow-2xl ring-1 ring-neutral-200 overflow-hidden animate-slide-up`}>
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
            <button
              className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-4 text-sm text-neutral-700">{children}</div>
          {footer && (
            <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50">{footer}</div>
          )}
        </div>
      </div>
    </div>
  )
}
