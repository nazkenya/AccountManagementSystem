import React from 'react'
import { Badge } from '../ui/Badge'
import Select from '../ui/Select'
import { DebouncedTextArea, ViewOrEdit } from '../../pages/accountProfile/components/Inputs'
import {
  FaUserPlus,
  FaUsers,
  FaBalanceScale,
  FaTruck,
  FaExchangeAlt,
} from 'react-icons/fa'

/* -------------------------------------------------------
 * Visual tokens per force — Added 'key' and 'formKey'
 * ----------------------------------------------------- */
const FORCE_STYLES = [
  {
    key: 'rivalry',
    formKey: 'fiveForcesRivalry', // The key in formData
    title: 'Competitive Rivalry',
    icon: FaBalanceScale,
    iconClass: 'text-slate-600',
    iconBgClass: 'bg-slate-100',
  },
  {
    key: 'entrants',
    formKey: 'fiveForcesEntrants',
    title: 'Threat of New Entrants',
    icon: FaUserPlus,
    iconClass: 'text-yellow-700',
    iconBgClass: 'bg-yellow-100',
  },
  {
    key: 'substitutes',
    formKey: 'fiveForcesSubstitute',
    title: 'Threat of Substitutes',
    icon: FaExchangeAlt,
    iconClass: 'text-red-700',
    iconBgClass: 'bg-red-100',
  },
  {
    key: 'suppliers',
    formKey: 'fiveForcesSupplier',
    title: 'Bargaining Power of Suppliers',
    icon: FaTruck,
    iconClass: 'text-blue-700',
    iconBgClass: 'bg-blue-100',
  },
  {
    key: 'buyers',
    formKey: 'fiveForcesBuyer',
    title: 'Bargaining Power of Buyers',
    icon: FaUsers,
    iconClass: 'text-emerald-700',
    iconBgClass: 'bg-emerald-100',
  },
]

/* -------------------------------------------------------
 * Badge variant helper (Unchanged)
 * ----------------------------------------------------- */
const getBadgeVariant = (rating) => {
  switch ((rating || '').toLowerCase()) {
    case 'low':
      return 'success'
    case 'moderate':
      return 'warning'
    case 'high':
      return 'danger'
    default:
      return 'neutral'
  }
}

/* -------------------------------------------------------
 * Editable Cell for Notes
 * ----------------------------------------------------- */
function EditableNotesCell({ value, onChange, isEditing, placeholder }) {
  return (
    <div className="py-2">
      <ViewOrEdit
        editing={isEditing}
        view={
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">
            {value || <span className="text-slate-400">Not set</span>}
          </div>
        }
      >
        <DebouncedTextArea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full min-h-[80px]"
        />
      </ViewOrEdit>
    </div>
  )
}

/* -------------------------------------------------------
 * Editable Cell for Threat Level (Rating)
 * ----------------------------------------------------- */
function EditableRatingCell({ value, onChange, isEditing }) {
  return (
    <div className="py-2">
      <ViewOrEdit
        editing={isEditing}
        view={
          <Badge variant={getBadgeVariant(value)}>{value || 'Not Set'}</Badge>
        }
      >
        <Select
          id={`rating-${value}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          <option value="Low">Low</option>
          <option value="Moderate">Moderate</option>
          <option value="High">High</option>
        </Select>
      </ViewOrEdit>
    </div>
  )
}

/* -------------------------------------------------------
 * Main Layout (NEW: Table Form)
 * ----------------------------------------------------- */
export default function FiveForcesAnalysis({ formData, setField, isEditing }) {
  // Handler to update the nested form object
  const handleChange = (formKey, field, newValue) => {
    const oldData = formData[formKey] || { rating: '', notes: '' }
    setField(formKey, {
      ...oldData,
      [field]: newValue,
    })
  }

  return (
    <div className="w-full space-y-4 p-2 max-w-7xl mx-auto">
      
      {/* Single title, styled like your Table Header */}
      <h2 className="text-base font-medium text-[#4169E1] tracking-wider mb-3 px-1">
        Porter's Five Forces Analysis
      </h2>
      
      {/* Wrapper styled just like your Table component */}
      <div className="overflow-auto max-h-[70vh] bg-white rounded-xl border border-neutral-200">
        <table className="min-w-full text-left">
          
          {/* Header styled just like your Table component */}
          <thead className="sticky top-0 z-10 bg-white border-b border-[#4169E1]">
            <tr>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-1/3">
                Force
              </th>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-1/4">
                Threat Level
              </th>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-5/12">
                Analysis & Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {FORCE_STYLES.map((force, idx) => {
              const currentData = formData[force.formKey] || { rating: '', notes: '' }
              
              return (
                <tr 
                  key={force.key} 
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
                >
                  {/* Force Cell (with Icon) */}
                  <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-1/3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${force.iconBgClass}`}>
                        {React.createElement(force.icon, { className: `h-5 w-5 ${force.iconClass}` })}
                      </div>
                      <span className="font-medium text-slate-900">{force.title}</span>
                    </div>
                  </td>

                  {/* Threat Level Cell (Editable) */}
                  <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-1/4">
                    <EditableRatingCell
                      value={currentData.rating}
                      onChange={(v) => handleChange(force.formKey, 'rating', v)}
                      isEditing={isEditing}
                    />
                  </td>

                  {/* Analysis Cell (Editable) */}
                  <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-5/12">
                    <EditableNotesCell
                      value={currentData.notes}
                      onChange={(v) => handleChange(force.formKey, 'notes', v)}
                      isEditing={isEditing}
                      placeholder={`Add justification or notes...`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}