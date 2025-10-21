import React from 'react'
import Card from '@components/ui/Card'
import Table from '@components/ui/Table'
import { ProgressBar } from '@components/ui/Progress'
import mockAMs from '@/data/mockAMs'
import Button from '@components/ui/Button'
import Select from '@components/ui/Select'

// Simple manager dashboard to track Account Managers' progress and visits
export default function ManagerDashboard() {
  // Derive unique regions
  const regions = React.useMemo(() => Array.from(new Set(mockAMs.map(am => am.region))), [])
  // Assume manager may have a preferred region stored in their profile; fallback to first region
  const defaultRegion = React.useMemo(() => {
    // If user has metadata with region, use it. Otherwise default to first.
    // Current auth.user does not carry region; allow manual selection.
    return regions[0] || ''
  }, [regions])

  const [region, setRegion] = React.useState(defaultRegion)

  // Build stats per AM, filtered by region
  const stats = React.useMemo(() => {
    const subset = region ? mockAMs.filter(am => am.region === region) : mockAMs
    return subset.map(am => ({
      ...am,
      customers: Math.floor(Math.random() * 12) + 5,
      visitsThisMonth: Math.floor(Math.random() * 10),
      totalVisits: Math.floor(Math.random() * 120) + 20,
      planProgress: Math.floor(Math.random() * 100),
    }))
  }, [region])

  const columns = [
    { key: 'nama_am', label: 'Account Manager', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'witel', label: 'Witel', sortable: true },
    { key: 'customers', label: 'Customers' },
    { key: 'visitsThisMonth', label: 'Visits (This Month)' },
    { key: 'totalVisits', label: 'Visits (All Time)' },
    { key: 'planProgress', label: 'Plan Progress' },
    { key: 'actions', label: 'Aksi' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-xl font-bold text-neutral-900">Manager Dashboard</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-700">Region:</label>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
      </div>
      <Card className="p-0 overflow-hidden ring-1 ring-neutral-200">
        <Table
          columns={columns}
          data={stats}
          dense
          renderCell={(row, key) => {
            if (key === 'planProgress') {
              return (
                <div className="min-w-[160px]">
                  <div className="text-[12px] text-neutral-600 mb-1">{row.planProgress}%</div>
                  <ProgressBar value={row.planProgress} size="sm" />
                </div>
              )
            }
            if (key === 'actions') {
              return (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary">Lihat Kunjungan</Button>
                  <Button size="sm">Detail</Button>
                </div>
              )
            }
            return row[key]
          }}
          emptyMessage="Tidak ada data AM"
        />
      </Card>
    </div>
  )
}
