import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import Toolbar from '../components/ui/Toolbar'
import { Badge } from '../components/ui/Badge'
import { FaUsers, FaBalanceScale, FaProjectDiagram, FaChartBar, FaBoxOpen } from 'react-icons/fa'
import { FiEdit, FiChevronDown, FiChevronUp, FiBookOpen, FiClock, FiUser, FiPrinter, FiRotateCcw, FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import RichTextEditor from '../components/wiki/RichTextEditor'

function Section({ id, title, icon: Icon, isEmpty = false, collapsed = false, onToggle, headerRight, children }) {
  const contentRef = React.useRef(null)
  const [maxHeight, setMaxHeight] = React.useState('0px')

  const recalc = React.useCallback(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight
      setMaxHeight(collapsed ? '0px' : `${h}px`)
    }
  }, [collapsed])

  React.useEffect(() => { recalc() }, [recalc, children])
  React.useEffect(() => {
    const onR = () => recalc()
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [recalc])

  return (
  <section id={id} className="scroll-mt-[90px] px-2 sm:px-4">
  <div className="grid grid-cols-[24px_1fr] gap-2 items-start">
        {/* Icon column */}
        <div className="py-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-[#F0F6FF] text-[#2C5CC5] grid place-items-center ring-1 ring-[#CFE0FF]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        {/* Header row in column 2 */}
        <div className="py-2 flex items-center gap-2 min-w-0">
          <h2 id={`${id}-header`} className="text-lg font-semibold text-neutral-900">{title}</h2>
          {isEmpty && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0F6FF] text-[#2C5CC5] ring-1 ring-[#CFE0FF]">Empty</span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {headerRight}
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
              aria-label={collapsed ? 'Expand section' : 'Collapse section'}
              aria-expanded={!collapsed}
              aria-controls={`${id}-content`}
            >
              {collapsed ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {/* Content under column 2 */}
        <div className="col-start-2">
          <div
            ref={contentRef}
            style={{ maxHeight, transition: 'max-height 250ms ease, opacity 200ms ease, transform 200ms ease' }}
            aria-hidden={collapsed}
            id={`${id}-content`}
            role="region"
            aria-labelledby={`${id}-header`}
            className={`pr-1 sm:pr-2 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5CC5] ${isEmpty ? 'ring-1 ring-[#CFE0FF] rounded-lg' : ''} ${collapsed ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}
          >
            <div className="pt-2" />
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AccountProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const defaultSections = [
    { id: 'demography', label: 'Demography', icon: FaUsers },
    { id: 'competitor', label: 'Competitor', icon: FaBalanceScale },
    { id: 'value-chain', label: 'Value Chain Analysis', icon: FaProjectDiagram },
    { id: 'swot', label: 'SWOT', icon: FaChartBar },
    { id: 'recommended-products', label: 'Recommended Products', icon: FaBoxOpen },
  ]
  const defaultIds = new Set(defaultSections.map(s => s.id))
  const isBlankHtml = (html) => {
    if (!html) return true
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '')
    return text.length === 0
  }

  const storageKey = `account-profile:${id}`
  const [sections, setSections] = React.useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
  try { return JSON.parse(saved) } catch { /* ignore corrupted data */ }
    }
    // initialize with defaults
    return defaultSections.map((s) => ({ ...s, html: '' }))
  })

  // Track which sections are in edit mode (not persisted)
  const [editing, setEditing] = React.useState({})
  // Track collapsed state for sections (not persisted)
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem(`${storageKey}:collapsed`)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    return {}
  })
  // Track last edited timestamp
  const [lastEdited, setLastEdited] = React.useState(() => {
    const saved = localStorage.getItem(`${storageKey}:lastEdited`)
    return saved ? new Date(saved) : null
  })

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sections))
    const now = new Date()
    setLastEdited(now)
    localStorage.setItem(`${storageKey}:lastEdited`, now.toISOString())
  }, [sections, storageKey])

  // persist collapsed map
  React.useEffect(() => {
    localStorage.setItem(`${storageKey}:collapsed`, JSON.stringify(collapsed))
  }, [collapsed, storageKey])

  const upsertSectionHtml = (secId, html) => {
    setSections((prev) => prev.map((s) => (s.id === secId ? { ...s, html } : s)))
  }

  const addNewSection = () => {
    const baseId = `section-${Date.now()}`
    setSections((prev) => [...prev, { id: baseId, label: 'New Section', icon: null, html: '' }])
    setTimeout(() => {
      const el = document.getElementById(baseId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const removeSection = (secId) => {
    if (defaultIds.has(secId)) return // protect predefined sections
    setSections((prev) => prev.filter((s) => s.id !== secId))
  }
  const expandAll = () => {
    const allOpen = Object.fromEntries(sections.map(s => [s.id, false]))
    setCollapsed(allOpen)
  }
  const collapseAll = () => {
    const allClosed = Object.fromEntries(sections.map(s => [s.id, true]))
    setCollapsed(allClosed)
  }

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <PageHeader
        title="Profile Wiki"
        icon={FiBookOpen}
        variant="hero"
        right={(
          <Toolbar>
            <Button variant="secondary"><FiPrinter className="w-4 h-4" /> Export PDF</Button>
            <Button variant="secondary"><FiRotateCcw className="w-4 h-4" /> Riwayat</Button>
            <Button variant="secondary" onClick={() => navigate(`/customers/${id}`)}><FiArrowLeft className="w-4 h-4" /> Back</Button>
          </Toolbar>
        )}
        className="mb-4 bg-white rounded-xl p-4 border border-neutral-200"
      />

      {/* Wiki layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
        {/* Content */}
        <div>
          <Card className="p-1 sm:p-2 overflow-hidden">
            <div className="divide-y divide-neutral-100">
          {sections.map((s) => {
            const isEditing = !!editing[s.id]
            const toggleEdit = () => setEditing((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
            const empty = isBlankHtml(s.html)
            const isCollapsed = !!collapsed[s.id]
            const toggleCollapse = () => setCollapsed((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
            return (
              <Section
                key={s.id}
                id={s.id}
                title={s.label}
                icon={s.icon}
                isEmpty={empty}
                collapsed={isCollapsed}
                onToggle={toggleCollapse}
                headerRight={
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={toggleEdit}
                      className={`${isEditing ? 'bg-[#F0F6FF] ring-1 ring-[#CFE0FF]' : ''} text-[#2C5CC5]`}
                      title={isEditing ? 'Done' : 'Edit section'}
                      aria-label={isEditing ? 'Done editing section' : 'Edit section'}
                    >
                      <FiEdit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    {isEditing && !defaultIds.has(s.id) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeSection(s.id)}
                        aria-label="Remove section"
                      >
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </Button>
                    )}
                    {isEditing && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditing((prev) => ({ ...prev, [s.id]: false }))}
                        aria-label="Save section"
                      >
                        <FiSave className="w-4 h-4" /> Save
                      </Button>
                    )}
                  </div>
                }
              >
                {/* Inline rename when editing and not predefined */}
                {isEditing && !defaultIds.has(s.id) ? (
                  <div className="mb-2">
                    <input
                      className="px-2 py-1 rounded border border-neutral-200 text-sm"
                      value={s.label}
                      onChange={(e) => setSections((prev) => prev.map((x) => x.id === s.id ? { ...x, label: e.target.value } : x))}
                      aria-label="Rename section"
                    />
                  </div>
                ) : null}
                <RichTextEditor
                  value={s.html}
                  onChange={(html) => upsertSectionHtml(s.id, html)}
                  readOnly={!isEditing}
                />
              </Section>
            )
          })}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
  <aside className="lg:sticky lg:top-[84px] h-max space-y-4 hidden lg:block">
          {/* Kelengkapan Profil */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-neutral-800 mb-3">Kelengkapan Profil</div>
            <div className="flex items-center justify-center py-2">
              <RadialProgress current={sections.filter(s => !isBlankHtml(s.html)).length} total={sections.length} />
            </div>
          </Card>
          {/* Info Halaman */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-neutral-800 mb-3">Info Halaman</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-neutral-600"><FiClock /> Terakhir Diedit</div>
                <div className="text-neutral-900">{lastEdited ? lastEdited.toLocaleString() : '-'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-neutral-600"><FiUser /> Oleh</div>
                <div className="text-neutral-900"><Badge variant="neutral">Admin</Badge></div>
              </div>
            </div>
          </Card>
          {/* TOC */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">Daftar Isi</div>
              {(() => {
                const allOpen = sections.every((s) => !collapsed[s.id])
                const onClick = allOpen ? collapseAll : expandAll
                const label = allOpen ? 'Collapse All' : 'Expand All'
                return (
                  <Button variant="secondary" size="sm" onClick={onClick}>{label}</Button>
                )
              })()}
            </div>
            <ol className="space-y-1 list-decimal list-inside">
              {sections.map((s) => {
                const empty = isBlankHtml(s.html)
                return (
                  <li key={s.id} className={`text-sm ${empty ? 'text-neutral-400' : 'text-neutral-700'}`}>
                    <a href={`#${s.id}`} className="hover:text-[#2C5CC5]">
                      {s.label}
                    </a>
                    {empty && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400 align-middle" />}
                  </li>
                )
              })}
            </ol>
            <Button variant="secondary" size="sm" fullWidth onClick={addNewSection} className="mt-3 text-[#2C5CC5] hover:border-[#2C5CC5]">
              <FiPlus className="w-4 h-4" /> Add Section
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function RadialProgress({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const radius = 36
  const stroke = 8
  const norm = radius - stroke / 2
  const circumference = 2 * Math.PI * norm
  const offset = circumference - (pct / 100) * circumference
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={norm} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx="50" cy="50" r={norm}
        stroke="#2C5CC5"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" dominantBaseline="middle" textAnchor="middle" className="text-sm" fill="#111827" fontWeight="700">
        {current}/{total}
      </text>
      <text x="50" y="65" dominantBaseline="middle" textAnchor="middle" className="text-[10px]" fill="#6b7280">
        Modul
      </text>
    </svg>
  )
}
