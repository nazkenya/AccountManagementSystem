import React, { useState, useMemo, useCallback, memo } from 'react'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import EmptyState from '@components/ui/EmptyState'
import FormInput from '@components/ui/FormInput'
import PickerModal from '@components/ui/PickerModal'
import { Badge } from '@components/ui/Badge'
import { Section } from '@pages/accountProfile/components/Section'
import { FiUsers, FiTrendingUp, FiAlertTriangle, FiMessageSquare, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi'
import Table from '@components/ui/Table'

// --- Data & Constants (Unchanged) ---
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
      { key: 'done', label: 'Selesai?', type: 'checkbox', required: false, className: 'w-[100px]' },
      { key: 'effort', label: 'Relationship Effort', type: 'textarea', required: true, suggestions: EFFORTS },
      { key: 'notes', label: 'Keterangan', type: 'text', required: false, className: 'min-w-[200px]' },
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

// --- Utils (Unchanged) ---
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

function StatusBadge({ status }) {
  const variant = status === 'completed' ? 'success' : status === 'partial' ? 'info' : 'neutral'
  const label = status === 'completed' ? 'SUDAH DIISI' : status === 'partial' ? 'SEBAGIAN' : 'BELUM DIISI'
  return <Badge variant={variant} className="font-bold">{label}</Badge>
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

/* -------------------------------------------------------
 * Reusable Input Component (Slightly modified)
 * ----------------------------------------------------- */
const Input = memo(function Input({ col, value, disabled, onChange, error, moduleRows, contactsNames, contactsMap, size = 'md' }) {
  const isPIC = col.key === 'pic' && contactsNames.length > 0
  const [open, setOpen] = useState(false)

  if (isPIC) {
    return (
      <div>
        <div className="flex items-stretch">
          <input
            type="text"
            readOnly
            className={`w-full rounded-lg ${size === 'sm' ? 'px-3 py-2 text-[13px] border' : 'px-4 py-2.5 text-sm border-2'} bg-white ${error ? 'border-red-300' : 'border-neutral-200'} cursor-pointer truncate`}
            value={value || ''}
            placeholder={col.placeholder || 'Pilih PIC'}
            onClick={() => !disabled && setOpen(true)}
            disabled={disabled}
          />
        </div>
        <PickerModal
          open={open}
          onClose={() => setOpen(false)}
          title="Pilih PIC"
          items={contactsNames.map((n) => ({ key: n, title: n, subtitle: contactsMap[n]?.title }))}
          emptyText="Tidak ada hasil"
          isItemDisabled={(key) => (moduleRows || []).some((r) => r.id !== value.id && (r.pic || '').trim().toLowerCase() === key.trim().toLowerCase())}
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
      suggestions={col.suggestions || []}
      error={error}
      size={size}
    />
  )
})

/* -------------------------------------------------------
 * NEW: Reusable ModuleTable Component
 * ----------------------------------------------------- */
const ModuleTable = memo(function ModuleTable({
  module,
  isEditing,
  rows,
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

  // Build table columns from module config
  const tableColumns = useMemo(() => {
    let baseColumns = [
      { key: '_no', label: '#', className: 'w-[40px] text-center' },
      ...module.columns.map(c => ({
        key: c.key,
        label: c.label,
        className: c.className || '',
      })),
    ]
    if (isEditing) {
      baseColumns.push({ key: '_actions', label: 'Aksi', className: 'w-[80px] text-right' })
    }
    return baseColumns
  }, [module.columns, isEditing])
  
  // Header with title, icon, status, and edit buttons
  const cardHeader = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <module.icon />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{module.title}</h3>
          <p className="text-xs text-neutral-500">{module.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
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
          </>
        )}
      </div>
    </div>
  )

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        {cardHeader}
      </div>
      
      <Table
        className="bg-transparent rounded-none shadow-none ring-0"
        dense
        columns={tableColumns}
        data={rows}
        rowKey="id"
        renderCell={(row, key) => {
          const idx = rows.findIndex(r => r.id === row.id)
          if (key === '_no') return <span className="text-neutral-700 text-[13px] text-center">{idx + 1}</span>
          
          if (key === '_actions') {
            return (
              <div className="text-right">
                <Button variant="ghost" size="sm" className="!p-1 text-red-600 hover:bg-red-50" onClick={() => onDeleteRow(idx)}>
                  <FiTrash2 />
                </Button>
              </div>
            )
          }

          const col = module.columns.find((c) => c.key === key)
          if (!col) return null
          
          const value = row[key]
          const error = isEditing && col.required !== false && (!value || String(value).trim() === '')

          // View Mode (Not Editing)
          if (!isEditing) {
            if (col.type === 'checkbox') {
              return <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={!!value} readOnly disabled />
            }
            return <span className="text-neutral-800 text-[13px] leading-relaxed whitespace-pre-wrap">{String(value || '-') }</span>
          }

          // Edit Mode
          if (col.type === 'checkbox') {
            return (
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-600"
                checked={!!value}
                onChange={(e) => onUpdateCell(idx, key, e.target.checked)}
              />
            )
          }

          return (
            <Input
              col={col}
              disabled={false}
              value={value}
              onChange={(val) => onUpdateCell(idx, key, val)}
              moduleRows={rows}
              size="sm"
              error={error}
              contactsNames={contactsNames}
              contactsMap={contactsMap}
            />
          )
        }}
        emptyMessage="Belum ada data. Klik 'Tambah Baris' di bawah untuk memulai."
      />

      {/* Footer with "Add Row" button */}
      <div className="p-4 border-t border-neutral-200 bg-slate-50">
        <Button variant="ghost" size="sm" className="inline-flex items-center gap-2" onClick={onAddRow}>
          <FiPlus /> Tambah Baris
        </Button>
      </div>
    </Card>
  )
})

/* -------------------------------------------------------
 * Main RelationshipPlan Component
 * ----------------------------------------------------- */
export default function RelationshipPlan({ customerId = 'demo', contacts = [] }) {
  const storageKey = useMemo(() => `relationshipPlan_${customerId}`, [customerId])
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch (e) { void e }
    return {
      rp1: [],
      rp2: [{ id: 'rp2_1', done: true, effort: 'Pembuatan grup WA dedicated', notes: '' }],
      rp3: [{ id: 'rp3_1', conflict: 'Layanan internet down', desc: 'Internet mati pada working hour', date: '2025-08-20', solution: 'Pembenahan jaringan' }],
      rp4: [{ id: 'rp4_1', pic: 'Bapak Budi', position: 'Direktur IT', mechanism: 'Visit langsung, email', notes: 'Secara formal' }],
      rp5: [{ id: 'rp5_1', pic: 'Bapak Budi', position: 'Direktur IT', frequency: 'Quarterly', notes: 'Formal QBR' }],
    }
  })
  
  const [editing, setEditing] = useState({})
  const [drafts, setDrafts] = useState({})

  const saveData = useCallback((newData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [storageKey]);

  // --- Contact List/Map (Unchanged) ---
  const contactsList = useMemo(() => {
    let list = []
    if (Array.isArray(contacts)) {
      list = contacts.filter((c) => c && c.name)
    } else if (contacts && typeof contacts === 'object') {
      Object.values(contacts).forEach((arr) => {
        if (Array.isArray(arr)) list.push(...arr.filter((c) => c && c.name))
      })
    }
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
  const contactsNames = useMemo(() => contactsList.map((c) => c.name), [contactsList])
  const contactsMap = useMemo(() => Object.fromEntries(contactsList.map((c) => [c.name, c])), [contactsList])

  // --- Data Handlers (Modified for Drafts/Data) ---
  const updateCell = useCallback((moduleId, rowIndex, key, value) => {
    const targetIsDraft = !!editing[moduleId]
    const applyUpdate = (arr) => {
      const rows = [...(arr || [])]
      const row = { ...(rows[rowIndex] || {}) }
      row[key] = value
      // Auto-fill position from contact
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
      setData((prev) => {
        const nextData = { ...prev, [moduleId]: applyUpdate(prev[moduleId]) }
        saveData(nextData)
        return nextData
      })
    }
  }, [editing, contactsMap, saveData])

  const addRow = useCallback((moduleId, columns) => {
    const empty = { id: `temp_${Date.now()}` }
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

  const deleteRow = useCallback((moduleId, index) => {
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
  
  // --- Edit/Save/Cancel Handlers ---
  const handleEdit = useCallback((moduleId) => {
    setDrafts((prev) => ({ ...prev, [moduleId]: JSON.parse(JSON.stringify(data[moduleId] || [])) }))
    setEditing((e) => ({ ...e, [moduleId]: true }))
  }, [data])

  const handleSave = useCallback((moduleId) => {
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

  const handleCancel = useCallback((moduleId) => {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[moduleId]
      return next
    })
    setEditing((e) => ({ ...e, [moduleId]: false }))
  }, [])

  return (
    <div className="space-y-6">
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
          rows: rows,
          onEdit: () => handleEdit(m.id),
          onSave: () => handleSave(m.id),
          onCancel: () => handleCancel(m.id),
          onAddRow: () => addRow(m.id, m.columns),
          onDeleteRow: (index) => deleteRow(m.id, index),
          onUpdateCell: (index, key, value) => updateCell(m.id, index, key, value),
          contactsNames: contactsNames,
          contactsMap: contactsMap,
        }

        return <ModuleTable {...moduleProps} />
      })}
    </div>
  )
}