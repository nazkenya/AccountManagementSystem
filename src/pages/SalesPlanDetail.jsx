import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '@components/ui/Card'
import Button from '@components/ui/Button'
import Modal from '@components/ui/Modal'
import FormInput from '@components/ui/FormInput'
import Tag from '@components/ui/Tag'
import { Badge } from '@components/ui/Badge'
import YesNoToggle from '@components/ui/YesNoToggle'
import TaskAddRow from '@components/ui/TaskAddRow'

const INIT_STATUS = ['DIRENCANAKAN', 'SEDANG BERJALAN', 'BELUM MULAI', 'SELESAI']
// Using shared YesNoToggle component from ui

export default function SalesPlanDetail() {
  const { id: customerId, planId } = useParams()
  const navigate = useNavigate()
  const storageKey = React.useMemo(() => `salesPlan_${customerId}`, [customerId])
  const [plans] = React.useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore parse errors
    }
    return []
  })
  const plan = React.useMemo(() => plans.find(p => p.id === planId) || { title: '-', dateStart: '', dateEnd: '' }, [plans, planId])

  // Per-plan initiatives stored under another key
  const initKey = React.useMemo(() => `salesPlan_${customerId}_${planId}_initiatives`, [customerId, planId])
  const [inits, setInits] = React.useState(() => {
    try {
      const raw = localStorage.getItem(initKey)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore parse errors
    }
    return []
  })
  const persistInits = React.useCallback((next) => {
    setInits(next)
    try {
      localStorage.setItem(initKey, JSON.stringify(next))
    } catch {
      // ignore write errors
    }
  }, [initKey])

  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({
    action: '',
    products: '', // comma separated tags
    pics: '', // comma separated tags
    status: INIT_STATUS[0],
    initialTasks: [], // array of {id,title,done,requiresCustomer}
    newTaskDraft: { title: '', requiresCustomer: false },
  })
  const [errors, setErrors] = React.useState({})
  const validate = React.useCallback(() => {
    const e = {}
    if (!form.action.trim()) e.action = true
    setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const addInitiative = React.useCallback(() => {
    if (!validate()) return
    const newInit = {
      id: `init_${Date.now()}`,
      action: form.action,
      products: (form.products || '').split(',').map(s => s.trim()).filter(Boolean),
      pics: (form.pics || '').split(',').map(s => s.trim()).filter(Boolean),
      status: form.status,
      tasks: Array.isArray(form.initialTasks) ? form.initialTasks : [],
    }
    persistInits([ ...inits, newInit ])
    setOpen(false)
    setForm({ action: '', products: '', pics: '', status: INIT_STATUS[0], initialTasks: [], newTaskDraft: { title: '', requiresCustomer: false } })
  }, [form, inits, persistInits, validate])

  const toggleTask = React.useCallback((initId, taskId, done) => {
    const next = inits.map((it) => it.id === initId ? { ...it, tasks: (it.tasks||[]).map(t => t.id === taskId ? { ...t, done } : t) } : it)
    persistInits(next)
  }, [inits, persistInits])

  const deleteInit = React.useCallback((initId) => {
    persistInits(inits.filter((it) => it.id !== initId))
  }, [inits, persistInits])

  // Add new task per initiative
  const [taskDrafts, setTaskDrafts] = React.useState({})
  const addTask = React.useCallback((initId) => {
    const draft = taskDrafts[initId] || {}
    const title = (draft.title || '').trim()
    if (!title) return
    const next = inits.map((it) => it.id === initId ? {
      ...it,
      tasks: [ ...(it.tasks || []), { id: `t_${Date.now()}`, title, done: false, requiresCustomer: !!draft.requiresCustomer } ]
    } : it)
    persistInits(next)
    setTaskDrafts((d) => ({ ...d, [initId]: { title: '', requiresCustomer: false } }))
  }, [inits, taskDrafts, persistInits])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{plan.title}</h2>
          <div className="text-sm text-neutral-600">Period: {plan.dateStart || '-'} to {plan.dateEnd || '-'}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate(`/customers/${customerId}#sales`)}>Back to Plan List</Button>
          <Button onClick={() => setOpen(true)}>Tambah Inisiatif</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden ring-1 ring-neutral-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-[12px] text-neutral-600">
                <th className="px-4 py-3 font-semibold">Inisiatif / Action Item</th>
                <th className="px-4 py-3 font-semibold">Produk Target</th>
                <th className="px-4 py-3 font-semibold">PIC Target</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Task List</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {inits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-sm text-neutral-500">Belum ada inisiatif. Klik "Tambah Inisiatif".</td>
                </tr>
              )}
              {inits.map((it) => {
                const total = (it.tasks || []).length
                const done = (it.tasks || []).filter(t => t.done).length
                return (
                  <tr key={it.id} className="align-top">
                    <td className="px-4 py-4 text-sm text-neutral-900">{it.action}</td>
                    <td className="px-4 py-4 space-y-1">
                      {(it.products || []).map((p, i) => (
                        <Tag key={i}>{p}</Tag>
                      ))}
                    </td>
                    <td className="px-4 py-4 space-y-1">
                      {(it.pics || []).map((p, i) => (
                        <span key={i} className="inline-block text-[11px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mr-2">{p}</span>
                      ))}
                    </td>
                    <td className="px-4 py-4">
                      <span className={
                        'inline-block text-[11px] font-bold px-3 py-1 rounded-full border ' +
                        (it.status === 'DIRENCANAKAN' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : it.status === 'SEDANG BERJALAN' ? 'bg-amber-50 text-amber-700 border-amber-200' : it.status === 'BELUM MULAI' ? 'bg-neutral-100 text-neutral-600 border-neutral-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                      }>{it.status}</span>
                    </td>
                    <td className="px-4 py-4 w-[360px]">
                      <div className="space-y-2">
                        {(it.tasks || []).map((t) => (
                          <label key={t.id} className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={!!t.done} onChange={(e) => toggleTask(it.id, t.id, e.target.checked)} />
                            <span className={`text-[13px] ${t.done ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>{t.title}</span>
                            {t.requiresCustomer && <Badge variant="info" className="ml-1">Butuh customer</Badge>}
                            {t.requiresCustomer && <Button size="xs" variant="secondary" className="ml-1">Do Visit</Button>}
                          </label>
                        ))}
                        {/* add task inline */}
                        <TaskAddRow
                          value={{ title: taskDrafts[it.id]?.title || '', requiresCustomer: !!(taskDrafts[it.id]?.requiresCustomer) }}
                          onChange={(draft) => setTaskDrafts((d) => ({ ...d, [it.id]: draft }))}
                          onAdd={() => addTask(it.id)}
                          size="sm"
                        />
                        <div className="text-[12px] font-medium text-neutral-500">{done}/{total} completed</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="danger" onClick={() => deleteInit(it.id)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal create initiative */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tambah Inisiatif"
        panelClassName="max-w-2xl"
        footer={(
          <div className="flex items-center justify-end gap-2">
            <Button variant="back" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={addInitiative}>Tambah</Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Inisiatif / Action Item<span className="text-rose-500">*</span></div>
            <FormInput type="textarea" value={form.action} onChange={(v) => setForm((f) => ({ ...f, action: v }))} error={!!errors.action} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Produk Target</div>
              <FormInput type="text" placeholder="Pisahkan dengan koma" value={form.products} onChange={(v) => setForm((f) => ({ ...f, products: v }))} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">PIC Target</div>
              <FormInput type="text" placeholder="Pisahkan dengan koma" value={form.pics} onChange={(v) => setForm((f) => ({ ...f, pics: v }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Status</div>
              <FormInput type="select" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={INIT_STATUS} />
            </div>
            <div />
          </div>

          {/* Tasks section at the bottom */}
          <div className="mt-2 pt-3 border-t border-neutral-200">
            <div className="text-[11px] font-semibold text-neutral-600 uppercase mb-1">Tasks Awal</div>
            <div className="text-[12px] text-neutral-500 mb-2">Tambahkan beberapa task sebelum membuat inisiatif.</div>
            {/* List tasks added */}
            <div className="space-y-2 mb-2">
              {(!form.initialTasks || form.initialTasks.length === 0) && (
                <div className="text-[12px] text-neutral-500">Belum ada task awal.</div>
              )}
              {(form.initialTasks || []).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-800">{t.title}</span>
                    {t.requiresCustomer && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Butuh customer</span>
                    )}
                  </div>
                  <Button size="xs" variant="secondary" className="text-rose-600 hover:text-rose-700" onClick={() => setForm((f) => ({ ...f, initialTasks: (f.initialTasks || []).filter(x => x.id !== t.id) }))}>Hapus</Button>
                </div>
              ))}
            </div>
            {/* Add new task row: choose involvement first, then input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[12px] text-neutral-600">Butuh customer?</span>
                <YesNoToggle
                  value={!!(form.newTaskDraft?.requiresCustomer)}
                  onChange={(v) => setForm((f) => ({ ...f, newTaskDraft: { ...(f.newTaskDraft || { title: '' }), requiresCustomer: !!v } }))}
                />
              </div>
              <FormInput
                type="text"
                placeholder="Tambah task..."
                value={form.newTaskDraft?.title || ''}
                onChange={(v) => setForm((f) => ({ ...f, newTaskDraft: { ...(f.newTaskDraft || { requiresCustomer: false }), title: v } }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const title = (form.newTaskDraft?.title || '').trim()
                    if (!title) return
                    setForm((f) => ({
                      ...f,
                      initialTasks: [ ...(f.initialTasks || []), { id: `t_${Date.now()}`, title, done: false, requiresCustomer: !!(f.newTaskDraft?.requiresCustomer) } ],
                      newTaskDraft: { title: '', requiresCustomer: false }
                    }))
                  }
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const title = (form.newTaskDraft?.title || '').trim()
                  if (!title) return
                  setForm((f) => ({
                    ...f,
                    initialTasks: [ ...(f.initialTasks || []), { id: `t_${Date.now()}`, title, done: false, requiresCustomer: !!(f.newTaskDraft?.requiresCustomer) } ],
                    newTaskDraft: { title: '', requiresCustomer: false }
                  }))
                }}
              >Tambah Task</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
