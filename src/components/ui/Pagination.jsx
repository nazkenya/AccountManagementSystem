import React from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Pagination({
  page = 1,
  onPrev,
  onNext,
  rowsPerPage = 10,
  onRowsPerPageChange,
}) {
  return (
    <div className="flex items-center gap-4 text-sm text-neutral-600">
      <span className="font-medium">Baris per halaman</span>
      <select
        className="border-2 border-neutral-200 rounded-lg px-3 py-1.5 bg-white transition-all duration-200 focus:border-[#E60012] focus:ring-2 focus:ring-[#E60012]/20 focus:outline-none hover:border-neutral-300 cursor-pointer"
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
      >
        {[10, 20, 50].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onPrev}
          aria-label="Previous page"
        >
          <FaChevronLeft className="text-neutral-600" />
        </button>
        <div className="min-w-[2rem] h-9 bg-gradient-to-r from-[#E60012] to-[#B00010] text-white rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm">
          {page}
        </div>
        <button
          type="button"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
          aria-label="Next page"
        >
          <FaChevronRight className="text-neutral-600" />
        </button>
      </div>
    </div>
  )
}