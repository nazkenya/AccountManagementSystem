import React, { useState, useEffect, useMemo, useRef } from 'react' // Import useRef
import { useParams, useNavigate } from 'react-router-dom'

// --- Reusable UI Components (Assuming you import these) ---
// Note: These are simplified versions based on your provided components
// to make this file runnable. You should import your real components.

// Simplified Card (from your file)
const Card = ({ children, className = '', noPadding = false }) => ( <div className={`rounded-xl border border-neutral-200 bg-white ${className}`}> <div className={noPadding ? '' : 'p-5'}>{children}</div> </div> )
// Simplified Button (from your file)
function Button({ children, variant = 'primary', size = 'md', className = '', icon: Icon, ...props }) { const base = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'; const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm' }; const variants = { primary: 'bg-[#2C5CC5] text-white hover:bg-[#234AA0] shadow-sm', secondary: 'bg-white border border-neutral-300 text-neutral-800 hover:border-[#2C5CC5] shadow-sm', danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm' }; return ( <button className={[base, sizes[size] || sizes.md, variants[variant] || variants.primary, className].join(' ').trim()} {...props}> {Icon && <Icon className="h-4 w-4" />} {children} </button> ); }
// Simplified Badge (Tag)
const Tag = ({ children, variant = 'neutral', className = '', icon: Icon }) => { const colors = { blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800', yellow: 'bg-yellow-100 text-yellow-800', red: 'bg-red-100 text-red-800', neutral: 'bg-neutral-100 text-neutral-800' }; return ( <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[variant] || colors.neutral} ${className}`}> {Icon && <Icon className="h-3 w-3" />} {children} </span> ) }
// Simplified DebouncedTextArea
const DebouncedTextArea = ({ id, value: initialValue, onChange, placeholder, rows, className, disabled = false }) => { const [value, setValue] = useState(initialValue); useEffect(() => { setValue(initialValue) }, [initialValue]); const handleChange = (e) => { setValue(e.target.value); if(onChange) onChange(e.target.value); }; return ( <textarea id={id} value={value} onChange={handleChange} placeholder={placeholder} rows={rows} className={`w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5CC5]/30 read-only:bg-slate-50 read-only:cursor-not-allowed ${className}`} disabled={disabled} readOnly={disabled} /> ) }
// Simplified Input
const Input = ({ id, value: initialValue, onChange, placeholder, type = 'text', className = '', icon: Icon, disabled = false }) => { const [value, setValue] = useState(initialValue); useEffect(() => { setValue(initialValue) }, [initialValue]); const handleChange = (e) => { setValue(e.target.value); if(onChange) onChange(e.target.value); }; return ( <div className="relative"><input id={id} type={type} value={value} onChange={handleChange} placeholder={placeholder} className={`w-full rounded-xl border border-neutral-300 bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5CC5]/30 read-only:bg-slate-50 read-only:cursor-not-allowed ${className}`} disabled={disabled} readOnly={disabled} />{Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />}</div> ) }
// Simplified Select
const Select = ({ id, value: initialValue, onChange, children, className = '', disabled = false }) => { const [value, setValue] = useState(initialValue); useEffect(() => { setValue(initialValue) }, [initialValue]); const handleChange = (e) => { setValue(e.target.value); if(onChange) onChange(e.target.value); }; return ( <select id={id} value={value} onChange={handleChange} className={`w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5CC5]/30 appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em_1em] bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")] read-only:bg-slate-50 read-only:cursor-not-allowed ${className}`} disabled={disabled} readOnly={disabled}> {children} </select> ) }
// Simplified Table
const Table = ({ columns, data, rowKey, onRowClick }) => ( <div className="overflow-auto"><table className="min-w-full text-left"><thead className="border-b border-neutral-200"><tr>{columns.map((col) => ( <th key={col.key} className="px-5 py-3.5 text-xs font-medium text-neutral-500 tracking-wider"> {col.label} </th> ))}</tr></thead><tbody> {data.map((row, idx) => ( <tr key={row[rowKey] || idx} onClick={() => onRowClick && onRowClick(row)} className={`transition-colors duration-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'} ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''}`}> {columns.map((col) => ( <td key={col.key} className="px-5 py-3 text-[13px] text-neutral-700 align-top"> {col.render ? col.render(row) : row[col.key]} </td> ))} </tr> ))} </tbody></table></div> )
// --- End of Reusable UI Components ---


import {
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaBirthdayCake,
  FaCamera, // Changed from FaLink
  FaTasks,
  FaDollarSign,
  FaStickyNote,
  FaClock,
  FaSave,
  FaTimes,
} from 'react-icons/fa'

/* -------------------------------------------------------
 * Dummy Data (Simulating data fetch)
 * ----------------------------------------------------- */
const DUMMY_CONTACTS = {
  '1': { id: 1, fullName: 'Alia Smith', titlePosition: 'Account Executive', phoneNumber: '+62 812 3456 7890', emailAddress: 'alia.smith@techcorp.com', placeOfBirth: 'Jakarta', dateOfBirth: '1990-11-05', educationHistory: 'e.g., MBA from Harvard Business School', hobbiesInterests: 'e.g., Golf, Reading, Photography', relationshipStatus: 'Warm', decisionRole: 'Influencer', company: 'TechCorp Solutions', avatarUrl: null },
  '2': { id: 2, fullName: 'Budi Hartono', titlePosition: 'CTO', phoneNumber: '+62 811 1234 5678', emailAddress: 'budi.h@innovatehub.id', placeOfBirth: 'Surabaya', dateOfBirth: '1985-11-25', educationHistory: 'e.g., PhD in Computer Science, ITB', hobbiesInterests: 'e.g., Chess, Hiking', relationshipStatus: 'Neutral', decisionRole: 'Decision Maker', company: 'InnovateHub', avatarUrl: null },
}
const DUMMY_ACTIVITIES = [ { id: 1, type: 'Call', date: '2025-10-01', summary: 'Discussed Q4 projections. Follow-up needed.' }, { id: 2, type: 'Email', date: '2025-09-28', summary: 'Sent pricing info for new bundle.' }, ]
const DUMMY_OPPORTUNITIES = [ { id: 1, name: 'Q4 Enterprise Upgrade', stage: 'Proposal', amount: 'Rp 250.000.000', closeDate: '2025-12-15' }, { id: 2, name: 'New LOB Expansion', stage: 'Qualification', amount: 'Rp 80.000.000', closeDate: '2026-02-01' }, ]
const DUMMY_NOTES = [ { id: 1, user: 'Account Manager', date: '2025-09-15', note: 'Budi is the main technical decision-maker. Very interested in API integration.' }, ]

/* -------------------------------------------------------
 * Helper Functions (Avatars, Birthday)
 * ----------------------------------------------------- */
const getInitials = (name = '') => { const parts = name.split(' '); const first = parts[0]?.[0] || ''; const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''; return `${first}${last}`.toUpperCase(); }
const AVATAR_COLORS = [ 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-yellow-100 text-yellow-700', 'bg-red-100 text-red-700', 'bg-purple-100 text-purple-700', 'bg-indigo-100 text-indigo-700', ]
const getAvatarColor = (name = '') => { const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0); return AVATAR_COLORS[hash % AVATAR_COLORS.length]; }

const isBirthdayComingUp = (dobString) => {
  if (!dobString) return false
  try {
    const dob = new Date(dobString.split('-').join('/'))
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear()
    const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate()); birthdayThisYear.setHours(0, 0, 0, 0);
    const diffTime = birthdayThisYear.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
      const birthdayNextYear = new Date(currentYear + 1, dob.getMonth(), dob.getDate())
      const nextDiffTime = birthdayNextYear.getTime() - today.getTime()
      const nextDiffDays = Math.ceil(nextDiffTime / (1000 * 60 * 60 * 24))
      return nextDiffDays >= 0 && nextDiffDays <= 7
    }
    return diffDays >= 0 && diffDays <= 7
  } catch (e) { return false }
}

/* -------------------------------------------------------
 * Reusable Form Field Component
 * ----------------------------------------------------- */
const FormField = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 mb-1.5">
      {label}
    </label>
    {children}
  </div>
)

/* -------------------------------------------------------
 * Main Contact Detail Page (CLEANED TABBED DESIGN)
 * ----------------------------------------------------- */
export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [originalData, setOriginalData] = useState(() => DUMMY_CONTACTS[id] || {})
  const [formData, setFormData] = useState(originalData)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTab, setCurrentTab] = useState('Personal Information')
  
  const fileInputRef = useRef(null) // Create ref for file input

  useEffect(() => {
    const contactData = DUMMY_CONTACTS[id] || {}
    setFormData(contactData)
    setOriginalData(contactData)
    setIsEditing(false)
  }, [id])

  const handleInputChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // In a real app, if formData.avatarUrl is a "blob:" URL,
    // you would upload the file from fileInputRef.current.files[0]
    // and replace the blob URL with the permanent one from your server.
    console.log('Saving contact data:', formData)
    setOriginalData(formData)
    setIsEditing(false)
    alert('Contact saved!')
  }
  
  const handleCancel = () => {
    setFormData(originalData) // Revert all changes, including avatar
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${formData.fullName}?`)) {
      console.log('Deleting contact:', formData.id)
      alert('Contact deleted!')
      navigate('/contacts')
    }
  }
  
  // New handler for file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create a local URL to preview the image
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, avatarUrl: previewUrl }))
    }
  }
  
  // Handler to trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const initials = getInitials(originalData.fullName)
  const avatarColor = getAvatarColor(originalData.fullName)
  const birthdayUpcoming = isBirthdayComingUp(originalData.dateOfBirth)
  
  const TABS = [
    { name: 'Personal Information', icon: FaUserAlt },
    { name: 'Activities', icon: FaTasks },
    { name: 'Notes', icon: FaStickyNote },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-2">
      
      {/* --- NEW MERGED PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          
          {/* Avatar / PIC */}
          <div className="relative flex-shrink-0">
            {formData.avatarUrl ? (
              <img 
                src={formData.avatarUrl} 
                alt="Profile" 
                className="h-20 w-20 rounded-full object-cover" 
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold ${avatarColor}`}
              >
                {initials || 'PIC'}
              </div>
            )}
            {isEditing && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute -bottom-1 -right-1 !p-2 !rounded-full shadow-md"
                title="Change PIC"
                onClick={triggerFileInput} // Triggers file input
              >
                <FaCamera className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Hidden File Input */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />

          {/* Name, Title, Birthday */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{originalData.fullName || 'New Contact'}</h1>
              {!isEditing && birthdayUpcoming && (
                <Tag variant="yellow" icon={FaBirthdayCake}>
                  Birthday upcoming!
                </Tag>
              )}
            </div>
            <p className="mt-1 text-lg text-slate-600">{originalData.titlePosition || 'Title/Position'}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="secondary" icon={FaTimes} onClick={handleCancel}>Cancel</Button>
              <Button variant="primary" icon={FaSave} onClick={handleSave}>Save Changes</Button>
            </div>
          ) : (
            <Button variant="secondary" icon={FaEdit} onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </div>
      </div>

      {/* --- Tabbed Content --- */}
      <Card noPadding>
        {/* Tab Headers */}
        <div className="flex border-b border-neutral-200 px-5">
          {TABS.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setCurrentTab(tab.name)}
              className={`flex items-center gap-2 -mb-px px-1 py-4 text-sm font-medium
                ${currentTab === tab.name
                  ? 'border-b-2 border-[#2C5CC5] text-[#2C5CC5]'
                  : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                }
              `}
            >
              <tab.icon />
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="p-5">
          {currentTab === 'Personal Information' && (
            <PersonalInformationTab
              formData={formData}
              isEditing={isEditing}
              handleInputChange={handleInputChange}
              handleDelete={handleDelete}
            />
          )}
          
          {currentTab === 'Activities' && (
            <ActivitiesTab activities={DUMMY_ACTIVITIES} />
          )}
          
          {currentTab === 'Notes' && (
            <NotesTab notes={DUMMY_NOTES} />
          )}
        </div>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------
 * Tab 1: Personal Information (CLEANED)
 * ----------------------------------------------------- */
function PersonalInformationTab({ formData, isEditing, handleInputChange, handleDelete }) {
  
  // Section Title Component
  const SectionTitle = ({ title }) => (
    <h3 className="text-lg font-semibold text-slate-900 pb-2 border-b border-neutral-200 col-span-1 md:col-span-2">
      {title}
    </h3>
  )

  return (
    <div className="space-y-8">
      {/* Form fields are now in a clean 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <SectionTitle title="Contact Information" />
        
        <FormField id="phoneNumber" label="Phone Number">
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange('phoneNumber')}
            placeholder="+62 812 3456 7890"
            disabled={!isEditing}
          />
        </FormField>
        
        <FormField id="emailAddress" label="Email Address">
          <Input
            id="emailAddress"
            type="email"
            value={formData.emailAddress}
            onChange={handleInputChange('emailAddress')}
            placeholder="name@company.com"
            disabled={!isEditing}
          />
        </FormField>

        <SectionTitle title="Personal Details" />
        
        <FormField id="placeOfBirth" label="Place of Birth">
          <Input
            id="placeOfBirth"
            value={formData.placeOfBirth}
            onChange={handleInputChange('placeOfBirth')}
            placeholder="Jakarta"
            disabled={!isEditing}
          />
        </FormField>
        
        <FormField id="dateOfBirth" label="Date of Birth">
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            placeholder="dd/mm/yyyy"
            icon={FaCalendarAlt}
            disabled={!isEditing}
          />
        </FormField>
        
        <div className="md:col-span-2">
          <FormField id="educationHistory" label="Education History">
            <DebouncedTextArea
              id="educationHistory"
              value={formData.educationHistory}
              onChange={handleInputChange('educationHistory')}
              placeholder="e.g., MBA from Harvard Business School"
              rows={3}
              disabled={!isEditing}
            />
          </FormField>
        </div>
        
        <div className="md:col-span-2">
           <FormField id="hobbiesInterests" label="Hobbies & Interests">
            <DebouncedTextArea
              id="hobbiesInterests"
              value={formData.hobbiesInterests}
              onChange={handleInputChange('hobbiesInterests')}
              placeholder="e.g., Golf, Reading, Photography"
              rows={3}
              disabled={!isEditing}
            />
          </FormField>
        </div>

        <SectionTitle title="Relationship & Role" />
        
        <FormField id="relationshipStatus" label="Relationship Status">
          <Select
            id="relationshipStatus"
            value={formData.relationshipStatus}
            onChange={handleInputChange('relationshipStatus')}
            disabled={!isEditing}
          >
            <option value="">Select status...</option>
            <option value="Warm">Warm</option>
            <option value="Neutral">Neutral</option>
            <option value="Cold">Cold</option>
            <option value="Key Decision Maker">Key Decision Maker</option>
          </Select>
        </FormField>
        
        <FormField id="decisionRole" label="Decision Role">
          <Select
            id="decisionRole"
            value={formData.decisionRole}
            onChange={handleInputChange('decisionRole')}
            disabled={!isEditing}
          >
            <option value="">Select role...</option>
            <option value="Decision Maker">Decision Maker</option>
            <option value="Influencer">Influencer</option>
            <option value="Blocker">Blocker</option>
            <option value="Champion">Champion</option>
          </Select>
        </FormField>
      </div>

      {/* Remove Contact Button */}
      {isEditing && (
        <div className="flex justify-end pt-6 border-t border-neutral-200 mt-6">
          <Button variant="danger" icon={FaTrash} onClick={handleDelete}>
            Remove This Contact
          </Button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------
 * Tab 2: Activities
 * ----------------------------------------------------- */
function ActivitiesTab({ activities }) {
  const opportunityColumns = [
    { key: 'name', label: 'Name' },
    { key: 'stage', label: 'Stage', render: (opp) => <Tag variant="blue">{opp.stage}</Tag> },
    { key: 'amount', label: 'Amount' },
    { key: 'closeDate', label: 'Close Date' },
  ]
  
  return (
    <div className="space-y-6">
      {/* This could be one or two sections. I'll add "Opportunities" here as well. */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Opportunities</h3>
        <Table
          columns={opportunityColumns}
          data={DUMMY_OPPORTUNITIES} // This should be passed as a prop
          rowKey="id"
          onRowClick={(opp) => alert(`Navigating to Opportunity ${opp.id}`)}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Activity Timeline</h3>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="relative pl-6 pb-4 border-l-2 border-slate-200">
              <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-400" />
              <p className="text-xs text-slate-500 flex items-center gap-1.5"><FaClock /> {activity.date} - {activity.type}</p>
              <p className="text-sm text-slate-700">{activity.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------
 * Tab 3: Notes
 * ----------------------------------------------------- */
function NotesTab({ notes }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Add a New Note</h3>
      <DebouncedTextArea
        id="new-note"
        value=""
        onChange={() => {}} // Handle new note state
        placeholder="Add a new note..."
        rows={4}
      />
      <Button variant="primary" size="sm">Save Note</Button>
      <hr />
      
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Past Notes</h3>
      {notes.map(note => (
        <div key={note.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">{note.user} - {note.date}</p>
          <p className="text-sm text-slate-700">{note.note}</p>
        </div>
      ))}
    </div>
  )
}