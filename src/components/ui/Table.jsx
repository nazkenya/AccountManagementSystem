import React from 'react'

/**
 * Simple reusable Table component.
 * Props:
 * - columns: [{ key, label, render?, className?, cellClass? }]
 * - data: array of row objects
 * - rowKey: function or string key to identify row
 * - onRowClick?: fn(row)
 * - renderCell?: (row, key) => ReactNode
 * - className: wrapper className
 */
export default function Table({
  columns = [],
  data = [],
  rowKey,
  onRowClick,
  renderCell,
  className = '',
  emptyMessage = 'No records',
}) {
  const getRowKey = (row, idx) => {
    if (typeof rowKey === 'function') return rowKey(row)
    if (typeof rowKey === 'string') return row[rowKey]
    return row.id ?? row.id_sales ?? idx
  }

  const [sort, setSort] = React.useState({ key: null, dir: 'asc' })
  const sortedData = React.useMemo(() => {
    if (!sort.key) return data
    const arr = [...data]
    arr.sort((a, b) => {
      const av = a?.[sort.key]
      const bv = b?.[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return sort.dir === 'asc' ? -1 : 1
      if (bv == null) return sort.dir === 'asc' ? 1 : -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av
      }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return arr
  }, [data, sort])

  const toggleSort = (key) => {
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' }
      return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className={`overflow-auto max-h-[60vh] bg-white rounded-xl shadow-card ${className}`}>
      <table className="min-w-full text-left">
  <thead className="sticky top-0 z-10 bg-neutral-50 border-b-2 border-neutral-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key || col.label}
                className={`px-5 py-3.5 text-xs md:text-sm font-semibold text-neutral-700 uppercase tracking-wide ${col.className || ''}`}
              >
                {col.sortable ? (
                  <button
                    className="inline-flex items-center gap-1 hover:text-[#7C3AED]"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort.key === col.key ? (
                      <span className="text-[10px]">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                    ) : (
                      <span className="text-[10px] opacity-40">↕</span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center text-neutral-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {sortedData.map((row, idx) => (
            <tr
              key={getRowKey(row, idx)}
              className={`transition-colors duration-150 hover:bg-gradient-to-r hover:from-[#7C3AED]/6 hover:to-transparent ${
                idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'
              } ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key || col.label}
                  className={`px-5 py-3.5 text-sm text-neutral-700 align-top ${col.cellClass || ''}`}
                >
                  {renderCell ? renderCell(row, col.key) : col.render ? col.render(row) : row[col.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
