import React from 'react'
import Modal from './Modal'
import SearchInput from './SearchInput'

/**
 * PickerModal: reusable searchable picker modal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title: string
 * - items: Array<{ key: string, title: string, subtitle?: string }>
 * - onSelect: (key: string) => void
 * - emptyText?: string
 */
export default function PickerModal({ open, onClose, title = 'Select', items = [], onSelect, emptyText = 'No results', isItemDisabled }) {
  const [query, setQuery] = React.useState('')
  const listRef = React.useRef(null)
  const [active, setActive] = React.useState(0)
  const containerRef = React.useRef(null)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => it.title.toLowerCase().includes(q) || (it.subtitle && it.subtitle.toLowerCase().includes(q)))
  }, [items, query])

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  const onKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = filtered[active]
      if (it) onSelect?.(it.key)
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }

  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx='${active}']`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [active, filtered.length])

  // Group items by optional `group` property to render section headers
  const grouped = React.useMemo(() => {
    const map = new Map()
    for (const it of filtered) {
      const g = it.group || 'default'
      if (!map.has(g)) map.set(g, [])
      map.get(g).push(it)
    }
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }))
  }, [filtered])

  return (
    <Modal open={open} onClose={onClose} title={title} panelClassName="max-w-lg">
      <div className="space-y-3" onKeyDown={onKeyDown} ref={containerRef}>
        <div className="sticky top-0 z-10 bg-white pt-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Cari" autoFocus variant="subtle" />
        </div>
        <div ref={listRef} className="max-h-80 overflow-auto rounded-2xl border border-neutral-200 p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 grid place-items-center text-neutral-400 mb-3">☹️</div>
              <div className="text-sm text-neutral-600">{emptyText}</div>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(({ group, items }, gi) => (
                <div key={group + gi} className="space-y-2">
                  {group !== 'default' && (
                    <div className="px-2 text-[11px] font-medium uppercase text-neutral-500">{group}</div>
                  )}
                  {items.map((it, idx) => (
                    <button
                      key={it.key}
                      data-idx={idx}
                      type="button"
                      aria-disabled={isItemDisabled?.(it.key) || false}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 rounded-xl border ${isItemDisabled?.(it.key)
                        ? 'border-neutral-200 opacity-60 cursor-not-allowed'
                        : active === idx
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'border-neutral-200 hover:bg-neutral-50'}`}
                      onClick={() => {
                        if (isItemDisabled?.(it.key)) return
                        onSelect?.(it.key)
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-xs ring-1 ring-blue-100 flex-shrink-0">
                        {it.title?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-neutral-900 truncate">{it.title}</div>
                        {it.subtitle && (
                          <div className="text-xs text-neutral-500 mt-0.5 truncate">{it.subtitle}</div>
                        )}
                      </div>
                      {isItemDisabled?.(it.key) && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">Sudah dipilih</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
