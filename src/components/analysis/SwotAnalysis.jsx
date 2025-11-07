import React from 'react'
import { ViewOrEdit, DebouncedTextArea } from '../../pages/accountProfile/components/Inputs'
import {
  FaPlusCircle,      // Strengths
  FaMinusCircle,     // Weaknesses
  FaLightbulb,       // Opportunities
  FaExclamationTriangle, // Threats
} from 'react-icons/fa'

/* -------------------------------------------------------
 * Visual tokens per quadrant (Unchanged)
 * ----------------------------------------------------- */
const SWOT_STYLES = {
  strengths: {
    title: 'Strengths',
    icon: FaPlusCircle,
    iconClass: 'text-green-700',
    iconBgClass: 'bg-green-100',
    key: 'strengths',
  },
  weaknesses: {
    title: 'Weaknesses',
    icon: FaMinusCircle,
    iconClass: 'text-yellow-700',
    iconBgClass: 'bg-yellow-100',
    key: 'weaknesses',
  },
  opportunities: {
    title: 'Opportunities',
    icon: FaLightbulb,
    iconClass: 'text-blue-700',
    iconBgClass: 'bg-blue-100',
    key: 'opportunities',
  },
  threats: {
    title: 'Threats',
    icon: FaExclamationTriangle,
    iconClass: 'text-red-700',
    iconBgClass: 'bg-red-100',
    key: 'threats',
  },
}

// Helper arrays for mapping
const INTERNAL_FACTORS = [SWOT_STYLES.strengths, SWOT_STYLES.weaknesses]
const EXTERNAL_FACTORS = [SWOT_STYLES.opportunities, SWOT_STYLES.threats]


/* -------------------------------------------------------
 * Reusable Editable Cell for the Table
 * ----------------------------------------------------- */
function EditableTableCell({ value, onChange, isEditing, placeholder }) {
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
          rows={5} // Consistent row size
          className="w-full min-h-[100px]"
        />
      </ViewOrEdit>
    </div>
  )
}


/* -------------------------------------------------------
 * Main Layout (NEW: Table Form)
 * ----------------------------------------------------- */
export default function SwotAnalysis({ formData, setField, isEditing }) {
  const handleChange = (key, v) => {
    setField(key, v)
  }

  return (
    // Wider container for the table layout
    <div className="w-full space-y-4 p-2 max-w-7xl mx-auto">
      
      {/* Single title, styled like your Table Header */}
      <h2 className="text-base font-medium text-[#4169E1] tracking-wider mb-3 px-1">
        SWOT Analysis
      </h2>
      
      {/* Wrapper styled just like your Table component */}
      <div className="overflow-auto max-h-[70vh] bg-white rounded-xl border border-neutral-200">
        <table className="min-w-full text-left">
          
          {/* Header styled just like your Table component */}
          <thead className="sticky top-0 z-10 bg-white border-b border-[#4169E1]">
            <tr>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-1/3">
                Category
              </th>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-2/3">
                Analysis & Notes
              </th>
            </tr>
          </thead>
          <tbody>
            
            {/* --- Internal Factors --- */}
            <tr className="bg-slate-50">
              <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-800">
                Internal Factors
              </td>
            </tr>
            {INTERNAL_FACTORS.map((activity, idx) => (
              <tr 
                key={activity.key} 
                className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
              >
                {/* Category Cell (with Icon) */}
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-1/3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.iconBgClass}`}>
                      {React.createElement(activity.icon, { className: `h-5 w-5 ${activity.iconClass}` })}
                    </div>
                    <span className="font-medium text-slate-900">{activity.title}</span>
                  </div>
                </td>
                {/* Analysis Cell (Editable) */}
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-2/3">
                  <EditableTableCell
                    value={formData[activity.key]}
                    onChange={(v) => handleChange(activity.key, v)}
                    isEditing={isEditing}
                    placeholder={`List ${activity.title.toLowerCase()}...`}
                  />
                </td>
              </tr>
            ))}
            
            {/* --- External Factors --- */}
            <tr className="bg-slate-50">
              <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-800">
                External Factors
              </td>
            </tr>
            {EXTERNAL_FACTORS.map((activity, idx) => (
              <tr 
                key={activity.key} 
                className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
              >
                {/* Category Cell (with Icon) */}
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-1/3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activity.iconBgClass}`}>
                      {React.createElement(activity.icon, { className: `h-5 w-5 ${activity.iconClass}` })}
                    </div>
                    <span className="font-medium text-slate-900">{activity.title}</span>
                  </div>
                </td>
                {/* Analysis Cell (Editable) */}
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-2/3">
                  <EditableTableCell
                    value={formData[activity.key]}
                    onChange={(v) => handleChange(activity.key, v)}
                    isEditing={isEditing}
                    placeholder={`List ${activity.title.toLowerCase()}...`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}