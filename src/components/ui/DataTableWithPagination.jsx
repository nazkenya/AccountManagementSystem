import React from 'react'
import Card from './Card'
import Table from './Table'
import Pagination from './Pagination'
import SearchInput from './SearchInput'
import Toolbar from './Toolbar'

export default function DataTableWithPagination({
  columns,
  data,
  rowKey,
  renderCell,
  onRowClick,
  emptyMessage,
  className,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  // Optional header content
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Filter text... ',
  headerRight,
}) {
  const total = data.length
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, total)
  const pageRows = data.slice(startIndex, endIndex)

  return (
    <Card className={className}>
      {(onSearchChange || headerRight) && (
        <div className="mb-3">
          <Toolbar className="justify-between">
            <div className="flex-1 max-w-md">
              {onSearchChange && (
                <SearchInput value={searchValue || ''} onChange={onSearchChange} placeholder={searchPlaceholder} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          </Toolbar>
        </div>
      )}

      <Table
        columns={columns}
        data={pageRows}
        rowKey={rowKey}
        renderCell={renderCell}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
      />
      <div className="mt-4">
        <Pagination
          page={page}
          rowsPerPage={rowsPerPage}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => (endIndex < total ? p + 1 : p))}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n)
            setPage(1)
          }}
        />
      </div>
    </Card>
  )
}
