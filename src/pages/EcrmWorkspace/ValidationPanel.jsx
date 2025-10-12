import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { runValidateAM, generateCommit, fetchATM, fetchCA, diffCAtoATM } from '../../services/validation'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { FaArrowLeft } from 'react-icons/fa'
import FlowSteps from '../../components/validation/FlowSteps'
import Card from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/Progress'
import UiToolbar from '../../components/ui/Toolbar'
import DataTableWithPagination from '../../components/ui/DataTableWithPagination'

export default function ValidationPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ATM') // 'ATM'|'CA'|'TEMP'|'LOG'
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  // removed showAll toggle for simplicity

  const [atm, setAtm] = useState([])
  const [ca, setCa] = useState([])
  const [temp, setTemp] = useState([])
  const [log, setLog] = useState([])

  const [state, setState] = useState('idle') // idle|validating|success|error

  // TEMP selection state
  const [selectedTemp, setSelectedTemp] = useState(() => new Set())

  const getKey = (row) => {
    const nik = row?.nik_am?.trim?.()
    const id = row?.id_sales?.trim?.()
    if (nik) return `nik:${nik}`
    if (id) return `id:${id}`
    if (row?.ts) return `ts:${row.ts}`
    if (row?.nama_am) return `nm:${row.nama_am}`
    return undefined
  }

  const toggleTempSelected = (row) => {
    const k = getKey(row)
    if (!k) return
    setSelectedTemp((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const selectAllOnPage = (rows) => {
    setSelectedTemp((prev) => {
      const next = new Set(prev)
      rows.forEach((r) => {
        const k = getKey(r)
        if (k) next.add(k)
      })
      return next
    })
  }

  const deselectAllOnPage = (rows) => {
    setSelectedTemp((prev) => {
      const next = new Set(prev)
      rows.forEach((r) => {
        const k = getKey(r)
        if (k) next.delete(k)
      })
      return next
    })
  }

  useEffect(() => {
    Promise.all([fetchATM(), fetchCA()]).then(([a, c]) => { setAtm(a); setCa(c) })
  }, [])

  const handleValidateAM = React.useCallback(async () => {
    // Compare CA against ATM and save only missing rows into TEMP
    setState('validating')
    try {
  const res = await runValidateAM('manager')
  const missingOnly = (res.temp || []).filter((t) => t.status === 'tidak valid' && t.sumber === 'CA')
      setTemp(missingOnly)
  setSelectedTemp(new Set())
      setLog((l) => [res.log, ...l])
      setState('success')
      setActiveTab('TEMP')
    } catch {
      setState('error')
    }
  }, [])

  const handleGenerate = React.useCallback(async () => {
    // Save TEMP rows into AM Master (simulate by merging into ATM list)
    setState('validating')
    try {
      const toInsert = temp.filter((t) => {
        const k = getKey(t)
        return k && selectedTemp.has(k) && t.status === 'tidak valid' && t.sumber === 'CA'
      })
      if (toInsert.length) {
        const existingKeys = new Set(
          atm
            .map((a) => (a.nik_am && a.nik_am.trim() ? `nik:${a.nik_am.trim()}` : a.id_sales ? `id:${a.id_sales}` : ''))
            .filter(Boolean)
        )
        const newOnes = toInsert.filter((r) => {
          const nik = r.nik_am?.trim()
          const id = r.id_sales?.trim()
          const key = nik ? `nik:${nik}` : id ? `id:${id}` : ''
          if (!key) return false
          return !existingKeys.has(key)
        })
        setAtm((prev) => [...prev, ...newOnes.map((row) => {
          const { nik_am, id_sales, nama_am, region, witel, updated_at } = row
          return { nik_am, id_sales, nama_am, region, witel, updated_at }
        })])
      }
      const entry = await generateCommit('manager')
  setLog((l) => [entry, ...l])
  setTemp([])
  setSelectedTemp(new Set())
      setActiveTab('ATM')
      setState('success')
    } catch {
      setState('error')
    }
  }, [temp, atm, selectedTemp])

  const tempScoped = useMemo(() => {
    // Keep TEMP focused on "missing" entries for simplicity
    let scoped = temp.filter((t) => t.status === 'tidak valid')
    if (!filter) return scoped
    const q = filter.toLowerCase()
    return scoped.filter((t) =>
      (t.nik_am || '').toLowerCase().includes(q) ||
      (t.id_sales || '').toLowerCase().includes(q) ||
      (t.nama_am || '').toLowerCase().includes(q)
    )
  }, [temp, filter])

  const atmScoped = useMemo(() => {
    if (!filter) return atm
    const q = filter.toLowerCase()
    return atm.filter((t) =>
      (t.nik_am || '').toLowerCase().includes(q) ||
      (t.id_sales || '').toLowerCase().includes(q) ||
      (t.nama_am || '').toLowerCase().includes(q)
    )
  }, [atm, filter])
  const caScoped = useMemo(() => {
    if (!filter) return ca
    const q = filter.toLowerCase()
    return ca.filter((t) =>
      (t.nik_am || '').toLowerCase().includes(q) ||
      (t.id_sales || '').toLowerCase().includes(q) ||
      (t.nama_am || '').toLowerCase().includes(q)
    )
  }, [ca, filter])
  const logScoped = useMemo(() => {
    if (!filter) return log
    const q = filter.toLowerCase()
    return log.filter((t) =>
      (t.actor || '').toLowerCase().includes(q) ||
      (t.action || '').toLowerCase().includes(q)
    )
  }, [log, filter])

  // Compute progress based on actual CA vs ATM comparison, not TEMP
  const comparison = useMemo(() => diffCAtoATM(ca, atm), [ca, atm])
  const totalCA = ca.length
  const validCount = comparison.valid.length
  const pct = totalCA ? Math.round((validCount / totalCA) * 100) : 0

  // Determine staged CTA:
  // Stage 1: If TEMP is empty -> Compare CA→ATM & Save to TEMP
  // Stage 2: If TEMP has rows -> Save TEMP → AM Master (only selected rows)
  // Stage 3: After generate, TEMP cleared -> optional Sync hidden by default
  const hasTemp = temp.length > 0
  const selectedCount = useMemo(() => selectedTemp.size, [selectedTemp])
  const cta = useMemo(() => {
    if (!hasTemp) {
      return {
        label: 'Compare CA→ATM & Save to TEMP',
        onClick: handleValidateAM,
        variant: 'primary',
      }
    }
    // Has TEMP rows -> Save only if selection exists
    return {
      label: selectedCount > 0 ? `Save ${selectedCount} to AM Master` : 'Select rows to save',
      onClick: selectedCount > 0 ? handleGenerate : undefined,
      disabled: selectedCount === 0,
      variant: selectedCount > 0 ? 'secondary' : 'ghost',
    }
  }, [hasTemp, selectedCount, handleValidateAM, handleGenerate])

  const atmCols = [
    { key: 'nik_am', label: 'NIK', sortable: true },
    { key: 'id_sales', label: 'ID Sales', sortable: true },
    { key: 'nama_am', label: 'Nama', sortable: true },
    { key: 'region', label: 'Region' },
    { key: 'witel', label: 'Witel' },
  ]
  const caCols = atmCols

  const tempCols = [
    { key: '__select__', label: '', className: 'w-10' },
    { key: 'nik_am', label: 'NIK', sortable: true },
    { key: 'id_sales', label: 'ID Sales', sortable: true },
    { key: 'nama_am', label: 'Nama', sortable: true },
    { key: 'sumber', label: 'Sumber', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'ts', label: 'Timestamp', sortable: true },
  ]

  const logCols = [
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'count', label: 'Count' },
    { key: 'duration_ms', label: 'Duration (ms)' },
    { key: 'ts', label: 'Timestamp' },
  ]

  const renderTempCell = (row, key) => {
    if (key === '__select__') {
      const k = getKey(row)
      const checked = k ? selectedTemp.has(k) : false
      return (
        <input
          type="checkbox"
          disabled={!k}
          checked={checked}
          onChange={() => toggleTempSelected(row)}
        />
      )
    }
    if (key === 'status') {
      return (
        <Badge variant={row.status === 'valid' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      )
    }
    return row[key]
  }

  const tabData = activeTab === 'ATM' ? atmScoped
    : activeTab === 'CA' ? caScoped
    : activeTab === 'TEMP' ? tempScoped
    : logScoped

  const columns = activeTab === 'ATM' ? atmCols
    : activeTab === 'CA' ? caCols
    : activeTab === 'TEMP' ? tempCols
    : logCols

  const total = tabData.length
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, total)
  const pageRows = tabData.slice(startIndex, endIndex)

  // Minimal page selection helper
  const allSelectedOnPage = useMemo(() => {
    if (activeTab !== 'TEMP') return false
    return pageRows.length > 0 && pageRows.every((r) => selectedTemp.has(getKey(r)))
  }, [activeTab, pageRows, selectedTemp])

  useEffect(() => { setPage(1) }, [activeTab, filter, rowsPerPage])

  return (
    <div className="space-y-6">
      <PageHeader
        variant="hero"
        title="Validation"
        subtitle="Bandingkan data CA dengan AM (ATM), pilih data yang belum ada, simpan ke TEMP, lalu generate ke AM Master"
        right={
          <Button variant="back" className="inline-flex items-center gap-2" onClick={() => navigate('/ecrm-workspace')}>
            <FaArrowLeft />
            Back to Workspace
          </Button>
        }
      />

      <FlowSteps current={activeTab === 'ATM' ? 1 : activeTab === 'CA' ? 2 : activeTab === 'TEMP' ? 3 : 4} />

      {/* Top actions using reusable UI components */}
      <Card className="bg-gradient-to-br from-white to-[#F5F6FA]">
        <UiToolbar className="justify-between">
          <div className="flex items-center gap-2">
            {cta && (
              <Button
                variant={cta.variant || 'primary'}
                onClick={cta.onClick}
                disabled={state === 'validating' || cta.disabled}
                className="inline-flex items-center gap-2"
              >
                {cta.label}
              </Button>
            )}
          </div>
          <div className="min-w-[280px]">
            <div className="text-xs text-neutral-500 mb-1">Progress CA in ATM: {pct}%</div>
            <ProgressBar value={pct} size="lg" />
          </div>
        </UiToolbar>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'ATM', label: 'ATM' },
          { key: 'CA', label: 'CA' },
          { key: 'TEMP', label: 'TEMP' },
          { key: 'LOG', label: 'LOG' },
        ]}
        activeKey={activeTab}
        onChange={(k) => setActiveTab(k)}
      />

  {/* TEMP: minimal header controls via DataTableWithPagination headerRight */}

      {/* Table */}
      <DataTableWithPagination
        columns={columns}
        data={tabData}
        rowKey={(row) => getKey(row) || row.nik_am || row.id_sales}
        renderCell={activeTab === 'TEMP' ? renderTempCell : undefined}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        searchValue={filter}
        onSearchChange={setFilter}
        searchPlaceholder={activeTab === 'TEMP' ? 'Cari di TEMP' : activeTab === 'CA' ? 'Cari di CA' : activeTab === 'ATM' ? 'Cari di ATM' : 'Cari log'}
        headerRight={activeTab === 'TEMP' ? (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (allSelectedOnPage ? deselectAllOnPage(pageRows) : selectAllOnPage(pageRows))}
            >
              {allSelectedOnPage ? 'Clear page' : 'Select page'}
            </Button>
            <div className="text-xs text-neutral-500">Selected: {selectedTemp.size}</div>
          </div>
        ) : null}
      />
    </div>
  )
}
