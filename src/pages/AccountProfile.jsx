import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import Toolbar from '../components/ui/Toolbar'
import { Badge } from '../components/ui/Badge'
import Table from '../components/ui/Table'
import { FaUsers, FaBalanceScale, FaProjectDiagram, FaChartBar, FaBoxOpen } from 'react-icons/fa'
import { FiEdit, FiBookOpen, FiClock, FiUser, FiPrinter, FiRotateCcw, FiArrowLeft, FiSave, FiPlus, FiTrash2, FiFileText } from 'react-icons/fi'
import DebouncedRichTextEditor from '../components/wiki/DebouncedRichTextEditor'
import Select from '../components/ui/Select'
import FormInput from '../components/ui/FormInput'
import { Section } from './accountProfile/components/Section'
import { Field, Group } from './accountProfile/components/Fields'
import { DebouncedTextInput, DebouncedTextArea, FileInput, ViewOrEdit } from './accountProfile/components/Inputs'
import { RadialProgress } from './accountProfile/components/RadialProgress'
import { PicCard } from './accountProfile/components/PicCard'
import { useDebouncedLocalStorage } from './accountProfile/hooks/useDebouncedLocalStorage'
import { useCollapsedMap } from './accountProfile/hooks/useCollapsedMap'
import { usePics } from './accountProfile/hooks/usePics'

export default function AccountProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const formStorageKey = `account-profile:${id}:form`

  const initialForm = React.useMemo(() => ({
    companyName: '', nipnas: '', segment: '', subsegment: '', witel: '', address: '', telephone: '', website: '', email: '',
    companyLogo: null, companyOverview: '', visionMission: '', strategicHighlights: '', priorityLevel: '', assetValue: '', employeesRange: '', subsidiaries: '',
  // Legacy single PIC fields (kept for migration/back-compat)
  picName: '', picTitle: '', picPhone: '', picEmail: '', picBirthPlace: '', picBirthDate: '', picEducation: '', picHobbies: '', relationshipStatus: '', decisionRole: '',
  // New: multiple PICs as cards
  pics: [],
    // Legacy single fields for Telkom Products & Services (kept for migration)
    productTitle: '', contractDate: '', contractEndDate: '', revenueYTD: '', churnedProduct: '', churnDate: '', churnReason: '', connectivityConfig: '',
    // New table data for Telkom Products & Services
    contracts: [], // {id,title,contractDate,endDate}
    financials: [], // {id,revenueYTD,churnedProduct,churnDate}
    notesRows: [], // {id,churnReason,connectivityConfig}
    reportDate: '', serviceName: '', hardComplaint: '', urgency: '', slgAchievement: '', problemDescription: '',
    competitorName: '', competitorProduct: '', competitorContractEnd: '', competitorRevenueYTD: '', voiceOfCustomer: '', competitorPerformanceNote: '', competitorStrategy: '',
    fiveForcesEntrants: '', fiveForcesSubstitute: '', fiveForcesBuyer: '', fiveForcesSupplier: '', fiveForcesRivalry: '',
    strengths: '', weaknesses: '', opportunities: '', threats: '', valueChainFile: null, itRoadmapFile: null,
  }), [])

  const [formData, setFormDataRaw, lastEditedForm] = useDebouncedLocalStorage(formStorageKey, initialForm)
  // migrate legacy PIC fields (one-time)
  React.useEffect(() => {
    if (formData.pics.length === 0 && (formData.picName || formData.picTitle || formData.picPhone || formData.picEmail)) {
      setFormDataRaw(prev => ({
        ...prev,
        pics: [{
          id: `pic-${Date.now()}`,
          name: prev.picName || '',
          title: prev.picTitle || '',
          phone: prev.picPhone || '',
          email: prev.picEmail || '',
          birthPlace: prev.picBirthPlace || '',
          birthDate: prev.picBirthDate || '',
          education: prev.picEducation || '',
          hobbies: prev.picHobbies || '',
          relationshipStatus: prev.relationshipStatus || '',
          decisionRole: prev.decisionRole || '',
          avatar: null,
        }],
      }))
    }
  }, [formData, setFormDataRaw])

  // Migrate legacy single Telkom Products & Services fields into new table rows (one-time)
  React.useEffect(() => {
    setFormDataRaw(prev => {
      const updates = { ...prev }
      // Contracts
      if (Array.isArray(updates.contracts) && updates.contracts.length === 0 && (updates.productTitle || updates.contractDate || updates.contractEndDate)) {
        updates.contracts = [{ id: `ctr-${Date.now()}`, title: updates.productTitle || '', contractDate: updates.contractDate || '', endDate: updates.contractEndDate || '' }]
        // Clear legacy fields to avoid confusion
        updates.productTitle = ''
        updates.contractDate = ''
        updates.contractEndDate = ''
      }
      // Financials
      if (Array.isArray(updates.financials) && updates.financials.length === 0 && (updates.revenueYTD || updates.churnedProduct || updates.churnDate)) {
        updates.financials = [{ id: `fin-${Date.now()}`, revenueYTD: updates.revenueYTD || '', churnedProduct: updates.churnedProduct || '', churnDate: updates.churnDate || '' }]
        updates.revenueYTD = ''
        updates.churnedProduct = ''
        updates.churnDate = ''
      }
      // Notes
      if (Array.isArray(updates.notesRows) && updates.notesRows.length === 0 && (updates.churnReason || updates.connectivityConfig)) {
        updates.notesRows = [{ id: `note-${Date.now()}`, churnReason: updates.churnReason || '', connectivityConfig: updates.connectivityConfig || '' }]
        updates.churnReason = ''
        updates.connectivityConfig = ''
      }
      return updates
    })
  }, [setFormDataRaw])

  const setField = React.useCallback((key, value) => setFormDataRaw(prev => ({ ...prev, [key]: value })), [setFormDataRaw])
  const { addPic, updatePic, removePic, movePic } = usePics(setFormDataRaw)
  const [isReordering, setIsReordering] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const toWhatsApp = (raw) => {
    if (!raw) return ''
    let digits = String(raw).replace(/[^\d+]/g, '')
    if (digits.startsWith('+')) digits = digits.slice(1)
    if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
    return `https://wa.me/${digits}`
  }
  const onAvatarChange = React.useCallback((idx, file) => {
    if (!file) return
    const max = 3 * 1024 * 1024
    if (file.size > max) { alert('Avatar too large. Max 3MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const payload = { name: file.name, type: file.type, dataUrl: typeof reader.result === 'string' ? reader.result : '' }
      updatePic(idx, 'avatar', payload)
    }
    reader.readAsDataURL(file)
  }, [updatePic])
  const handleFileChange = React.useCallback((key, file, opts = { maxSizeMB: 5 }) => {
    if (!file) return
    const max = (opts.maxSizeMB || 5) * 1024 * 1024
    if (file.size > max) { alert(`File too large. Max ${opts.maxSizeMB}MB.`); return }
    const reader = new FileReader()
    reader.onload = () => {
      const payload = { name: file.name, type: file.type, dataUrl: typeof reader.result === 'string' ? reader.result : '' }
      setField(key, payload)
    }
    reader.readAsDataURL(file)
  }, [setField])

  // Row mutation helpers for table sections
  const updateRow = React.useCallback((key, id, field, value) => {
    setFormDataRaw(prev => ({
      ...prev,
      [key]: (prev[key] || []).map(r => (r.id === id ? { ...r, [field]: value } : r)),
    }))
  }, [setFormDataRaw])

  const removeRow = React.useCallback((key, id) => {
    setFormDataRaw(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter(r => r.id !== id),
    }))
  }, [setFormDataRaw])

  const addRow = React.useCallback((key, payload) => {
    if (!payload) return
    setFormDataRaw(prev => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        { id: `${key}-${Date.now()}`, ...payload },
      ],
    }))
  }, [setFormDataRaw])

  // Small table components
  const getNonEmptyRows = React.useCallback((rows, keys) => {
    if (!Array.isArray(rows)) return []
    return rows.filter(r => keys.some(k => (r?.[k] ?? '').toString().trim() !== ''))
  }, [])
  const hasEmptyRow = React.useCallback((rows, keys) => {
    if (!Array.isArray(rows)) return false
    return rows.some(r => keys.every(k => (r?.[k] ?? '').toString().trim() === ''))
  }, [])
  function ContractTable({ rows = [], isEditing }) {
    const columns = [
      { key: 'title', label: 'Project/Product Title' },
      { key: 'contractDate', label: 'Date of Contract' },
      { key: 'endDate', label: 'End of Contract' },
      ...(isEditing ? [{ key: 'actions', label: 'Actions' }] : []),
    ]
    const displayRows = isEditing
      ? rows
      : getNonEmptyRows(rows, ['title', 'contractDate', 'endDate'])
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-neutral-900">Contract</div>
          {isEditing && (
            <Button
              size="sm"
              variant="secondary"
              disabled={hasEmptyRow(rows, ['title','contractDate','endDate'])}
              onClick={() => addRow('contracts', { title: '', contractDate: '', endDate: '' })}
            >
              <FiPlus className="w-4 h-4" /> Add
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          data={displayRows}
          rowKey={(r) => r.id}
          renderCell={(row, key) => {
            if (key === 'actions' && isEditing) {
              return (
                <Button variant="secondary" size="sm" onClick={() => removeRow('contracts', row.id)}><FiTrash2 /> Delete</Button>
              )
            }
            if (isEditing) {
              if (key === 'title') return <FormInput size="sm" value={row.title || ''} onChange={(v) => updateRow('contracts', row.id, 'title', v)} placeholder="Enter title" />
              if (key === 'contractDate') return <FormInput size="sm" type="date" value={row.contractDate || ''} onChange={(v) => updateRow('contracts', row.id, 'contractDate', v)} />
              if (key === 'endDate') return <FormInput size="sm" type="date" value={row.endDate || ''} onChange={(v) => updateRow('contracts', row.id, 'endDate', v)} />
            }
            return row[key] || '—'
          }}
          emptyMessage="No contracts"
        />
      </div>
    )
  }

  function FinancialTable({ rows = [], isEditing }) {
    const columns = [
      { key: 'revenueYTD', label: 'Total Revenue YTD (IDR M)' },
      { key: 'churnedProduct', label: 'Churned Product' },
      { key: 'churnDate', label: 'Date of Churn' },
      ...(isEditing ? [{ key: 'actions', label: 'Actions' }] : []),
    ]
    const displayRows = isEditing
      ? rows
      : getNonEmptyRows(rows, ['revenueYTD', 'churnedProduct', 'churnDate'])
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-neutral-900">Financial & Churn</div>
          {isEditing && (
            <Button
              size="sm"
              variant="secondary"
              disabled={hasEmptyRow(rows, ['revenueYTD','churnedProduct','churnDate'])}
              onClick={() => addRow('financials', { revenueYTD: '', churnedProduct: '', churnDate: '' })}
            >
              <FiPlus className="w-4 h-4" /> Add
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          data={displayRows}
          rowKey={(r) => r.id}
          renderCell={(row, key) => {
            if (key === 'actions' && isEditing) {
              return (
                <Button variant="secondary" size="sm" onClick={() => removeRow('financials', row.id)}><FiTrash2 /> Delete</Button>
              )
            }
            if (isEditing) {
              if (key === 'revenueYTD') return <FormInput size="sm" type="number" value={row.revenueYTD || ''} onChange={(v) => updateRow('financials', row.id, 'revenueYTD', v)} placeholder="0" />
              if (key === 'churnedProduct') return <FormInput size="sm" value={row.churnedProduct || ''} onChange={(v) => updateRow('financials', row.id, 'churnedProduct', v)} placeholder="Product" />
              if (key === 'churnDate') return <FormInput size="sm" type="date" value={row.churnDate || ''} onChange={(v) => updateRow('financials', row.id, 'churnDate', v)} />
            }
            return row[key] || '—'
          }}
          emptyMessage="No financial records"
        />
      </div>
    )
  }

  function NotesTable({ rows = [], isEditing }) {
    const columns = [
      { key: 'churnReason', label: 'Reason for Churn' },
      { key: 'connectivityConfig', label: 'Connectivity Configuration' },
      ...(isEditing ? [{ key: 'actions', label: 'Actions' }] : []),
    ]
    const displayRows = isEditing
      ? rows
      : getNonEmptyRows(rows, ['churnReason', 'connectivityConfig'])
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-neutral-900">Notes</div>
          {isEditing && (
            <Button
              size="sm"
              variant="secondary"
              disabled={hasEmptyRow(rows, ['churnReason','connectivityConfig'])}
              onClick={() => addRow('notesRows', { churnReason: '', connectivityConfig: '' })}
            >
              <FiPlus className="w-4 h-4" /> Add
            </Button>
          )}
        </div>
        <Table
          columns={columns}
          data={displayRows}
          rowKey={(r) => r.id}
          renderCell={(row, key) => {
            if (key === 'actions' && isEditing) {
              return (
                <Button variant="secondary" size="sm" onClick={() => removeRow('notesRows', row.id)}><FiTrash2 /> Delete</Button>
              )
            }
            if (isEditing) {
              if (key === 'churnReason') return <FormInput type="textarea" size="sm" rows={2} value={row.churnReason || ''} onChange={(v) => updateRow('notesRows', row.id, 'churnReason', v)} />
              if (key === 'connectivityConfig') return <FormInput type="textarea" size="sm" rows={2} value={row.connectivityConfig || ''} onChange={(v) => updateRow('notesRows', row.id, 'connectivityConfig', v)} />
            }
            return <div className="text-sm whitespace-pre-wrap">{row[key] || '—'}</div>
          }}
          emptyMessage="No notes"
        />
      </div>
    )
  }

  // Custom sections (user-defined). We no longer seed defaults; start empty.
  const defaultSections = React.useMemo(() => [], [])
  const defaultIds = React.useMemo(() => new Set(defaultSections.map(s => s.id)), [defaultSections])
  const isBlankHtml = React.useCallback((html) => {
    if (!html) return true
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '')
    return text.length === 0
  }, [])

  // Render helper: if value contains HTML, render as rich HTML; otherwise render plain text preserving line breaks
  const renderRichOrPlain = React.useCallback((val) => {
    if (isBlankHtml(val)) return <div className="text-sm text-neutral-500">—</div>
    const looksHTML = /<\/?[a-z][\s\S]*>/i.test(val)
    return looksHTML
      ? <div className="prose prose-neutral max-w-none text-sm" dangerouslySetInnerHTML={{ __html: val }} />
      : <div className="prose prose-neutral max-w-none text-sm whitespace-pre-wrap">{val}</div>
  }, [isBlankHtml])

  // Using Field with stacked layout for uniformity across the page

  const storageKey = `account-profile:${id}`
  const [sections, setSections, lastEditedSections] = useDebouncedLocalStorage(storageKey, defaultSections.map(s => ({ ...s, html: '' })))
  // One-time migration: remove legacy seeded defaults and empty placeholder sections
  const didCleanLegacy = React.useRef(false)
  React.useEffect(() => {
    if (didCleanLegacy.current) return
    didCleanLegacy.current = true
    if (!Array.isArray(sections) || sections.length === 0) return
    const legacyIds = new Set(['demography','competitor','value-chain','swot','recommended-products'])
    const filtered = sections.filter(s => {
      const isLegacy = legacyIds.has(s.id)
      const isPlaceholder = /^(new\s+section|section)$/i.test((s.label || '').trim())
      // Remove only if it's legacy/placeholder AND empty
      if ((isLegacy || isPlaceholder) && isBlankHtml(s.html)) return false
      return true
    })
    if (filtered.length !== sections.length) setSections(filtered)
  }, [sections, setSections, isBlankHtml])
  const [templateEditing, setTemplateEditing] = React.useState({})
  const [editing, setEditing] = React.useState({})
  const { collapsed, setCollapsed, expandAll, collapseAll } = useCollapsedMap(storageKey)
  const lastEdited = lastEditedSections || lastEditedForm

  const upsertSectionHtml = (secId, html) => {
    setSections((prev) => prev.map((s) => (s.id === secId ? { ...s, html } : s)))
  }

  // Add a new custom section with Rich Text Editor
  const addNewSection = React.useCallback(() => {
    const baseId = `section-${Date.now()}`
    setSections((prev) => [...prev, { id: baseId, label: 'Untitled Section', icon: null, html: '' }])
    // Open edit immediately for quick rename/content
    setEditing(prev => ({ ...prev, [baseId]: true }))
    setTimeout(() => {
      const el = document.getElementById(baseId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [setSections, setEditing])

  const removeSection = React.useCallback((secId) => {
    if (defaultIds.has(secId)) return // protect predefined sections
    setSections((prev) => prev.filter((s) => s.id !== secId))
  }, [defaultIds, setSections])

  // Compute short summary for each template section when collapsed
  const getTemplateSummary = React.useCallback((secId) => {
    const join = (arr) => arr.filter(Boolean).join(' • ')
    switch (secId) {
      case 'template-company':
        return join([formData.companyName, formData.nipnas])
      case 'template-personnel': {
        const first = (formData.pics && formData.pics[0]) || null
        const initials = (first?.name || '').trim().split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toLowerCase()
        const count = Array.isArray(formData.pics) ? formData.pics.length : 0
        return join([initials || null, count ? String(count) : null])
      }
      case 'template-products':
        // Prefer first contract row summary; fallback to legacy fields
        if (Array.isArray(formData.contracts) && formData.contracts.length > 0) {
          const c = formData.contracts[0]
          return join([c.title, c.endDate])
        }
        return join([formData.productTitle, formData.contractEndDate])
      case 'template-service':
        return join([formData.serviceName, formData.urgency])
      case 'template-competitor':
        return join([formData.competitorName, formData.competitorProduct])
      case 'template-strategic':
        return join([formData.fiveForcesRivalry && `Rivalry: ${formData.fiveForcesRivalry}`, formData.fiveForcesBuyer && `Buyer: ${formData.fiveForcesBuyer}`])
      default:
        return ''
    }
  }, [formData])

  // Template section wrapper
  const TemplateSection = ({ secId, title, icon: Icon, children }) => {
    const isCollapsed = !!collapsed[secId]
    const toggleCollapse = () => setCollapsed(prev => ({ ...prev, [secId]: !prev[secId] }))
    const isEditing = !!templateEditing[secId]
    const toggleEdit = () => setTemplateEditing(prev => ({ ...prev, [secId]: !prev[secId] }))
    const summary = getTemplateSummary(secId)
    return (
      <Section
        id={secId}
        title={title}
        icon={Icon}
        isEmpty={false}
        collapsed={isCollapsed}
        onToggle={toggleCollapse}
        summary={summary}
        headerRight={
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={toggleEdit} className="text-[#2C5CC5]" aria-label="Edit section">
                <FiEdit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            {isEditing && (
              <Button variant="primary" size="sm" onClick={toggleEdit} aria-label="Save section"><FiSave className="w-4 h-4" /> Save</Button>
            )}
          </div>
        }
      >
        <div className="space-y-4">
          {typeof children === 'function' ? children(isEditing) : children}
        </div>
      </Section>
    )
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
          <Card className="p-2 sm:p-3 overflow-hidden">
            {/* Template Modules */}
            <div className="divide-y divide-neutral-100">
              <TemplateSection secId="template-company" title="Company Demographics" icon={FaUsers}>
                {(isEditing) => (
                  <>
                    {/* Identity row: Larger logo at left, Name + NIPNAS side-by-side at right */}
                    <div className="grid grid-cols-[96px_1fr] gap-4 items-start">
                      <div>
                        <ViewOrEdit
                          editing={isEditing}
                          view={formData.companyLogo ? (
                            <img
                              src={formData.companyLogo.dataUrl}
                              alt="Company Logo"
                              className="w-24 h-24 object-cover rounded-lg ring-1 ring-neutral-200"
                            />
                          ) : (
                            <div className="text-sm text-neutral-500">—</div>
                          )}
                          chip={false}
                        >
                          <FileInput
                            id="companyLogo"
                            value={formData.companyLogo}
                            onChange={(f) => handleFileChange('companyLogo', f, { maxSizeMB: 3 })}
                            onClear={() => setField('companyLogo', null)}
                            accept="image/*"
                            editLabel="Edit Logo"
                            removeLabel="Erase Logo"
                            uploadLabel="Upload logo"
                            previewSize="w-24 h-24"
                          />
                        </ViewOrEdit>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="companyName" className="text-sm text-neutral-700 font-medium">Company Name</label>
                          <ViewOrEdit
                            editing={isEditing}
                            view={<div className="mt-1 text-sm text-neutral-900">{formData.companyName || '—'}</div>}
                          >
                            <DebouncedTextInput id="companyName" value={formData.companyName} onChange={v => setField('companyName', v)} placeholder="e.g., PT Nusantara Teknologi" />
                          </ViewOrEdit>
                        </div>
                        <div>
                          <label htmlFor="nipnas" className="text-sm text-neutral-700 font-medium">NIPNAS</label>
                          <ViewOrEdit
                            editing={isEditing}
                            view={<div className="mt-1 text-sm">{formData.nipnas || '—'}</div>}
                          >
                            <DebouncedTextInput id="nipnas" value={formData.nipnas} onChange={v => setField('nipnas', v)} placeholder="e.g., 123456789" />
                          </ViewOrEdit>
                        </div>
                      </div>
                    </div>
                    <Group title="Basic">
                      <Field idFor="segment" label="Segment"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.segment || '—'}</div>}><DebouncedTextInput id="segment" value={formData.segment} onChange={v => setField('segment', v)} placeholder="e.g., Enterprise" /></ViewOrEdit></Field>
                      <Field idFor="subsegment" label="Subsegment"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.subsegment || '—'}</div>}><DebouncedTextInput id="subsegment" value={formData.subsegment} onChange={v => setField('subsegment', v)} placeholder="e.g., Retail" /></ViewOrEdit></Field>
                      <Field idFor="witel" label="Witel"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.witel || '—'}</div>}><DebouncedTextInput id="witel" value={formData.witel} onChange={v => setField('witel', v)} placeholder="e.g., Witel Jakarta" /></ViewOrEdit></Field>
                    </Group>
                    <Group title="Contact">
                      <Field idFor="telephone" label="Telephone"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.telephone || '—'}</div>}><DebouncedTextInput id="telephone" value={formData.telephone} onChange={v => setField('telephone', v)} placeholder="e.g., +62 21 555 123" /></ViewOrEdit></Field>
                      <Field idFor="website" label="Website"><ViewOrEdit editing={isEditing} view={formData.website ? (
                        <a href={formData.website} target="_blank" rel="noreferrer" className="text-[#2C5CC5] hover:underline break-all whitespace-normal leading-5">{formData.website}</a>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}><DebouncedTextInput id="website" type="url" value={formData.website} onChange={v => setField('website', v)} placeholder="https://example.co.id" /></ViewOrEdit></Field>
                      <Field idFor="email" label="Email"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.email || '—'}</div>}><DebouncedTextInput id="email" type="email" value={formData.email} onChange={v => setField('email', v)} placeholder="info@example.co.id" /></ViewOrEdit></Field>
                      <Field idFor="address" label="Address" className="sm:col-span-2"><ViewOrEdit editing={isEditing} view={<span className="leading-5 whitespace-pre-wrap break-words">{formData.address || '—'}</span>}><DebouncedTextArea id="address" value={formData.address} onChange={v => setField('address', v)} rows={2} placeholder="Street, City, Province, Postal Code" /></ViewOrEdit></Field>
                    </Group>
                    <Group title="Meta">
                      <Field idFor="priorityLevel" label="Priority Level"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.priorityLevel || '—'}</div>}>
                        <Select value={formData.priorityLevel} onChange={e => setField('priorityLevel', e.target.value)} id="priorityLevel">
                          <option value="">Select…</option>
                          <option value="Top 20">Top 20</option>
                          <option value="Top 50">Top 50</option>
                          <option value="Others">Others</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="assetValue" label="Asset Value (IDR)"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.assetValue || '—'}</div>}><DebouncedTextInput id="assetValue" type="number" value={formData.assetValue} onChange={v => setField('assetValue', v)} placeholder="e.g., 500000000" /></ViewOrEdit></Field>
                      <Field idFor="employeesRange" label="Number of Employees"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.employeesRange || '—'}</div>}>
                        <Select value={formData.employeesRange} onChange={e => setField('employeesRange', e.target.value)} id="employeesRange">
                          <option value="">Select…</option>
                          <option value="<100">&lt;100</option>
                          <option value="100-1000">100-1000</option>
                          <option value=">1000">&gt;1000</option>
                        </Select>
                      </ViewOrEdit></Field>
                    </Group>
                    <Group title="Narrative" gridClassName="gap-y-6">
                      <Field idFor="companyOverview" label="Company Overview" className="sm:col-span-2 pb-2 border-b border-neutral-200" stacked>
                        <ViewOrEdit editing={isEditing} view={renderRichOrPlain(formData.companyOverview)}>
                          <DebouncedRichTextEditor value={formData.companyOverview} onChange={(html) => setField('companyOverview', html)} />
                        </ViewOrEdit>
                      </Field>
                      <Field idFor="visionMission" label="Vision & Mission" className="sm:col-span-2 py-2 border-b border-neutral-200" stacked>
                        <ViewOrEdit editing={isEditing} view={renderRichOrPlain(formData.visionMission)}>
                          <DebouncedRichTextEditor value={formData.visionMission} onChange={(html) => setField('visionMission', html)} />
                        </ViewOrEdit>
                      </Field>
                      <Field idFor="strategicHighlights" label="Strategic Highlights" className="sm:col-span-2 py-2 border-b border-neutral-200" stacked>
                        <ViewOrEdit editing={isEditing} view={renderRichOrPlain(formData.strategicHighlights)}>
                          <DebouncedRichTextEditor value={formData.strategicHighlights} onChange={(html) => setField('strategicHighlights', html)} />
                        </ViewOrEdit>
                      </Field>
                      <Field idFor="subsidiaries" label="Subsidiaries" className="sm:col-span-2 pt-2" stacked>
                        <ViewOrEdit editing={isEditing} view={renderRichOrPlain(formData.subsidiaries)}>
                          <DebouncedRichTextEditor value={formData.subsidiaries} onChange={(html) => setField('subsidiaries', html)} />
                        </ViewOrEdit>
                      </Field>
                    </Group>
                  </>
                )}
              </TemplateSection>

              <TemplateSection secId="template-personnel" title="Key Personnel" icon={FiUser}>
                {(isEditing) => (
                  <div className="space-y-3">
                    {/* Cards grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.pics && formData.pics.length > 0 ? formData.pics.map((p, idx) => (
                        <PicCard
                          key={p.id || idx}
                          p={p}
                          idx={idx}
                          isEditing={isEditing}
                          isReordering={isReordering}
                          isTyping={isTyping}
                          updatePic={updatePic}
                          removePic={removePic}
                          movePic={movePic}
                          setIsReordering={setIsReordering}
                          onAvatarChange={onAvatarChange}
                          toWhatsApp={toWhatsApp}
                          onTypingStart={() => setIsTyping(true)}
                          onTypingEnd={() => setIsTyping(false)}
                        />
                      )) : <div className="text-sm text-neutral-500">No PICs yet.</div>}
                    </div>

                    {isEditing && (
                      <Button variant="secondary" size="sm" onClick={addPic} className="text-[#2C5CC5]"> <FiPlus className="w-4 h-4" /> Add PIC</Button>
                    )}
                  </div>
                )}
              </TemplateSection>
              <TemplateSection secId="template-products" title="Telkom Products & Services" icon={FaBoxOpen}>
                {(isEditing) => (
                  <div className="space-y-4">
                    <ContractTable rows={formData.contracts || []} isEditing={isEditing} />
                    <FinancialTable rows={formData.financials || []} isEditing={isEditing} />
                    <NotesTable rows={formData.notesRows || []} isEditing={isEditing} />
                  </div>
                )}
              </TemplateSection>

              <TemplateSection secId="template-service" title="Telkom Service Performance" icon={FaChartBar}>
                {(isEditing) => (
                  <>
                    <Group title="Incident">
                      <Field idFor="reportDate" label="Report Date"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.reportDate || '—'}</div>}><DebouncedTextInput id="reportDate" type="date" value={formData.reportDate} onChange={v => setField('reportDate', v)} /></ViewOrEdit></Field>
                      <Field idFor="serviceName" label="Service Name (Affected)"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.serviceName || '—'}</div>}><DebouncedTextInput id="serviceName" value={formData.serviceName} onChange={v => setField('serviceName', v)} /></ViewOrEdit></Field>
                      <Field idFor="hardComplaint" label="Hard Complaint"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.hardComplaint || '—'}</div>}>
                        <Select value={formData.hardComplaint} onChange={e => setField('hardComplaint', e.target.value)} id="hardComplaint">
                          <option value="">Select…</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="urgency" label="Urgency"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.urgency || '—'}</div>}>
                        <Select value={formData.urgency} onChange={e => setField('urgency', e.target.value)} id="urgency">
                          <option value="">Select…</option>
                          <option value="Super Emergency">Super Emergency</option>
                          <option value="Hard">Hard</option>
                          <option value="Normal">Normal</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="slgAchievement" label="SLG Achievement (%)"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.slgAchievement || '—'}</div>}><DebouncedTextInput id="slgAchievement" type="number" value={formData.slgAchievement} onChange={v => setField('slgAchievement', v)} /></ViewOrEdit></Field>
                      <Field idFor="problemDescription" label="Problem Description" className="sm:col-span-2"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.problemDescription || '—'}</div>}><DebouncedTextArea id="problemDescription" value={formData.problemDescription} onChange={v => setField('problemDescription', v)} rows={3} /></ViewOrEdit></Field>
                    </Group>
                  </>
                )}
              </TemplateSection>

              <TemplateSection secId="template-competitor" title="Competitor Landscape" icon={FaBalanceScale}>
                {(isEditing) => (
                  <>
                    <Group title="Overview">
                      <Field idFor="competitorName" label="Competitor Name"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.competitorName || '—'}</div>}><DebouncedTextInput id="competitorName" value={formData.competitorName} onChange={v => setField('competitorName', v)} /></ViewOrEdit></Field>
                      <Field idFor="competitorProduct" label="Product/Service"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.competitorProduct || '—'}</div>}><DebouncedTextInput id="competitorProduct" value={formData.competitorProduct} onChange={v => setField('competitorProduct', v)} /></ViewOrEdit></Field>
                      <Field idFor="competitorContractEnd" label="Contract End Date"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.competitorContractEnd || '—'}</div>}><DebouncedTextInput id="competitorContractEnd" type="date" value={formData.competitorContractEnd} onChange={v => setField('competitorContractEnd', v)} /></ViewOrEdit></Field>
                      <Field idFor="competitorRevenueYTD" label="Revenue YTD (IDR M)"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.competitorRevenueYTD || '—'}</div>}><DebouncedTextInput id="competitorRevenueYTD" type="number" value={formData.competitorRevenueYTD} onChange={v => setField('competitorRevenueYTD', v)} /></ViewOrEdit></Field>
                      <Field idFor="voiceOfCustomer" label="VoC"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.voiceOfCustomer || '—'}</div>}>
                        <Select value={formData.voiceOfCustomer} onChange={e => setField('voiceOfCustomer', e.target.value)} id="voiceOfCustomer">
                          <option value="">Select…</option>
                          <option value="Positive">Positive</option>
                          <option value="Negative">Negative</option>
                        </Select>
                      </ViewOrEdit></Field>
                    </Group>
                    <Group title="Notes">
                      <Field idFor="competitorPerformanceNote" label="Performance Note" className="sm:col-span-2"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.competitorPerformanceNote || '—'}</div>}><DebouncedTextArea id="competitorPerformanceNote" value={formData.competitorPerformanceNote} onChange={v => setField('competitorPerformanceNote', v)} rows={3} /></ViewOrEdit></Field>
                      <Field idFor="competitorStrategy" label="Business Strategy" className="sm:col-span-2"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.competitorStrategy || '—'}</div>}><DebouncedTextArea id="competitorStrategy" value={formData.competitorStrategy} onChange={v => setField('competitorStrategy', v)} rows={3} /></ViewOrEdit></Field>
                    </Group>
                  </>
                )}
              </TemplateSection>

              <TemplateSection secId="template-strategic" title="Strategic Analysis" icon={FaProjectDiagram}>
                {(isEditing) => (
                  <>
                    <Group title="Five Forces">
                      <Field idFor="fiveForcesEntrants" label="New Entrants"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.fiveForcesEntrants || '—'}</div>}>
                        <Select value={formData.fiveForcesEntrants} onChange={e => setField('fiveForcesEntrants', e.target.value)} id="fiveForcesEntrants">
                          <option value="">Select…</option>
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="fiveForcesSubstitute" label="Substitute"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.fiveForcesSubstitute || '—'}</div>}>
                        <Select value={formData.fiveForcesSubstitute} onChange={e => setField('fiveForcesSubstitute', e.target.value)} id="fiveForcesSubstitute">
                          <option value="">Select…</option>
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="fiveForcesBuyer" label="Buyer Power"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.fiveForcesBuyer || '—'}</div>}>
                        <Select value={formData.fiveForcesBuyer} onChange={e => setField('fiveForcesBuyer', e.target.value)} id="fiveForcesBuyer">
                          <option value="">Select…</option>
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="fiveForcesSupplier" label="Supplier Power"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.fiveForcesSupplier || '—'}</div>}>
                        <Select value={formData.fiveForcesSupplier} onChange={e => setField('fiveForcesSupplier', e.target.value)} id="fiveForcesSupplier">
                          <option value="">Select…</option>
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </Select>
                      </ViewOrEdit></Field>
                      <Field idFor="fiveForcesRivalry" label="Rivalry"><ViewOrEdit editing={isEditing} view={<div className="text-sm">{formData.fiveForcesRivalry || '—'}</div>}>
                        <Select value={formData.fiveForcesRivalry} onChange={e => setField('fiveForcesRivalry', e.target.value)} id="fiveForcesRivalry">
                          <option value="">Select…</option>
                          <option value="Low">Low</option>
                          <option value="Moderate">Moderate</option>
                          <option value="High">High</option>
                        </Select>
                      </ViewOrEdit></Field>
                    </Group>
                    <Group title="SWOT">
                      <Field idFor="strengths" label="Strengths"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.strengths || '—'}</div>}><DebouncedTextArea id="strengths" value={formData.strengths} onChange={v => setField('strengths', v)} rows={3} /></ViewOrEdit></Field>
                      <Field idFor="weaknesses" label="Weaknesses"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.weaknesses || '—'}</div>}><DebouncedTextArea id="weaknesses" value={formData.weaknesses} onChange={v => setField('weaknesses', v)} rows={3} /></ViewOrEdit></Field>
                      <Field idFor="opportunities" label="Opportunities"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.opportunities || '—'}</div>}><DebouncedTextArea id="opportunities" value={formData.opportunities} onChange={v => setField('opportunities', v)} rows={3} /></ViewOrEdit></Field>
                      <Field idFor="threats" label="Threats"><ViewOrEdit editing={isEditing} view={<div className="text-sm whitespace-pre-wrap">{formData.threats || '—'}</div>}><DebouncedTextArea id="threats" value={formData.threats} onChange={v => setField('threats', v)} rows={3} /></ViewOrEdit></Field>
                    </Group>
                    <Group title="Artifacts">
                      <Field idFor="valueChainFile" label="Value Chain Analysis"><ViewOrEdit editing={isEditing} view={formData.valueChainFile ? <a className="text-sm text-[#2C5CC5] hover:underline" href={formData.valueChainFile.dataUrl} download={formData.valueChainFile.name}>Download</a> : <div className="text-sm text-neutral-500">—</div>}>
                        <FileInput
                          id="valueChainFile"
                          value={formData.valueChainFile}
                          onChange={(f) => handleFileChange('valueChainFile', f, { maxSizeMB: 5 })}
                          onClear={() => setField('valueChainFile', null)}
                          accept="image/*,.pdf"
                          editLabel="Replace file"
                          removeLabel="Remove file"
                          uploadLabel="Upload file"
                        />
                      </ViewOrEdit></Field>
                      <Field idFor="itRoadmapFile" label="IT & Digitalization Roadmap"><ViewOrEdit editing={isEditing} view={formData.itRoadmapFile ? <a className="text-sm text-[#2C5CC5] hover:underline" href={formData.itRoadmapFile.dataUrl} download={formData.itRoadmapFile.name}>Download</a> : <div className="text-sm text-neutral-500">—</div>}>
                        <FileInput
                          id="itRoadmapFile"
                          value={formData.itRoadmapFile}
                          onChange={(f) => handleFileChange('itRoadmapFile', f, { maxSizeMB: 5 })}
                          onClear={() => setField('itRoadmapFile', null)}
                          accept="image/*,.pdf"
                          editLabel="Replace file"
                          removeLabel="Remove file"
                          uploadLabel="Upload file"
                        />
                      </ViewOrEdit></Field>
                    </Group>
                  </>
                )}
              </TemplateSection>
            </div>
            <div className="mt-6">
              <div className="text-sm font-semibold text-neutral-800 mb-2">Custom Sections</div>
              <div className="divide-y divide-neutral-100">
          {(Array.isArray(sections) ? sections : []).map((s) => {
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
                icon={s.icon || FiFileText}
                isEmpty={empty}
                collapsed={isCollapsed}
                onToggle={toggleCollapse}
                headerRight={
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={toggleEdit}
                        className="text-[#2C5CC5]"
                        title="Edit section"
                        aria-label="Edit section"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    )}
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
                <DebouncedRichTextEditor
                  value={s.html}
                  onChange={(html) => upsertSectionHtml(s.id, html)}
                  readOnly={!isEditing}
                />
              </Section>
            )
          })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
  <aside className="lg:sticky lg:top-[84px] h-max space-y-4 hidden lg:block">
          {/* Kelengkapan Profil */}
          <Card className="p-4">
            <div className="text-sm font-semibold text-neutral-800 mb-3">Kelengkapan Profil</div>
            <div className="flex items-center justify-center py-2">
              {(() => { const secArr = Array.isArray(sections) ? sections : []; return (
                <RadialProgress current={secArr.filter(s => !isBlankHtml(s.html)).length} total={secArr.length} />
              )})()}
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
          {/* TOC (Daftar Isi) — only template sections, with expand/collapse */}
          <Card className="p-4">
            {(() => {
              const items = [
                { id: 'template-company', label: 'Company Demographics', icon: FaUsers },
                { id: 'template-personnel', label: 'Key Personnel', icon: FiUser },
                { id: 'template-products', label: 'Telkom Products & Services', icon: FaBoxOpen },
                { id: 'template-service', label: 'Telkom Service Performance', icon: FaChartBar },
                { id: 'template-competitor', label: 'Competitor Landscape', icon: FaBalanceScale },
                { id: 'template-strategic', label: 'Strategic Analysis', icon: FaProjectDiagram },
              ]
              const ids = items.map(i => i.id)
              const allOpen = ids.every((id) => !collapsed[id])
              const toggleAll = () => (allOpen ? collapseAll(ids) : expandAll(ids))
              const label = allOpen ? 'Collapse All' : 'Expand All'
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">Daftar Isi</div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={addNewSection}><FiPlus className="w-4 h-4" /> New</Button>
                      <Button variant="secondary" size="sm" onClick={toggleAll}>{label}</Button>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {items.map(({ id: secId, label, icon }) => {
                      const isCollapsed = !!collapsed[secId]
                      const summary = getTemplateSummary(secId)
                      const onClickItem = () => {
                        const wasCollapsed = !!collapsed[secId]
                        setCollapsed(prev => ({ ...prev, [secId]: !prev[secId] }))
                        if (wasCollapsed) {
                          setTimeout(() => {
                            const el = document.getElementById(secId)
                            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }, 50)
                        }
                      }
                      return (
                        <li key={secId} className="">
                          <button
                            type="button"
                            onClick={onClickItem}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 text-left"
                            aria-expanded={!isCollapsed}
                            aria-controls={secId}
                          >
                            <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-[#F0F6FF] text-[#2C5CC5]">{React.createElement(icon, { className: 'w-4 h-4' })}</span>
                            <div className="min-w-0 text-sm font-semibold text-neutral-800 truncate">
                              {label}
                              {summary ? (
                                <span className="text-neutral-500 font-normal"> {' \u2022 '} {summary}</span>
                              ) : null}
                            </div>
                            <span className="ml-auto text-neutral-400">
                              {isCollapsed ? '▾' : '▴'}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                    {(Array.isArray(sections) && sections.length > 0) && (
                      <li className="pt-2 border-t border-neutral-100" aria-hidden />
                    )}
                    {(Array.isArray(sections) ? sections : []).map((s) => {
                      const isCollapsedC = !!collapsed[s.id]
                      const empty = isBlankHtml(s.html)
                      const onClickCustom = () => {
                        const wasCollapsed = !!collapsed[s.id]
                        setCollapsed(prev => ({ ...prev, [s.id]: !prev[s.id] }))
                        if (wasCollapsed) {
                          setTimeout(() => {
                            const el = document.getElementById(s.id)
                            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }, 50)
                        }
                      }
                      return (
                        <li key={s.id} className="">
                          <button
                            type="button"
                            onClick={onClickCustom}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-50 text-left"
                            aria-expanded={!isCollapsedC}
                            aria-controls={s.id}
                          >
                            <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-[#F0F6FF] text-[#2C5CC5]"><FiFileText className="w-4 h-4" /></span>
                            <div className="min-w-0 text-sm font-semibold text-neutral-800 truncate">
                              {s.label || 'Untitled Section'}
                              {empty ? (
                                <span className="text-neutral-400 font-normal"> {' \u2022 '} Empty</span>
                              ) : null}
                            </div>
                            <span className="ml-auto text-neutral-400">
                              {isCollapsedC ? '▾' : '▴'}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )
            })()}
          </Card>
        </aside>
      </div>
    </div>
  )
}

// Legacy inline RadialProgress replaced by component import
