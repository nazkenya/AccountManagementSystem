import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// Import all the same UI components as CustomersPage
import SearchInput from '../components/ui/SearchInput'
import Tag from '../components/ui/Tag'
import Pagination from '../components/ui/Pagination'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import StatsCard from '../components/ui/StatsCard'
import PageHeader from '../components/ui/PageHeader'
// Import icons
import { FaFilter, FaPlus, FaUsers, FaStar, FaBuilding, FaUserAlt } from 'react-icons/fa'

/* -------------------------------------------------------
 * Dummy Data (Replace with your API call)
 * ----------------------------------------------------- */
const DUMMY_CONTACTS = [
  {
    id: 1,
    name: 'Alia Smith',
    title: 'Account Executive',
    company: 'TechCorp Solutions',
    email: 'alia.smith@techcorp.com',
    phone: '+1 (555) 123-4567',
    tag: { text: 'Key Account', variant: 'blue' },
  },
  {
    id: 2,
    name: 'Budi Hartono',
    title: 'CTO',
    company: 'InnovateHub',
    email: 'budi.h@innovatehub.id',
    phone: '+62 812 3456 7890',
    tag: null,
  },
  {
    id: 3,
    name: 'Catherine Lee',
    title: 'Procurement Manager',
    company: 'GlobalLogistics',
    email: 'c.lee@globallogistics.com',
    phone: '+1 (555) 987-6543',
    tag: { text: 'Influencer', variant: 'green' },
  },
  {
    id: 4,
    name: 'David Kim',
    title: 'IT Director',
    company: 'TechCorp Solutions',
    email: 'david.kim@techcorp.com',
    phone: '+1 (555) 111-2222',
    tag: null,
  },
  {
    id: 5,
    name: 'Eka Putri',
    title: 'Finance Analyst',
    company: 'DataWeave',
    email: 'eka.p@dataweave.co',
    phone: '+62 811 9876 5432',
    tag: null,
  },
]

/* -------------------------------------------------------
 * Helper Functions for Avatars
 * ----------------------------------------------------- */
const getInitials = (name = '') => {
  const parts = name.split(' ')
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
  return `${first}${last}`.toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
  'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700',
]

const getAvatarColor = (name = '') => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/* -------------------------------------------------------
 * Main Contact Management Page
 * ----------------------------------------------------- */
export default function ContactManagementPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Filtering logic
  const filtered = useMemo(() => {
    if (!query) return DUMMY_CONTACTS
    const q = query.toLowerCase()
    return DUMMY_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    )
  }, [query])

  // Pagination logic
  const total = filtered.length
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, total)
  const pageRows = filtered.slice(startIndex, endIndex)

  const onPrev = () => setPage((p) => Math.max(1, p - 1))
  const onNext = () => setPage((p) => (endIndex < total ? p + 1 : p))

  // Table Columns
  const columns = [
    {
      key: 'name',
      label: 'Kontak',
      render: (c) => {
        const initials = getInitials(c.name)
        const avatarColor = getAvatarColor(c.name)
        return (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${avatarColor} flex-shrink-0`}
            >
              {initials || <FaUserAlt />}
            </div>
            {/* Name, Email, and Tag */}
            <div>
              <strong className="block font-semibold text-neutral-800">{c.name}</strong>
              <span className="text-neutral-500 text-[13px]">
                {c.email}
                {c.tag && (
                  <Tag variant={c.tag.variant} className="ml-2">
                    {c.tag.text}
                  </Tag>
                )}
              </span>
            </div>
          </div>
        )
      },
    },
    { key: 'title', label: 'Jabatan' },
    { key: 'company', label: 'Perusahaan' },
    { key: 'phone', label: 'Telepon' },
  ]

  // Stats Card Data
  const stats = [
    { label: 'Total Kontak', value: DUMMY_CONTACTS.length.toLocaleString(), icon: FaUsers },
    { label: 'Kontak Penting', value: '3', icon: FaStar }, // Hardcoded example
    { label: 'Perusahaan Terhubung', value: '32', icon: FaBuilding }, // Hardcoded example
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Manajemen Kontak"
        subtitle="Kelola dan pantau semua kontak pelanggan Anda"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-3 md:gap-4">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Cari kontak, jabatan, perusahaan, atau email..."
            />
            <Button variant="secondary" className="w-fit inline-flex items-center gap-2">
              <FaFilter />
              Filter
            </Button>
          </div>
          <Button variant="primary" className="w-fit inline-flex items-center gap-2">
            <FaPlus />
            Tambah Kontak
          </Button>
        </div>
      </Card>

      {/* Table Card */}
      <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Table
          columns={columns}
          data={pageRows}
          rowKey="id"
          onRowClick={(c) => navigate(`/contacts/${c.id}`)} // Assumes a /contacts/:id route
        />
      </div>

      {/* Pagination Footer */}
      <Card className="bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm">
            <span className="text-neutral-800 font-semibold">
              {total === 0 ? 0 : startIndex + 1}-{endIndex}
            </span>
            <span className="text-neutral-500"> dari {total} Kontak</span>
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