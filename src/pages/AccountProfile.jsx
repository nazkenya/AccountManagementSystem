import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import Toolbar from '../components/ui/Toolbar'
import { Badge } from '../components/ui/Badge'
import Table from '../components/ui/Table'
import { FaUsers, FaBalanceScale, FaProjectDiagram, FaChartBar, FaBoxOpen, FaUserPlus, FaTruck, FaExchangeAlt, FaSitemap, FaLightbulb, FaNetworkWired} from 'react-icons/fa'
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
// Import the FiveForcesAnalysis component
import FiveForcesAnalysis from '../components/analysis/FiveForcesAnalysis'
// NEW: Import the SwotAnalysis component
import SwotAnalysis from '../components/analysis/SwotAnalysis'
import IndustryValueChainAnalysis from '../components/analysis/IndustryValueChainAnalysis'


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
    
    // UPDATED: Changed Five Forces to be objects
    fiveForcesEntrants: { rating: '', notes: '' },
    fiveForcesSubstitute: { rating: '', notes: '' },
    fiveForcesBuyer: { rating: '', notes: '' },
    fiveForcesSupplier: { rating: '', notes: '' },
    fiveForcesRivalry: { rating: '', notes: '' },

    strengths: '', weaknesses: '', opportunities: '', threats: '', orgStructureFile: null, orgStructureNotes: '', valueChainFile: null, itRoadmapFile: null,
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
      // Services (Telkom Service Performance) - migrate legacy single fields into a services table
      if (Array.isArray(updates.services) && updates.services.length === 0 && (updates.reportDate || updates.serviceName || updates.hardComplaint || updates.urgency || updates.slgAchievement || updates.problemDescription)) {
        updates.services = [{ id: `srv-${Date.now()}`, reportDate: updates.reportDate || '', serviceName: updates.serviceName || '', hardComplaint: updates.hardComplaint || '', urgency: updates.urgency || '', slgAchievement: updates.slgAchievement || '', problemDescription: updates.problemDescription || '' }]
        // clear legacy single fields
        updates.reportDate = ''
        updates.serviceName = ''
        updates.hardComplaint = ''
        updates.urgency = ''
        updates.slgAchievement = ''
        updates.problemDescription = ''
      }
      return updates
    })
  }, [setFormDataRaw])

  // =================================================================
  //  FIXED FUNCTION (prevents scroll-jump)
  // =================================================================
  const setField = React.useCallback((key, value) => {
    // 1. Get current scroll position
    const scrollY = (typeof window !== 'undefined' && window.scrollY) ? window.scrollY : 0
    
    // 2. Set the state
    setFormDataRaw(prev => ({ ...prev, [key]: value }))
    
    // 3. Restore scroll position after the re-render
    setTimeout(() => {
      try {
          window.scrollTo({ top: scrollY, behavior: 'instant' })
        } catch {
          // ignore errors
        }
    }, 0)
  }, [setFormDataRaw])
  // =================================================================

  // One-time migration for Five Forces (from string to object)
  React.useEffect(() => {
    setFormDataRaw(prev => {
      const needsMigration = typeof prev.fiveForcesEntrants === 'string' ||
                            typeof prev.fiveForcesSubstitute === 'string' ||
                            typeof prev.fiveForcesBuyer === 'string' ||
                            typeof prev.fiveForcesSupplier === 'string' ||
                            typeof prev.fiveForcesRivalry === 'string'
      
      if (!needsMigration) return prev

      const updates = { ...prev }
      
      const migrateForce = (forceValue) => {
        if (typeof forceValue === 'string') {
          return { rating: forceValue, notes: '' }
        }
        return forceValue || { rating: '', notes: '' }
      }

      updates.fiveForcesEntrants = migrateForce(prev.fiveForcesEntrants)
      updates.fiveForcesSubstitute = migrateForce(prev.fiveForcesSubstitute)
      updates.fiveForcesBuyer = migrateForce(prev.fiveForcesBuyer)
      updates.fiveForcesSupplier = migrateForce(prev.fiveForcesSupplier)
      updates.fiveForcesRivalry = migrateForce(prev.fiveForcesRivalry)

      return updates
    })
  }, [setFormDataRaw])


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

  // Prevent accidental full-page reloads caused by form submissions originating
  // from any nested form in this page.
  const containerRef = React.useRef(null)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const onSubmit = (e) => {
      e.preventDefault()
    }
    const onClickCapture = (ev) => {
      try {
        const btn = ev.target instanceof Element ? ev.target.closest('button') : null
        if (btn && !btn.hasAttribute('type')) {
          btn.setAttribute('type', 'button')
        }
      } catch {
        // defensive: ignore any DOM errors
      }
    }

    el.addEventListener('submit', onSubmit, true)
    el.addEventListener('click', onClickCapture, true)
    return () => {
      el.removeEventListener('submit', onSubmit, true)
      el.removeEventListener('click', onClickCapture, true)
    }
  }, [])

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
      case 'template-org-structure': {
        const parts = []
        if (formData.orgStructureFile) parts.push('File')
        if (!isBlankHtml(formData.orgStructureNotes)) parts.push('Notes')
        return join(parts)
      }
      case 'template-personnel': {
        const first = (formData.pics && formData.pics[0]) || null
        const initials = (first?.name || '').trim().split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toLowerCase()
        const count = Array.isArray(formData.pics) ? formData.pics.length : 0
        return join([initials || null, count ? String(count) : null])
      }
      case 'template-products':
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
        return join([formData.fiveForcesRivalry?.rating && `Rivalry: ${formData.fiveForcesRivalry.rating}`, formData.fiveForcesBuyer?.rating && `Buyer: ${formData.fiveForcesBuyer.rating}`])
      default:
        return ''
    }
  }, [formData, isBlankHtml])

  // Template section wrapper
  const TemplateSection = ({ secId, title, icon: Icon, children }) => {
    const isCollapsed = !!collapsed[secId]
    const toggleCollapse = () => setCollapsed(prev => ({ ...prev, [secId]: !prev[secId] }))
    const isEditing = !!templateEditing[secId]
    const toggleEdit = () => {
      const scrollY = (typeof window !== 'undefined' && window.scrollY) ? window.scrollY : 0
      setTemplateEditing(prev => ({ ...prev, [secId]: !prev[secId] }))
      setTimeout(() => { try { window.scrollTo({ top: scrollY, behavior: 'instant' }) } catch (e) { void e } }, 0)
    }
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
              <Button type="button" variant="secondary" size="sm" onClick={toggleEdit} className="text-[#2C5CC5]" aria-label="Edit section">
                <FiEdit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            {isEditing && (
              <Button type="button" variant="primary" size="sm" onClick={toggleEdit} aria-label="Save section"><FiSave className="w-4 h-4" /> Save</Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {typeof children === 'function' ? children(isEditing) : children}
        </div>
      </Section>
    )
  }

  // Memoized table configs
  const productsEditing = !!templateEditing['template-products']

  const contractsColumns = React.useMemo(() => [
    { key: 'title', label: 'Project/Product Title', editable: true },
    { key: 'contractDate', label: 'Date of Contract', editable: true, type: 'date' },
    { key: 'endDate', label: 'End of Contract', editable: true, type: 'date' },
    ...(productsEditing ? [{ key: 'actions', label: 'Actions', editable: false, render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('contracts', row.id)}><FiTrash2 /> Delete</Button>
    ) }] : []),
  ], [productsEditing, removeRow])

  const onContractsChange = React.useCallback((newData) => {
    setFormDataRaw(prev => ({ ...prev, contracts: newData }))
  }, [setFormDataRaw])

  const onContractsAdd = React.useCallback(() => addRow('contracts', { title: '', contractDate: '', endDate: '' }), [addRow])

  const financialColumns = React.useMemo(() => [
    { key: 'revenueYTD', label: 'Total Revenue YTD (IDR M)', editable: true, type: 'number' },
    { key: 'churnedProduct', label: 'Churned Product', editable: true },
    { key: 'churnDate', label: 'Date of Churn', editable: true, type: 'date' },
    ...(productsEditing ? [{ key: 'actions', label: 'Actions', editable: false, render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('financials', row.id)}><FiTrash2 /> Delete</Button>
    ) }] : []),
  ], [productsEditing, removeRow])

  const onFinancialsChange = React.useCallback((newData) => {
    setFormDataRaw(prev => ({ ...prev, financials: newData }))
  }, [setFormDataRaw])

  const onFinancialsAdd = React.useCallback(() => addRow('financials', { revenueYTD: '', churnedProduct: '', churnDate: '' }), [addRow])

  const notesColumns = React.useMemo(() => [
    { key: 'churnReason', label: 'Reason for Churn', editable: true, type: 'textarea' },
    { key: 'connectivityConfig', label: 'Connectivity Configuration', editable: true, type: 'textarea' },
    ...(productsEditing ? [{ key: 'actions', label: 'Actions', editable: false, render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('notesRows', row.id)}><FiTrash2 /> Delete</Button>
    ) }] : []),
  ], [productsEditing, removeRow])

  const onNotesChange = React.useCallback((newData) => {
    setFormDataRaw(prev => ({ ...prev, notesRows: newData }))
  }, [setFormDataRaw])

  const onNotesAdd = React.useCallback(() => addRow('notesRows', { churnReason: '', connectivityConfig: '' }), [addRow])

  const servicesEditing = !!templateEditing['template-service']

  const servicesColumns = React.useMemo(() => [
    { key: 'reportDate', label: 'Report Date', editable: true, type: 'date' },
    { key: 'serviceName', label: 'Service Name (Affected)', editable: true },
    { key: 'hardComplaint', label: 'Hard Complaint', editable: true },
    { key: 'urgency', label: 'Urgency', editable: true },
    { key: 'slgAchievement', label: 'SLG Achievement (%)', editable: true, type: 'number' },
    { key: 'problemDescription', label: 'Problem Description', editable: true, type: 'textarea' },
    ...(servicesEditing ? [{ key: 'actions', label: 'Actions', editable: false, render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('services', row.id)}><FiTrash2 /> Delete</Button>
    ) }] : []),
  ], [servicesEditing, removeRow])

  const onServicesChange = React.useCallback((newData) => {
    setFormDataRaw(prev => ({ ...prev, services: newData }))
  }, [setFormDataRaw])

  const onServicesAdd = React.useCallback(() => addRow('services', { reportDate: '', serviceName: '', hardComplaint: '', urgency: '', slgAchievement: '', problemDescription: '' }), [addRow])
  
  // One-time migration for competitors
  React.useEffect(() => {
    setFormDataRaw(prev => {
      const updates = { ...prev }
      if (Array.isArray(updates.competitors) && updates.competitors.length === 0 && (
        updates.competitorName || updates.competitorProduct || updates.competitorContractEnd || updates.competitorRevenueYTD || updates.voiceOfCustomer || updates.competitorPerformanceNote || updates.competitorStrategy
      )) {
        updates.competitors = [{
          id: `cmp-${Date.now()}`,
          competitorName: updates.competitorName || '',
          competitorProduct: updates.competitorProduct || '',
          competitorContractEnd: updates.competitorContractEnd || '',
          competitorRevenueYTD: updates.competitorRevenueYTD || '',
          voiceOfCustomer: updates.voiceOfCustomer || '',
          competitorPerformanceNote: updates.competitorPerformanceNote || '',
          competitorStrategy: updates.competitorStrategy || '',
        }]
        // clear legacy single fields
        updates.competitorName = ''
        updates.competitorProduct = ''
        updates.competitorContractEnd = ''
        updates.competitorRevenueYTD = ''
        updates.voiceOfCustomer = ''
        updates.competitorPerformanceNote = ''
        updates.competitorStrategy = ''
      }
      return updates
    })
  }, [setFormDataRaw])

  // 1️⃣ Produk / Solusi Kompetitor
const competitorsProductsEditing = !!templateEditing['template-competitor-products']

const competitorsProductsColumns = React.useMemo(() => [
  { key: 'competitorName', label: 'Competitor', editable: true },
  { key: 'productService', label: "Competitor's Product/Services", editable: true },
  { key: 'endOfContract', label: 'End of Contract', editable: true, type: 'date' },
  { key: 'totalRevYtd', label: 'Total Rev YTD 2023 (IDR M)', editable: true, type: 'number' },
  ...(competitorsProductsEditing ? [{
    key: 'actions',
    label: 'Actions',
    editable: false,
    render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('competitorsProducts', row.id)}>
        <FiTrash2 /> Delete
      </Button>
    ),
  }] : []),
], [competitorsProductsEditing, removeRow])

const onCompetitorsProductsChange = React.useCallback((newData) => {
  setFormDataRaw(prev => ({ ...prev, competitorsProducts: newData }))
}, [setFormDataRaw])

const onCompetitorsProductsAdd = React.useCallback(() => 
  addRow('competitorsProducts', {
    competitorName: '',
    productService: '',
    endOfContract: '',
    totalRevYtd: '',
  }), [addRow])

// 2️⃣ Performansi Layanan & VoC
const competitorsPerformanceEditing = !!templateEditing['template-competitor-performance']

const competitorsPerformanceColumns = React.useMemo(() => [
  { key: 'competitorName', label: 'Nama Kompetitor', editable: true },
  { key: 'productName', label: 'Nama Product', editable: true },
  { key: 'voc', label: 'VoC', editable: true, type: 'select', options: [
    { value: '', label: 'Select…' },
    { value: 'Positive', label: 'Positive' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Negative', label: 'Negative' },
  ]},
  { key: 'performanceDesc', label: 'Deskripsi Performansi Layanan Kompetitor', editable: true, type: 'textarea' },
  ...(competitorsPerformanceEditing ? [{
    key: 'actions',
    label: 'Actions',
    editable: false,
    render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('competitorsPerformance', row.id)}>
        <FiTrash2 /> Delete
      </Button>
    ),
  }] : []),
], [competitorsPerformanceEditing, removeRow])

const onCompetitorsPerformanceChange = React.useCallback((newData) => {
  setFormDataRaw(prev => ({ ...prev, competitorsPerformance: newData }))
}, [setFormDataRaw])

const onCompetitorsPerformanceAdd = React.useCallback(() => 
  addRow('competitorsPerformance', {
    competitorName: '',
    productName: '',
    voc: '',
    performanceDesc: '',
  }), [addRow])

// 3️⃣ Analisa Strategi Kompetitor
const competitorsStrategyEditing = !!templateEditing['template-competitor-strategy']

const competitorsStrategyColumns = React.useMemo(() => [
  { key: 'competitorName', label: 'Competitor', editable: true },
  { key: 'businessStrategy', label: 'Business Strategy', editable: true, type: 'textarea' },
  ...(competitorsStrategyEditing ? [{
    key: 'actions',
    label: 'Actions',
    editable: false,
    render: (row) => (
      <Button type="button" variant="secondary" size="sm" onClick={() => removeRow('competitorsStrategy', row.id)}>
        <FiTrash2 /> Delete
      </Button>
    ),
  }] : []),
], [competitorsStrategyEditing, removeRow])

const onCompetitorsStrategyChange = React.useCallback((newData) => {
  setFormDataRaw(prev => ({ ...prev, competitorsStrategy: newData }))
}, [setFormDataRaw])

const onCompetitorsStrategyAdd = React.useCallback(() => 
  addRow('competitorsStrategy', {
    competitorName: '',
    businessStrategy: '',
  }), [addRow])

  return (
    <div ref={containerRef} className="animate-fade-in">
      {/* Page header */}
      <PageHeader
        title="Profile Wiki"
        icon={FiBookOpen}
        variant="hero"
        right={(
          <Toolbar>
            <Button type="button" variant="secondary"><FiPrinter className="w-4 h-4" /> Export PDF</Button>
            <Button type="button" variant="secondary"><FiRotateCcw className="w-4 h-4" /> Riwayat</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/customers/${id}`)}><FiArrowLeft className="w-4 h-4" /> Back</Button>
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
            <div className="divide-y divide-neutral-100 space-y-8">
              <TemplateSection secId="template-company" title="Company Demographics" icon={FaUsers}>
                {(isEditing) => (
                  <>
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

              <TemplateSection secId="template-org-structure" title="Organization Structure" icon={FaSitemap}>
                {(isEditing) => (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Field idFor="orgStructureFile" label="Organization Chart / File" className="sm:col-span-2">
                        <ViewOrEdit editing={isEditing} view={formData.orgStructureFile ? (
                          <a className="text-sm text-[#2C5CC5] hover:underline" href={formData.orgStructureFile.dataUrl} download={formData.orgStructureFile.name}>Download</a>
                        ) : (
                          <div className="text-sm text-neutral-500">—</div>
                        )}>
                          <FileInput
                            id="orgStructureFile"
                            value={formData.orgStructureFile}
                            onChange={(f) => handleFileChange('orgStructureFile', f, { maxSizeMB: 5 })}
                            onClear={() => setField('orgStructureFile', null)}
                            accept="image/*,.pdf"
                            editLabel="Replace file"
                            removeLabel="Remove file"
                            uploadLabel="Upload file"
                          />
                        </ViewOrEdit>
                      </Field>
                    </div>

                    <div className="space-y-2">
                      <Field idFor="orgStructureNotes" label="Notes (Organization Structure)" className="sm:col-span-2">
                        <ViewOrEdit editing={isEditing} view={renderRichOrPlain(formData.orgStructureNotes)}>
                          <DebouncedRichTextEditor value={formData.orgStructureNotes} onChange={(html) => setField('orgStructureNotes', html)} />
                        </ViewOrEdit>
                      </Field>
                    </div>
                  </div>
                )}
              </TemplateSection>

              <TemplateSection secId="template-personnel" title="Key Personnel" icon={FiUser}>
                {(isEditing) => (
                  <div className="space-y-3">
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
                      <Button type="button" variant="secondary" size="sm" onClick={addPic} className="text-[#2C5CC5]"> <FiPlus className="w-4 h-4" /> Add PIC</Button>
                    )}
                  </div>
                )}
              </TemplateSection>
              <TemplateSection secId="template-products" title="Telkom Products & Services" icon={FaBoxOpen}>
                {(isEditing) => (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-neutral-900">Contract</div>
                      </div>
                      <Table
                        columns={contractsColumns}
                        data={isEditing ? (formData.contracts || []) : getNonEmptyRows(formData.contracts || [], ['title','contractDate','endDate'])}
                        rowKey="id"
                        mode={isEditing ? 'addable' : 'readonly'}
                        onDataChange={onContractsChange}
                        onAddRow={onContractsAdd}
                        emptyMessage="No contracts"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-neutral-900">Financial & Churn</div>
                      </div>
                      <Table
                        columns={financialColumns}
                        data={isEditing ? (formData.financials || []) : getNonEmptyRows(formData.financials || [], ['revenueYTD','churnedProduct','churnDate'])}
                        rowKey="id"
                        mode={isEditing ? 'addable' : 'readonly'}
                        onDataChange={onFinancialsChange}
                        onAddRow={onFinancialsAdd}
                        emptyMessage="No financial records"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-neutral-900">Notes</div>
                      </div>
                      <Table
                        columns={notesColumns}
                        data={isEditing ? (formData.notesRows || []) : getNonEmptyRows(formData.notesRows || [], ['churnReason','connectivityConfig'])}
                        rowKey="id"
                        mode={isEditing ? 'addable' : 'readonly'}
                        onDataChange={onNotesChange}
                        onAddRow={onNotesAdd}
                        emptyMessage="No notes"
                      />
                    </div>
                  </div>
                )}
              </TemplateSection>

              <TemplateSection secId="template-service" title="Telkom Service Performance" icon={FaChartBar}>
                {(isEditing) => (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-neutral-900">Service Performance</div>
                    </div>
                    <Table
                      columns={servicesColumns}
                      data={isEditing ? (formData.services || []) : getNonEmptyRows(formData.services || [], ['serviceName','reportDate'])}
                      rowKey="id"
                      mode={isEditing ? 'addable' : 'readonly'}
                      onDataChange={onServicesChange}
                      onAddRow={onServicesAdd}
                      emptyMessage="No service records"
                    />
                  </div>
                )}
              </TemplateSection>

              <TemplateSection secId="template-competitor" title="Competitor Landscape" icon={FaBalanceScale}>
                {(isEditing) => (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-neutral-900">Competitors Products</div>
                    </div>
                    <Table
                      columns={competitorsProductsColumns}
                      data={formData.competitorsProducts || []}
                      rowKey="id"
                      mode={isEditing ? 'addable' : 'readonly'}
                      onDataChange={onCompetitorsProductsChange}
                      onAddRow={onCompetitorsProductsAdd}
                      emptyMessage="No competitor product records"
                    />

                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-neutral-900">Competitors Performance</div>
                    </div>
                    <Table
                      columns={competitorsPerformanceColumns}
                      data={formData.competitorsPerformance || []}
                      rowKey="id"
                      mode={isEditing ? 'addable' : 'readonly'}
                      onDataChange={onCompetitorsPerformanceChange}
                      onAddRow={onCompetitorsPerformanceAdd}
                      emptyMessage="No competitor performance records"
                    />

                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-neutral-900">Competitors Strategy</div>
                    </div>
                    <Table
                      columns={competitorsStrategyColumns}
                      data={formData.competitorsStrategy || []}
                      rowKey="id"
                      mode={isEditing ? 'addable' : 'readonly'}
                      onDataChange={onCompetitorsStrategyChange}
                      onAddRow={onCompetitorsStrategyAdd}
                      emptyMessage="No competitor strategy records"
                    />
                  </div>
                )}
              </TemplateSection>


              <TemplateSection secId="template-fiveforces" title="Five Forces Analysis" icon={FaProjectDiagram}>
                {(isEditing) => (
                  <div className="space-y-2">
                    <div className="sm:col-span-2">
                      <FiveForcesAnalysis
                        formData={formData}
                        setField={setField}
                        isEditing={isEditing}
                      />
                    </div>
                  </div>
                )}
              </TemplateSection>

              <TemplateSection secId="template-swot" title="SWOT Analysis" icon={FaProjectDiagram}>
                {(isEditing) => (
                  <div className="space-y-2">
                    <div className="sm:col-span-2">
                      <SwotAnalysis
                        formData={formData}
                        setField={setField}
                        isEditing={isEditing}
                      />
                    </div>
                  </div>
                )}
              </TemplateSection>
              <TemplateSection secId="template-artifacts" title="Industry Value Chain Analysis" icon={FaNetworkWired}>
                {(isEditing) => (
                  <div className="space-y-2">
                    <div className="sm:col-span-2">
                      <IndustryValueChainAnalysis
                        formData={formData}
                        setField={setField}
                        isEditing={isEditing}
                      />
                    </div>
                  </div>
                )}
              </TemplateSection>

              {/* <TemplateSection secId="template-artifacts" title="Artifacts" icon={FaProjectDiagram}>
                {(isEditing) => (
                        setField={setField}
                        isEditing={isEditing}
                      />
                    </div>
                  </div>
                )}
              </TemplateSection>

              {/* <TemplateSection secId="template-artifacts" title="Artifacts" icon={FaProjectDiagram}>
                {(isEditing) => (
                  <>
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
              </TemplateSection> */}
            </div>
            <div className="mt-10">
              <div className="text-sm font-semibold text-neutral-800 mb-2">Custom Sections</div>
              <div className="divide-y divide-neutral-100 space-y-8">
          {(Array.isArray(sections) ? sections : []).map((s) => {
            const isEditing = !!editing[s.id]
            const toggleEdit = () => {
              const scrollY = (typeof window !== 'undefined' && window.scrollY) ? window.scrollY : 0
              setEditing((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
              setTimeout(() => { try { window.scrollTo({ top: scrollY, behavior: 'instant' }) } catch (e) { void e } }, 0)
            }
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
                        type="button"
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
                        type="button"
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
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const scrollY = (typeof window !== 'undefined' && window.scrollY) ? window.scrollY : 0
                          setEditing((prev) => ({ ...prev, [s.id]: false }))
                          setTimeout(() => { try { window.scrollTo({ top: scrollY, behavior: 'instant' }) } catch (e) { void e } }, 0)
                        }}
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
          <Card className="p-4">
            <div className="text-sm font-semibold text-neutral-800 mb-3">Kelengkapan Profil</div>
            <div className="flex items-center justify-center py-2">
              {(() => { const secArr = Array.isArray(sections) ? sections : []; return (
                <RadialProgress current={secArr.filter(s => !isBlankHtml(s.html)).length} total={secArr.length} />
              )})()}
            </div>
          </Card>
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
          <Card className="p-4">
            {(() => {
                const items = [
                { id: 'template-company', label: 'Company Demographics', icon: FaUsers },
                { id: 'template-org-structure', label: 'Organization Structure', icon: FaSitemap },
                { id: 'template-personnel', label: 'Key Personnel', icon: FiUser },
                { id: 'template-products', label: 'Telkom Products & Services', icon: FaBoxOpen },
                { id: 'template-service', label: 'Telkom Service Performance', icon: FaChartBar },
                { id: 'template-competitor', label: 'Competitor Landscape', icon: FaBalanceScale },
                { id: 'template-fiveforces', label: 'Five Forces', icon: FaProjectDiagram },
                { id: 'template-swot', label: 'SWOT Analysis', icon: FaLightbulb },
                { id: 'template-artifacts', label: 'Artifacts', icon: FaNetworkWired },
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
                      <Button type="button" variant="secondary" size="sm" onClick={addNewSection}><FiPlus className="w-4 h-4" /> New</Button>
                      <Button type="button" variant="secondary" size="sm" onClick={toggleAll}>{label}</Button>
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