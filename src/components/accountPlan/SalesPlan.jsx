import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Modal from '@components/ui/Modal'
import FormInput from '@components/ui/FormInput'

const STATUSES = ['Draft', 'Active', 'Closed']

export default function SalesPlan({ customerId = 'demo' }) {
  const navigate = useNavigate()
  const storageKey = React.useMemo(() => `salesPlan_${customerId}`, [customerId])
  const [plans, setPlans] = React.useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
  })
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    title: '',
    dateStart: '',
    dateEnd: '',
    status: 'Draft',
    description: '',
  })
  const [errors, setErrors] = React.useState({})

  const resetForm = React.useCallback(() => {
    setForm({ title: '', dateStart: '', dateEnd: '', status: 'Draft', description: '' })
    setErrors({})
  }, [])

  const validate = React.useCallback(() => {
    const e = {}
    if (!form.title.trim()) e.title = true
    if (!form.dateStart) e.dateStart = true
    if (!form.dateEnd) e.dateEnd = true
    // optional: ensure end >= start
    if (form.dateStart && form.dateEnd && form.dateEnd < form.dateStart) e.dateEnd = true
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const savePlans = React.useCallback((next) => {
    setPlans(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore write errors (private mode, etc.)
    }
  }, [storageKey])

  const onCreate = React.useCallback(() => {
    if (!validate()) return
    const newPlan = {
      id: `sp_${Date.now()}`,
      ...form,
    }
    const next = [newPlan, ...plans]
    savePlans(next)
    setOpen(false)
    resetForm()
  }, [form, plans, savePlans, validate, resetForm])

  const onDelete = React.useCallback((id) => {
    const next = plans.filter((p) => p.id !== id)
    savePlans(next)
  }, [plans, savePlans])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Sales Plan</h3>
          <p className="text-xs text-neutral-500">Daftar plan dan inisiatif untuk akun ini.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)}>Create New Plan</Button>
        </div>
      </div>

      {/* List */}
      {plans.length === 0 ? (
        <Card className="p-4">
          <div className="text-sm text-neutral-600">Belum ada sales plan. Klik "Create New Plan" untuk menambahkan.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plans.map((p) => (
            <div key={p.id} className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/customers/${customerId}/sales-plan/${p.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">{p.title}</h4>
                  <p className="text-xs text-neutral-500">{p.dateStart || '-'} to {p.dateEnd || '-'}</p>
                </div>
                <span className={
                  `px-2 py-1 text-[10px] font-bold rounded-full border ` +
                  (p.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : p.status === 'Draft'
                    ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    : 'bg-blue-50 text-blue-600 border-blue-200')
                }>{p.status}</span>
              </div>
              {p.description && (
                <p className="mt-2 text-sm text-neutral-600">{p.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button variant="danger" size="sm" onClick={() => onDelete(p.id)}>Hapus</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={open}
        onClose={() => { setOpen(false); resetForm() }}
        title="Create Sales Plan"
        panelClassName="max-w-lg"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="back" onClick={() => { setOpen(false); resetForm() }}>Batal</Button>
            <Button onClick={onCreate}>Create</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Judul Plan<span className="text-rose-500">*</span></div>
            <FormInput value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} error={!!errors.title} placeholder="Contoh: Q4 2025 Digitalization Push" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Tanggal Mulai<span className="text-rose-500">*</span></div>
              <FormInput type="date" value={form.dateStart} onChange={(v) => setForm((f) => ({ ...f, dateStart: v }))} error={!!errors.dateStart} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Tanggal Selesai<span className="text-rose-500">*</span></div>
              <FormInput type="date" value={form.dateEnd} onChange={(v) => setForm((f) => ({ ...f, dateEnd: v }))} error={!!errors.dateEnd} />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Status</div>
            <FormInput type="select" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={STATUSES} />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Deskripsi</div>
            <FormInput type="textarea" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Ringkasan plan, objective, scope, dll." />
          </div>
        </div>
      </Modal>
    </div>
  )
}
