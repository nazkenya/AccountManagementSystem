import React, { useMemo, useState } from 'react'
import Card from '@components/ui/Card'
import PageHeader from '@components/ui/PageHeader'
import Table from '@components/ui/Table'
import Pagination from '@components/ui/Pagination'
import SearchInput from '@components/ui/SearchInput'
import Select from '@components/ui/Select'
import StatsCard from '@components/ui/StatsCard'
import mockAMs from '@/data/mockAMs'
import { FaUsers, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa'

export default function AccountManagers() {
  const [filter, setFilter] = useState({ q: '', region: '', witel: '' })
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const regions = useMemo(() => [...new Set(mockAMs.map((m) => m.region))], [])
  const witels = useMemo(() => [...new Set(mockAMs.map((m) => m.witel))], [])

  const filtered = useMemo(() => {
    return mockAMs.filter((m) => {
      if (filter.region && m.region !== filter.region) return false
      if (filter.witel && m.witel !== filter.witel) return false
      if (filter.q) {
        const q = filter.q.toLowerCase()
        return (
          m.id_sales.toLowerCase().includes(q) ||
          m.nik_am.toLowerCase().includes(q) ||
          m.nama_am.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [filter])

  const total = filtered.length
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, total)
  const pageRows = filtered.slice(startIndex, endIndex)

  const columns = [
    { key: 'id_sales', label: 'ID_SALES' },
    { key: 'nik_am', label: 'NIK_AM' },
    {
      key: 'nama_am',
      label: 'NAMA_AM',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1]/25 via-[#7C3AED]/25 to-[#EC4899]/25 flex items-center justify-center text-[#2E3048] font-semibold text-xs">
            {row.nama_am.charAt(0)}
          </div>
          <span className="font-medium">{row.nama_am}</span>
        </div>
      ),
    },
    { key: 'region', label: 'REGION' },
    { key: 'witel', label: 'WITEL' },
  ]

  const stats = [
    { label: 'Total Account Managers', value: mockAMs.length.toLocaleString(), icon: FaUsers },
    { label: 'Regions', value: regions.length.toString(), icon: FaMapMarkerAlt },
    { label: 'Witels', value: witels.length.toString(), icon: FaBuilding },
  ]

  const onPrev = () => setPage((p) => Math.max(1, p - 1))
  const onNext = () => setPage((p) => (endIndex < total ? p + 1 : p))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Managers"
        subtitle="Daftar Account Manager di wilayah Anda"
        icon={FaUsers}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <Card className="bg-white">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <SearchInput
              value={filter.q}
              onChange={(v) => setFilter((s) => ({ ...s, q: v }))}
              placeholder="Search ID, NIK or Name..."
            />

            <Select
              value={filter.region}
              onChange={(e) => setFilter((s) => ({ ...s, region: e.target.value }))}
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>

            <Select
              value={filter.witel}
              onChange={(e) => setFilter((s) => ({ ...s, witel: e.target.value }))}
            >
              <option value="">All Witels</option>
              {witels.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of{' '}
              <span className="font-semibold text-neutral-700">{mockAMs.length}</span> account managers
            </p>
          </div>
        </div>
      </Card>

      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Card className="p-0 overflow-hidden ring-1 ring-neutral-200">
          <Table columns={columns} data={pageRows} rowKey={(r) => r.id_sales} />
        </Card>
      </div>

      <Card className="bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-neutral-600">
            <span className="text-neutral-800 font-semibold">
              {total === 0 ? 0 : startIndex + 1}-{endIndex}
            </span>
            <span> dari {total} Account Manager</span>
          </div>

          <Pagination
            page={page}
            onPrev={onPrev}
            onNext={onNext}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n)
              setPage(1)
            }}
          />
        </div>
      </Card>
    </div>
  )
}
