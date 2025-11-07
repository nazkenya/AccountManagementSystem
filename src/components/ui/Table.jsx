import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- Reusable Button Component ---
/**
 * Unified Button component
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'back'
 * - size: 'sm' | 'md' | 'lg'
 * - fullWidth: boolean
 * - isLoading: boolean
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  type = 'button',
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const variants = {
    primary: 'bg-[#2C5CC5] text-white hover:bg-[#234AA0] active:bg-[#1C3A80] focus:ring-[#2C5CC5]/30 shadow-sm hover:shadow',
    secondary: 'bg-white border border-neutral-300 text-neutral-800 hover:border-[#2C5CC5] hover:text-neutral-900 focus:ring-[#2C5CC5]/20 shadow-sm',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-[#7C3AED]/20',
    back: 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 active:bg-neutral-200 focus:ring-neutral-300/30 shadow-sm',
    success: 'bg-[#2ECC71] text-white hover:bg-[#27AE60] focus:ring-[#2ECC71]/30 shadow-sm',
    danger: 'bg-[#E74C3C] text-white hover:bg-[#C0392B] focus:ring-[#E74C3C]/30 shadow-sm',
  }

  const spinner = (
    <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  return (
    <button
      className={[
        base,
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        fullWidth ? 'w-full' : '',
        isLoading ? 'cursor-progress opacity-75' : '',
        className,
      ].join(' ').trim()}
      aria-busy={isLoading || undefined}
      disabled={isLoading || props.disabled}
      type={type}
      {...props}
    >
      {isLoading && spinner}
      {children}
    </button>
  )
}


// --- EditableCell Component ---
// This component manages its own editing state
// to prevent the input from losing focus during parent re-renders.
function EditableCell({ value: initialValue, onSave, columnConfig }) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);
  
  // Type of input to render
  const inputType = columnConfig.type || 'text';

  // Update internal value if the external prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Focus and select the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select && inputType !== 'select') { // Don't auto-select text for dropdowns
         inputRef.current.select();
      }
    }
  }, [isEditing, inputType]);

  const handleSave = () => {
    // Coerce value based on column type
    let finalValue = value;
    if (inputType === 'number') {
      finalValue = parseFloat(value) || 0;
    }
    
    // For 'select', the value is already correct from onChange
    
    onSave(finalValue);
    setIsEditing(false);
  };
  
  // Special save handler for select, since it should save on change
  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // We save immediately on change for select
    let finalValue = newValue;
    onSave(finalValue);
    setIsEditing(false);
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue); // Revert to original value
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    if (columnConfig.editable !== false) {
      setIsEditing(true);
    }
  };

  // --- Display Value (Not Editing) ---
  // When not editing, we need to show the *label* for 'select' types
  let displayValue = value;
  if (inputType === 'select' && columnConfig.options && !columnConfig.render) {
    const selectedOption = columnConfig.options.find(opt => opt.value == value); // Use == for loose comparison
    if (selectedOption) {
      displayValue = selectedOption.label;
    } else {
      displayValue = value; // Fallback if value doesn't match an option
    }
  }

  if (isEditing) {
    // --- Render Edit Mode ---
    if (inputType === 'select' && columnConfig.options) {
      // *** NEW: Render a <select> dropdown ***
      return (
        <select
          ref={inputRef}
          value={value}
          onChange={handleSelectChange} // Use special handler to save on change
          onBlur={handleSave} // Still save on blur
          onKeyDown={handleKeyDown} // Handle Escape
          className="w-full px-2 py-1.5 border border-blue-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          {columnConfig.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
    
    // --- Default: Render an <input> ---
    return (
      <input
        ref={inputRef}
        type={inputType}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full px-2 py-1.5 border border-blue-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    );
  }

  // --- Render Read Mode ---
  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="min-h-[2.5rem] px-2 py-1.5 rounded-md -mx-2 -my-1.5 transition-colors cursor-text hover:bg-gray-100"
      title={columnConfig.editable !== false ? "Double-click to edit" : undefined}
    >
      {/* Handle custom rendering or show the calculated displayValue */}
      {columnConfig.render ? columnConfig.render({ [columnConfig.key]: value }) : displayValue}
    </div>
  );
}

// --- Reusable Table Component ---
/**
 * Enhanced reusable Table component.
 * Props:
 * - columns: [{ key, label, render?, className?, cellClass?, editable?, type?, options? }]
 * - data: array of row objects
 * - rowKey: function or string key to identify row
 * - onRowClick?: fn(row)
 * - renderCell?: (row, key) => ReactNode
 * - className: wrapper className
 * - mode: 'readonly', 'editable', 'addable'
 * - onDataChange: (newData) => void (required for 'editable/'addable')
 * - onAddRow: () => void (required for 'addable')
 */
function Table({
  columns = [],
  data = [],
  rowKey,
  onRowClick,
  renderCell,
  className = '',
  emptyMessage = 'No records',
  dense = false,
  // New props for editing
  mode = 'readonly', // 'readonly', 'editable', 'addable'
  onDataChange,
  onAddRow,
}) {
  const getRowKey = (row, idx) => {
    if (typeof rowKey === 'function') return rowKey(row)
    if (typeof rowKey === 'string') return row[rowKey]
    return row.id ?? idx
  }

  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const sortedData = useMemo(() => {
    if (!sort.key) return data
    const arr = [...data]
    arr.sort((a, b) => {
      const av = a?.[sort.key]
      const bv = b?.[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return sort.dir === 'asc' ? -1 : 1
      if (bv == null) return sort.dir === 'asc' ? 1 : -1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av
      }
      return sort.dir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return arr
  }, [data, sort])

  const toggleSort = (key) => {
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' }
      return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  // --- Cell Save Handler ---
  const handleCellSave = (newValue, rowToUpdate, columnKey) => {
    if (!onDataChange) return;

    const keyToUpdate = getRowKey(rowToUpdate);
    const newData = data.map(r => 
      getRowKey(r) === keyToUpdate ? { ...r, [columnKey]: newValue } : r
    );
    onDataChange(newData);
  };

  const thPad = dense ? 'px-4 py-2.5' : 'px-5 py-3.5'
  const tdPad = dense ? 'px-4 py-3' : 'px-5 py-3' // Adjusted padding for editable cells
  const thText = dense ? 'text-[11px]' : 'text-xs'
  const tdText = dense ? 'text-[12px]' : 'text-[13px]'

  return (
    <div className={`overflow-auto max-h-[70vh] bg-white rounded-xl border border-neutral-200 ${className}`}>
      <table className="min-w-full text-left">
        <thead className={`sticky top-0 z-10 bg-white border-b border-[#4169E1]`}>
          <tr>
            <th
              key="__rowNumber__"
              className={`${thPad} ${thText} font-medium text-[#4169E1] tracking-wider w-12 text-center`}
            >
              No
            </th>
            {columns.map((col) => (
              <th
                key={col.key || col.label}
                className={`${thPad} ${thText} font-medium text-[#4169E1] tracking-wider ${col.className || ''}`}
              >
                {col.sortable ? (
                  <button
                    className={`inline-flex items-center gap-1.5 hover:text-blue-800 transition-colors`}
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort.key === col.key ? (
                      <span className="text-[10px]">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                    ) : (
                      <span className={`text-[10px] text-[#4169E1] opacity-50`}>↕</span>
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className={`${dense ? 'px-4' : 'px-5'} py-10 text-center text-neutral-400 ${tdText}`}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {sortedData.map((row, idx) => (
            <tr
              key={getRowKey(row, idx)}
              className={`transition-colors duration-100 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
              } ${onRowClick && mode === 'readonly' ? 'cursor-pointer hover:bg-blue-50' : ''}`}
              onClick={() => onRowClick && mode === 'readonly' ? onRowClick(row) : undefined}
            >
              <td
                key="__rowNumber__"
                className={`${tdPad} ${tdText} text-neutral-500 align-top text-center`}
              >
                {idx + 1}
              </td>
              {columns.map((col) => {
                
                // *** NEW: Logic to show label in read-only mode ***
                let readOnlyDisplayValue = row[col.key] ?? '';
                if (col.type === 'select' && col.options && !col.render && !renderCell) {
                  const selectedOption = col.options.find(opt => opt.value == readOnlyDisplayValue);
                  if (selectedOption) {
                    readOnlyDisplayValue = selectedOption.label;
                  }
                }
                
                return (
                  <td
                    key={col.key || col.label}
                    className={`${tdPad} ${tdText} text-neutral-700 align-top ${col.cellClass || ''}`}
                  >
                    {/* --- Cell Rendering Logic --- */}
                    {
                      (mode === 'readonly' || col.editable === false || renderCell || col.render)
                      ? (
                        // Read-only mode or custom render function
                        renderCell 
                          ? renderCell(row, col.key) 
                          : col.render 
                            ? col.render(row) 
                            : readOnlyDisplayValue // Use new display value
                      )
                      : (
                        // Editable mode
                        <EditableCell
                          value={row[col.key] ?? ''}
                          onSave={(newValue) => handleCellSave(newValue, row, col.key)}
                          columnConfig={col} // Pass the full column config
                        />
                      )
                    }
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        {/* --- Add Row Footer --- */}
        {mode === 'addable' && (
          <tfoot className={`sticky bottom-0 bg-neutral-50 border-t border-neutral-200`}>
            <tr>
              <td colSpan={columns.length + 1} className={`${thPad} text-right`}>
                <Button
                  onClick={onAddRow}
                  variant="primary"
                  size="sm"
                >
                  + Add New Row
                </Button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}


export default Table;

