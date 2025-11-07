import React from 'react'
import { ViewOrEdit, DebouncedTextArea } from '../../pages/accountProfile/components/Inputs'
import ValueChainDiagram from '../../pages/accountProfile/assets/Value-Chain-Analysis-Template.jpg'


// Assuming you import your image like this:
// import ValueChainDiagram from './images/image_bf69a0.png'

/* -------------------------------------------------------
 * Data structure for the table
 * ----------------------------------------------------- */
const VALUE_CHAIN_ACTIVITIES = [
  {
    category: 'Support Activities',
    key: 'firmInfrastructure',
    label: 'Firm Infrastructure',
  },
  {
    category: 'Support Activities',
    key: 'humanResources',
    label: 'Human Resources Management',
  },
  {
    category: 'Support Activities',
    key: 'technologyDevelopment',
    label: 'Technology Development',
  },
  {
    category: 'Support Activities',
    key: 'procurement',
    label: 'Procurement',
  },
  {
    category: 'Primary Activities',
    key: 'inboundLogistics',
    label: 'Inbound Logistics',
  },
  {
    category: 'Primary Activities',
    key: 'operations',
    label: 'Operations',
  },
  {
    category: 'Primary Activities',
    key: 'outboundLogistics',
    label: 'Outbound Logistics',
  },
  {
    category: 'Primary Activities',
    key: 'marketingSales',
    label: 'Marketing & Sales',
  },
  {
    category: 'Primary Activities',
    key: 'service',
    label: 'Service',
  },
  {
    category: 'Primary Activities',
    key: 'margin',
    label: 'Margin',
  },
]

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
          rows={4}
          className="w-full min-h-[80px]"
        />
      </ViewOrEdit>
    </div>
  )
}

/* -------------------------------------------------------
 * Main Layout: Industry Value Chain Analysis (Table Form)
 * ----------------------------------------------------- */
export default function IndustryValueChainAnalysis({ formData, setField, isEditing }) {
  const handleChange = (key, v) => setField(key, v)

  return (
    <div className="w-full space-y-6 p-2 max-w-7xl mx-auto">
      
      {/* Overall Component Title */}
      <h2 className="text-base font-medium text-[#4169E1] tracking-wider mb-3 px-1">
        Industry Value Chain Analysis
      </h2>

      {/* 1. The Diagram */}
      <div className="w-full p-4 border border-neutral-200 rounded-xl bg-white">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Porter's Value Chain Framework
        </h3>
        {/* Replace this block with your actual image component.
          You'll need to import your image at the top of the file.
        */}
        <div className="flex items-center justify-center bg-slate-50 rounded-lg p-8 border border-dashed border-neutral-300">
          <img
            src={ValueChainDiagram}
            alt="Porter's Value Chain Diagram"
            className="max-w-full h-auto rounded-md"
            />
        </div>
      </div>

      {/* 2. The Input Table */}
      {/* Wrapper styled just like your Table component */}
      <div className="overflow-auto max-h-[70vh] bg-white rounded-xl border border-neutral-200">
        <table className="min-w-full text-left">
          {/* Header styled just like your Table component */}
          <thead className="sticky top-0 z-10 bg-white border-b border-[#4169E1]">
            <tr>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-1/3">
                Activity
              </th>
              <th className="px-5 py-3.5 text-xs font-medium text-[#4169E1] tracking-wider w-2/3">
                Analysis & Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {/* --- Support Activities --- */}
            <tr className="bg-slate-50">
              <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-800">
                Support Activities
              </td>
            </tr>
            {VALUE_CHAIN_ACTIVITIES.filter(a => a.category === 'Support Activities').map((activity, idx) => (
              <tr 
                key={activity.key} 
                className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
              >
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top font-medium w-1/3">
                  {activity.label}
                </td>
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-2/3">
                  <EditableTableCell
                    value={formData[activity.key]}
                    onChange={(v) => handleChange(activity.key, v)}
                    isEditing={isEditing}
                    placeholder={`Describe ${activity.label.toLowerCase()}...`}
                  />
                </td>
              </tr>
            ))}
            
            {/* --- Primary Activities --- */}
            <tr className="bg-slate-50">
              <td colSpan={2} className="px-5 py-3 text-sm font-semibold text-slate-800">
                Primary Activities
              </td>
            </tr>
            {VALUE_CHAIN_ACTIVITIES.filter(a => a.category === 'Primary Activities').map((activity, idx) => (
              <tr 
                key={activity.key} 
                className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}
              >
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top font-medium w-1/3">
                  {activity.label}
                </td>
                <td className="px-5 py-3 text-[13px] text-neutral-700 align-top w-2/3">
                  <EditableTableCell
                    value={formData[activity.key]}
                    onChange={(v) => handleChange(activity.key, v)}
                    isEditing={isEditing}
                    placeholder={`Describe ${activity.label.toLowerCase()}...`}
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