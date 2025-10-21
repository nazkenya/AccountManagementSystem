import React from 'react'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import EmptyState from '@components/ui/EmptyState'
import FormInput from '@components/ui/FormInput'
import PickerModal from '@components/ui/PickerModal'
import { Badge } from '@components/ui/Badge'
import { RadialProgress } from '@pages/accountProfile/components/RadialProgress'
import { Section } from '@pages/accountProfile/components/Section'
import { useCollapsedMap } from '@pages/accountProfile/hooks/useCollapsedMap'
import { FiUsers, FiTrendingUp, FiAlertTriangle, FiMessageSquare, FiCalendar, FiPlus } from 'react-icons/fi'
import Table from '@components/ui/Table'

// RelationshipPlan renders 5 inline-editable modules similar to the reference:
// 1) Health of the Relationship, 2) Action to Grow, 3) Conflict Description,
// 4) Communication Method, 5) Communication Frequency
// Data persisted per-customer in localStorage.

const ROLES = ['Decision Maker', 'Influencer', 'User', 'Gatekeeper', 'Sponsor', 'Technical Buyer', 'Economic Buyer', 'Champion']
const REL_STATUSES = ['Promotor', 'Netral', 'Detractor']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Biannually', 'Yearly', 'Ad hoc']
const MECHANISMS = ['WhatsApp', 'Email', 'Telepon', 'Meeting onsite', 'Meeting online', 'Presentasi', 'QBR', 'Ticket system']
const EFFORTS = ['Pembuatan grup WA dedicated', 'Regular check-in', 'Undangan workshop', 'Executive briefing', 'Kirim case study relevan', 'Sesi QBR', 'Follow up issue terbuka']

const MODULES = [
  {
    id: 'rp1',
    icon: FiUsers,
    title: '1. The Health of the Relationship',
    description: 'Status hubungan Telkom dengan Pelanggan',
    columns: [
      { key: 'no', label: 'No', type: 'text', required: false },
      { key: 'pic', label: 'Nama PIC', type: 'text', required: true },
      { key: 'position', label: 'Jabatan', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'select', options: ROLES, required: true },
      { key: 'relStatus', label: 'Relationship Status', type: 'select', options: REL_STATUSES, required: true },
      { key: 'notes', label: 'Keterangan', type: 'text', required: false },
    ],
  },
  {
  id: 'rp2',
  icon: FiTrendingUp,
    title: '2. Action to Grow the Relationship',
    description: 'Tindakan untuk menjaga dan meningkatkan hubungan baik',
    columns: [
      { key: 'done', label: 'Selesai?', type: 'checkbox', required: false },
      { key: 'effort', label: 'Relationship Effort', type: 'textarea', required: true },
      { key: 'notes', label: 'Keterangan', type: 'text', required: false },
    ],
  },
  {
    id: 'rp3',
  icon: FiAlertTriangle,
    title: '3. Conflict Description',
    description: 'Deskripsi konflik yang pernah terjadi',
    columns: [
      { key: 'conflict', label: 'Konflik', type: 'text', required: true },
      { key: 'desc', label: 'Deskripsi', type: 'textarea', required: true },
      { key: 'date', label: 'Tanggal', type: 'date', required: true },
      { key: 'solution', label: 'Solusi', type: 'textarea', required: true },
    ],
  },
  {
    id: 'rp4',
  icon: FiMessageSquare,
    title: '4. Communication Method',
    description: 'Metode komunikasi dengan PIC Pelanggan',
    columns: [
      { key: 'pic', label: 'Nama PIC', type: 'text', required: true },
      { key: 'position', label: 'Jabatan', type: 'text', required: true },
      { key: 'mechanism', label: 'Mekanisme Komunikasi', type: 'textarea', required: true, suggestions: MECHANISMS },
      { key: 'notes', label: 'Keterangan (opsional)', type: 'text', required: false },
    ],
  },
  {
    id: 'rp5',
  icon: FiCalendar,
    title: '5. Communication Frequency',
    description: 'Seberapa sering berkomunikasi dengan pelanggan',
    columns: [
      { key: 'pic', label: 'Nama PIC', type: 'text', required: true },
      { key: 'position', label: 'Jabatan', type: 'text', required: true },
      { key: 'frequency', label: 'Frekuensi Komunikasi', type: 'select', options: FREQUENCIES, required: true },
      { key: 'notes', label: 'Keterangan (opsional)', type: 'text', required: false },
    ],
  },
]

// utils
function computeModuleStatus(rows, columns) {
  let total = 0
  let filled = 0
  ;(rows || []).forEach((row) => {
    columns.forEach((c) => {
      if (c.required !== false) {
        total += 1
        const v = row?.[c.key]
        if (v !== undefined && v !== null && String(v).trim() !== '') filled += 1
      }
    })
  })
  let status = 'pending'
  if (!rows?.length || total === 0 || filled === 0) status = 'pending'
  else if (filled === total) status = 'completed'
  else status = 'partial'
  return { status, filled, total }
  }

export default function RelationshipPlan({ customerId = 'demo', contacts = [] }) {
  const storageKey = React.useMemo(() => `relationshipPlan_${customerId}`, [customerId])
  const [data, setData] = React.useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch (e) { void e }
    return {
      rp1: [],
      rp2: [{ effort: 'Pembuatan grup WA dedicated' }],
      rp3: [{ conflict: 'Layanan internet down', desc: 'Internet mati pada working hour', date: '2025-08-20', solution: 'Pembenahan jaringan' }],
      rp4: [{ pic: 'Bapak Budi', position: 'Direktur IT', mechanism: 'Visit langsung, email', notes: 'Secara formal' }],
      rp5: [{ pic: 'Bapak Budi', position: 'Direktur IT', frequency: 'Quarterly', notes: 'Formal QBR' }],
    }
  })
  const [editing, setEditing] = React.useState({})
  const [drafts, setDrafts] = React.useState({})
  const { collapsed, setCollapsed } = useCollapsedMap(storageKey)

  const expandAll = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = { ...prev }
      MODULES.forEach((m) => { next[m.id] = false })
      return next
    })
  }, [setCollapsed])

  const collapseAll = React.useCallback(() => {
    setCollapsed((prev) => {
      const next = { ...prev }
      MODULES.forEach((m) => { next[m.id] = true })
      return next
    })
  }, [setCollapsed])

  const saveData = React.useCallback((newData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [storageKey]);

  // Build PIC options from contacts (object groups or flat array)
  const contactsList = React.useMemo(() => {
    let list = []
    if (Array.isArray(contacts)) {
      list = contacts.filter((c) => c && c.name)
    } else if (contacts && typeof contacts === 'object') {
      Object.values(contacts).forEach((arr) => {
        if (Array.isArray(arr)) list.push(...arr.filter((c) => c && c.name))
      })
    }
    // unique by name
    const seen = new Set()
    const unique = []
    for (const c of list) {
      if (!seen.has(c.name)) {
        seen.add(c.name)
        unique.push(c)
      }
    }
    return unique
  }, [contacts])

  const contactsNames = React.useMemo(() => contactsList.map((c) => c.name), [contactsList])
  const contactsMap = React.useMemo(() => Object.fromEntries(contactsList.map((c) => [c.name, c])), [contactsList])

  const updateCell = React.useCallback((moduleId, rowIndex, key, value) => {
    const targetIsDraft = !!editing[moduleId]
    const applyUpdate = (arr) => {
      const rows = [...(arr || [])]
      const row = { ...(rows[rowIndex] || {}) }
      row[key] = value
      if (key === 'pic') {
        const module = MODULES.find((m) => m.id === moduleId)
        const hasPosition = module?.columns?.some((c) => c.key === 'position')
        if (hasPosition) {
          const c = contactsMap[value]
          if (c?.title) row['position'] = c.title
        }
      }
      rows[rowIndex] = row
      return rows
    }
    if (targetIsDraft) {
      setDrafts((prev) => ({ ...prev, [moduleId]: applyUpdate(prev[moduleId]) }))
    } else {
      // Allow direct update for non-draftable fields like checkboxes outside edit mode
      setData((prev) => {
        const nextData = { ...prev, [moduleId]: applyUpdate(prev[moduleId]) }
        saveData(nextData)
        return nextData
      })
    }
  }, [editing, contactsMap, saveData])

  const addRow = React.useCallback((moduleId, columns) => {
    const empty = { id: `temp_${Date.now()}` } // Add a temporary unique ID
    columns.forEach((c) => (empty[c.key] = c.type === 'checkbox' ? false : ''))
    if (editing[moduleId]) {
      setDrafts((prev) => ({ ...prev, [moduleId]: [...(prev[moduleId] || []), empty] }))
    } else {
      setData((prev) => {
        const nextData = { ...prev, [moduleId]: [...(prev[moduleId] || []), empty] }
        saveData(nextData)
        return nextData
      })
    }
  }, [editing, saveData])

  const deleteRow = React.useCallback((moduleId, index) => {
    if (editing[moduleId]) {
      setDrafts((prev) => {
        const rows = [...(prev[moduleId] || [])]
        rows.splice(index, 1)
        return { ...prev, [moduleId]: rows }
      })
    } else {
      setData((prev) => {
        const rows = [...(prev[moduleId] || [])]
        rows.splice(index, 1)
        const nextData = { ...prev, [moduleId]: rows }
        saveData(nextData)
        return nextData
      })
    }
  }, [editing, saveData])

  function StatusBadge({ status }) {
    const variant = status === 'completed' ? 'success' : status === 'partial' ? 'info' : 'neutral'
    const label = status === 'completed' ? 'SUDAH DIISI' : status === 'partial' ? 'SEBAGIAN' : 'BELUM DIISI'
    return <Badge variant={variant} className="font-bold">{label}</Badge>
  }

  function IconPill({ icon: Icon }) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        {Icon ? <Icon /> : null}
      </span>
    )
  }

  function validateModule(rows, columns) {
    const missing = []
    ;(rows || []).forEach((row) => {
      columns.forEach((c) => {
        if (c.required !== false) {
          const v = row?.[c.key]
          if (v === undefined || v === null || String(v).trim() === '') {
            missing.push(c.key)
          }
        }
      })
    })
    return missing
  }

  const Input = React.memo(function Input({ col, value, disabled, onChange, error, moduleRows, size = 'md' }) {
    const isPIC = col.key === 'pic' && contactsNames.length > 0
  const [open, setOpen] = React.useState(false)

    if (isPIC) {
      return (
        <div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              readOnly
              className={`w-full rounded-lg ${size === 'sm' ? 'px-3 py-2 text-[13px] border' : 'px-4 py-2.5 text-sm border-2'} bg-white ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-neutral-200'} cursor-pointer truncate`}
              value={value || ''}
              placeholder={col.placeholder || 'Pilih PIC'}
              onClick={() => !disabled && setOpen(true)}
              disabled={disabled}
            />
            {size !== 'sm' && (
              <Button size="sm" variant="secondary" onClick={() => !disabled && setOpen(true)}>Pilih</Button>
            )}
          </div>
          <PickerModal
            open={open}
            onClose={() => setOpen(false)}
            title="Pilih PIC"
            items={contactsNames.map((n) => ({ key: n, title: n, subtitle: contactsMap[n]?.title }))}
            emptyText="Tidak ada hasil"
            isItemDisabled={(key) => (moduleRows || []).some((r) => (r.pic || '').trim().toLowerCase() === key.trim().toLowerCase())}
            onSelect={(key) => { onChange?.(key); setOpen(false) }}
          />
        </div>
      )
    }

    return (
      <FormInput
        type={col.type || 'text'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={col.placeholder || ''}
        options={col.options || []}
        datalistId={col.key === 'pic' && contactsNames.length ? 'contacts-datalist' : undefined}
        suggestions={col.suggestions || []}
        error={error}
        size={size}
      />
    )
  })

  const ModuleSection = React.memo(function ModuleSection({
    module,
    isEditing,
    isCollapsed,
    rows,
    onToggle,
    onEdit,
    onSave,
    onCancel,
    onAddRow,
    onDeleteRow,
    onUpdateCell,
    contactsNames,
    contactsMap,
  }) {
    const { status, filled, total } = computeModuleStatus(rows, module.columns)

    const RowCard = React.memo(function RowCard({ row, index }) {
      return (
        <div className="rounded-xl border border-neutral-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="text-xs font-semibold text-neutral-500">#{index + 1}</div>
            {isEditing && (
              <Button variant="danger" size="sm" onClick={() => onDeleteRow(index)}>Hapus</Button>
            )}
          </div>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {module.columns.map((c) => (
                <div key={c.key} className="space-y-1">
                  <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                    {c.label} {c.required !== false && <span className="text-rose-500">*</span>}
                  </div>
                  <Input
                    col={c}
                    disabled={false}
                    value={row[c.key]}
                    onChange={(val) => onUpdateCell(index, c.key, val)}
                    moduleRows={rows}
                    error={c.required !== false && (!row[c.key] || String(row[c.key]).trim() === '')}
                    contactsNames={contactsNames}
                    contactsMap={contactsMap}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {module.columns.map((c) => (
                <div key={c.key} className="flex flex-col">
                  <span className="text-[11px] font-medium text-neutral-500 uppercase">{c.label}</span>
                  <span className="text-sm text-neutral-800">{String(row[c.key] || '-') }</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    })

    const headerRight = (
      <div className="flex items-center gap-2">
        {total > 0 && (
          <Badge variant={status === 'completed' ? 'success' : status === 'partial' ? 'info' : 'neutral'} className="hidden sm:inline-flex">{filled}/{total} field</Badge>
        )}
        <StatusBadge status={status} />
        {!isEditing ? (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
        ) : (
          <>
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
            <Button size="sm" variant="back" onClick={onCancel}>
              Batal
            </Button>
            <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={onAddRow}><FiPlus /> Tambah Baris</Button>
          </>
        )}
      </div>
    )

    return (
      <Section
        id={module.id}
        title={module.title}
        icon={module.icon}
        collapsed={isCollapsed}
        onToggle={onToggle}
        headerRight={headerRight}
        summary={status === 'completed' ? 'Lengkap' : status === 'partial' ? `${filled}/${total} field` : 'Belum diisi'}
      >
        <div className="space-y-3">
          <p className="text-xs text-neutral-500 mb-2">{module.description}</p>
          {module.id === 'rp2' ? (
            <>
              <Card className="p-0 overflow-hidden ring-1 ring-neutral-200 hover:translate-y-0">
                <Table
                  className="bg-transparent rounded-none shadow-none ring-0"
                  dense
                  columns={[
                    { key: '_no', label: 'No', className: 'w-[64px] min-w-[64px]', cellClass: 'w-[64px]' },
                    { key: 'done', label: 'Selesai?', className: 'w-[110px] min-w-[100px]' },
                    { key: 'effort', label: 'Relationship Effort' },
                    { key: 'notes', label: 'Keterangan', className: 'min-w-[220px]' },
                    ...(isEditing ? [{ key: '_actions', label: 'Aksi', className: 'w-[100px]' }] : []),
                  ]}
                  data={rows}
                  renderCell={(row, key) => {
                    const idx = rows.findIndex(r => r === row)
                    if (key === '_no') return <span className="text-neutral-700 text-[13px]">{idx + 1}</span>
                    if (key === '_actions') {
                      return (
                        <Button variant="danger" size="sm" onClick={() => onDeleteRow(idx)}>
                          Hapus
                        </Button>
                      )
                    }
                    const col = module.columns.find((c) => c.key === key)
                    if (!col) return null
                    if (key === 'done') {
                      return (
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-blue-600"
                          checked={!!row.done}
                          onChange={(e) => onUpdateCell(idx, 'done', e.target.checked)}
                        />
                      )
                    }
                    if (key === 'notes' && !isEditing) {
                      return <span className="text-neutral-800 text-[13px] leading-relaxed">{String(row[key] || '-') }</span>
                    }
                    if (isEditing) {
                      return (
                        <Input
                          col={col}
                          disabled={false}
                          value={row[key]}
                          onChange={(val) => onUpdateCell(idx, key, val)}
                          moduleRows={rows}
                          size="sm"
                          error={col.required !== false && (!row[key] || String(row[key]).trim() === '')}
                          contactsNames={contactsNames}
                          contactsMap={contactsMap}
                        />
                      )
                    }
                    return <span className="text-neutral-800 text-[13px] leading-relaxed">{String(row[key] || '-') }</span>
                  }}
                  emptyMessage={isEditing ? 'Belum ada data — klik Tambah Baris' : 'Belum ada data'}
                />
              </Card>
              {rows.length === 0 && isEditing && (
                <div className="mt-3">
                  <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={onAddRow}>
                    <FiPlus /> Tambah Baris
                  </Button>
                </div>
              )}
            </>
          ) : rows.length === 0 ? (
            <EmptyState title="Belum ada data" description="Mulai dengan menambahkan baris baru pada modul ini" action={isEditing ? (
              <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={onAddRow}>
                <FiPlus /> Tambah Baris
              </Button>
            ) : null} />
          ) : (
            rows.map((row, idx) => (
              <RowCard key={row.id || idx} row={row} index={idx} />
            ))
          )}
          {total > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Badge variant={status === 'completed' ? 'success' : 'neutral'}>
                {filled}/{total} field
              </Badge>
            </div>
          )}
        </div>
      </Section>
    )
  })

  // overall progress (completed modules out of total)
  const progressInfo = React.useMemo(() => {
    const total = MODULES.length
    let completed = 0
    MODULES.forEach((m) => {
      const { status } = computeModuleStatus(data[m.id] || [], m.columns)
      if (status === 'completed') completed += 1
    })
    const pct = total ? Math.round((completed / total) * 100) : 0
    return { completed, total, pct }
  }, [data])

  const handleToggleCollapsed = React.useCallback((moduleId) => {
    setCollapsed((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }, [setCollapsed])

  const handleEdit = React.useCallback((moduleId) => {
    setDrafts((prev) => ({ ...prev, [moduleId]: JSON.parse(JSON.stringify(data[moduleId] || [])) }))
    setEditing((e) => ({ ...e, [moduleId]: true }))
  }, [data])

  const handleSave = React.useCallback((moduleId) => {
    const rows = drafts[moduleId]
    const module = MODULES.find(m => m.id === moduleId)
    const missing = validateModule(rows, module.columns)
    if (missing.length) return alert('Periksa kembali field yang wajib diisi')
    
    setData((prev) => {
      const nextData = { ...prev, [moduleId]: rows || [] }
      saveData(nextData)
      return nextData
    })
    setEditing((e) => ({ ...e, [moduleId]: false }))
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[moduleId];
      return next;
    });
  }, [drafts, saveData])

  const handleCancel = React.useCallback((moduleId) => {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[moduleId]
      return next
    })
    setEditing((e) => ({ ...e, [moduleId]: false }))
  }, [])

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <RadialProgress current={progressInfo.completed} total={progressInfo.total} />
          <div className="text-sm text-neutral-700">Progress Relationship Plan</div>
          <div className="ml-auto text-sm font-semibold text-neutral-900">{progressInfo.pct}%</div>
        </div>
        {(() => {
          const ids = MODULES.map(m => m.id)
          const allOpen = ids.every(id => !collapsed[id])
          const label = allOpen ? 'Collapse All' : 'Expand All'
          const onToggle = () => (allOpen ? collapseAll() : expandAll())
          return (
            <div className="mt-3 flex items-center justify-end">
              <Button size="sm" variant="secondary" onClick={onToggle}>{label}</Button>
            </div>
          )
        })()}
      </Card>

      {/* contacts datalist source */}
      {contactsNames.length > 0 && (
        <datalist id="contacts-datalist">
          {contactsNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      )}

      {MODULES.map((m) => {
        const isEditing = !!editing[m.id]
        const rows = isEditing ? (drafts[m.id] ?? []) : (data[m.id] || [])
        
        const moduleProps = {
          key: m.id,
          module: m,
          isEditing: isEditing,
          isCollapsed: !!collapsed[m.id],
          rows: rows,
          onToggle: () => handleToggleCollapsed(m.id),
          onEdit: () => handleEdit(m.id),
          onSave: () => handleSave(m.id),
          onCancel: () => handleCancel(m.id),
          onAddRow: () => addRow(m.id, m.columns),
          onDeleteRow: (index) => deleteRow(m.id, index),
          onUpdateCell: (index, key, value) => updateCell(m.id, index, key, value),
          contactsNames: contactsNames,
          contactsMap: contactsMap,
        }

        return <ModuleSection {...moduleProps} />
      })}
    </div>
  )
}
