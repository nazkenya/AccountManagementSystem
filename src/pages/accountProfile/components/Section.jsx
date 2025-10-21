import React from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

export function Section({ id, title, icon: Icon, isEmpty = false, collapsed = false, onToggle, headerRight, children, summary }) {
  const contentRef = React.useRef(null)
  const [maxHeight, setMaxHeight] = React.useState('0px')

  const recalc = React.useCallback(() => {
    if (!collapsed) return
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight
      setMaxHeight(collapsed ? '0px' : `${h}px`)
    }
  }, [collapsed])

  React.useEffect(() => { if (collapsed) recalc() }, [recalc, children, collapsed])
  React.useEffect(() => {
    const onR = () => recalc()
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [recalc])

  return (
    <section id={id} className="scroll-mt-[90px] px-2 sm:px-4">
      <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
        <div className="py-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-[#F0F6FF] text-[#2C5CC5] grid place-items-center ring-1 ring-[#CFE0FF]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        <div className="py-1.5 flex items-center gap-2 min-w-0 relative z-10">
          <h2 id={`${id}-header`} className="text-[15px] md:text-base font-semibold leading-tight text-neutral-900">{title}</h2>
          {isEmpty && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F6FF] text-[#2C5CC5] ring-1 ring-[#CFE0FF]">Empty</span>
          )}
          {collapsed && summary ? (
            <span className="text-xs text-neutral-500 truncate max-w-[45%] sm:max-w-[55%]">• {summary}</span>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {headerRight}
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
              aria-label={collapsed ? 'Expand section' : 'Collapse section'}
              aria-expanded={!collapsed}
              aria-controls={`${id}-content`}
            >
              {collapsed ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="col-start-2">
          <div
            ref={contentRef}
            style={collapsed ? { maxHeight, transition: 'max-height 250ms ease, opacity 200ms ease, transform 200ms ease' } : { transition: 'opacity 200ms ease, transform 200ms ease' }}
            aria-hidden={collapsed}
            id={`${id}-content`}
            role="region"
            aria-labelledby={`${id}-header`}
            className={`relative z-0 pr-1 sm:pr-2 ${collapsed ? 'overflow-hidden' : ''} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5CC5] ${isEmpty ? 'ring-1 ring-[#CFE0FF] rounded-lg' : ''} ${collapsed ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}
          >
            <div className="pt-2" />
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
