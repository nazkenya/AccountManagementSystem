import React, { useMemo, useState } from 'react'
import { FaUserTie, FaMapMarkerAlt, FaBuilding, FaDownload, FaFilter, FaShieldAlt, FaArrowRight } from 'react-icons/fa'
import mockAMs from '../data/mockAMs'
import SearchInput from '../components/ui/SearchInput'
import Table from '../components/ui/Table'
import Pagination from '../components/ui/Pagination'
import Card from '../components/ui/Card'
import StatsCard from '../components/ui/StatsCard'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
// import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function EcrmWorkspace() {
  // const { hasRole } = useAuth()
  const navigate = useNavigate()
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

  const onPrev = () => setPage((p) => Math.max(1, p - 1))
  const onNext = () => setPage((p) => (endIndex < total ? p + 1 : p))

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
      )
    },
    { key: 'region', label: 'REGION' },
    { key: 'witel', label: 'WITEL' },
  ]

  // Stats
  const stats = [
    { label: 'Total Account Managers', value: mockAMs.length.toLocaleString(), icon: FaUserTie },
    { label: 'Regions', value: regions.length.toString(), icon: FaMapMarkerAlt },
    { label: 'Witels', value: witels.length.toString(), icon: FaBuilding },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        variant="hero"
        title="ECRM Workspace"
        subtitle="Kelola dan pantau performa Account Manager di seluruh region"
        icon={FaUserTie}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Validation Module */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#7C3AED] grid place-items-center ring-1 ring-[#7C3AED]/20">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-neutral-900">Validate AM Data</h3>
              <p className="text-sm text-neutral-500 mt-1">Bandingkan dan validasi data AM dari CA terhadap ATM. Hasil validasi akan tampil di halaman khusus.</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full md:w-auto"
            onClick={() => navigate('/ecrm-workspace/validation')}
          >
            Start Validation
            <FaArrowRight />
          </Button>
        </div>
      </Card>

  {/* Filters Card */}
  <Card className="bg-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-neutral-700">
            <FaFilter className="text-[#E60012]" />
            <h2 className="font-semibold">Filter Data</h2>
          </div>
          
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="inline-flex items-center gap-2 text-sm hover:text-[#7C3AED]">
                <FaDownload />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Validation moved to dedicated page; button above navigates there */}

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Table columns={columns} data={pageRows} rowKey={(r) => r.id_sales} />
      </div>

      {/* Pagination Footer */}
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
