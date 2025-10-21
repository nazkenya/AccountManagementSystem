import React from 'react'

export const TextInput = ({ id, type = 'text', value, onChange, placeholder, disabled }) => {
  const [touched, setTouched] = React.useState(false)
  let error = ''
  if (touched && value) {
    if (type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      if (!ok) error = 'Please enter a valid email address.'
    } else if (type === 'url') {
      try { new URL(value) } catch { error = 'Please enter a valid URL (e.g., https://example.com).' }
    } else if (type === 'number') {
      if (Number.isNaN(Number(value))) error = 'This field must be a number.'
    }
  }
  const errorId = `${id}-error`
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-neutral-200 focus:ring-2 focus:ring-[#2C5CC5]/20 focus:border-[#2C5CC5]'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      {error && <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  )
}

export const TextArea = ({ id, value, onChange, placeholder, rows = 3, disabled }) => (
  <textarea id={id} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} draggable={false} onDragStart={(e) => e.preventDefault()}
    className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white ${disabled ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#2C5CC5]/20 focus:border-[#2C5CC5]'}`} />
)

export const DebouncedTextInput = ({ id, type = 'text', value, onChange, placeholder, disabled, debounce = 300, className = '' }) => {
  const [inner, setInner] = React.useState(value || '')
  const [focused, setFocused] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const inputRef = React.useRef(null)
  const selRef = React.useRef({ start: null, end: null })
  React.useEffect(() => { if (!focused && inner !== (value || '')) setInner(value || '') }, [value, focused, inner])
  React.useEffect(() => {
    if (focused) return undefined
    const h = setTimeout(() => {
      if (inner !== (value || '')) onChange(inner)
    }, debounce)
    return () => clearTimeout(h)
  }, [inner, value, onChange, debounce, focused])
  // Restore focus and caret if a re-render temporarily dropped focus while we still consider it focused
  React.useEffect(() => {
    if (!focused) return
    const el = inputRef.current
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true })
      const { start, end } = selRef.current
      if (start != null && end != null) {
        try { el.setSelectionRange(start, end) } catch { /* ignore selection set error */ }
      }
    }
  })
  let error = ''
  if (touched && inner) {
    if (type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inner)
      if (!ok) error = 'Please enter a valid email address.'
    } else if (type === 'url') {
      try { new URL(inner) } catch { error = 'Please enter a valid URL (e.g., https://example.com).' }
    } else if (type === 'number') {
      if (Number.isNaN(Number(inner))) error = 'This field must be a number.'
    }
  }
  const errorId = `${id}-error`
  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={inner}
        onChange={e => { setInner(e.target.value); selRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd } }}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setTouched(true); if (inner !== (value || '')) onChange(inner) }}
        onSelect={(e) => { selRef.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd } }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-neutral-200 focus:ring-2 focus:ring-[#2C5CC5]/20 focus:border-[#2C5CC5]'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
        autoComplete="off"
      />
      {error && <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  )
}

export const DebouncedTextArea = ({ id, value, onChange, placeholder, rows = 3, disabled, debounce = 300, className = '' }) => {
  const [inner, setInner] = React.useState(value || '')
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef(null)
  const selRef = React.useRef({ start: null, end: null })
  React.useEffect(() => { if (!focused && inner !== (value || '')) setInner(value || '') }, [value, focused, inner])
  React.useEffect(() => {
    if (focused) return undefined
    const h = setTimeout(() => { if (inner !== (value || '')) onChange(inner) }, debounce)
    return () => clearTimeout(h)
  }, [inner, value, onChange, debounce, focused])
  React.useEffect(() => {
    if (!focused) return
    const el = inputRef.current
    if (el && document.activeElement !== el) {
      el.focus({ preventScroll: true })
      const { start, end } = selRef.current
      if (start != null && end != null) {
        try { el.setSelectionRange(start, end) } catch { /* ignore selection set error */ }
      }
    }
  })
  return (
    <textarea
      ref={inputRef}
      id={id}
      value={inner}
      onChange={e => { setInner(e.target.value); selRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd } }}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); if (inner !== (value || '')) onChange(inner) }}
      onSelect={(e) => { selRef.current = { start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd } }}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white ${disabled ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-[#2C5CC5]/20 focus:border-[#2C5CC5]'} ${className}`}
      autoComplete="off"
    />
  )
}

export const FileInput = ({ id, value, onChange, onClear, accept, disabled, editLabel = 'Edit', removeLabel = 'Remove', uploadLabel = 'Upload file', previewSize = 'w-16 h-16' }) => {
  const inputRef = React.useRef(null)
  const pickFile = () => inputRef.current?.click()
  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0] || null
          if (file) onChange(file)
          e.currentTarget.value = ''
        }}
      />
      {!value ? (
        <button type="button" onClick={pickFile} className="inline-flex items-center px-2 py-1 text-xs rounded border border-neutral-300 hover:bg-neutral-50">{uploadLabel}</button>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {value.type?.startsWith('image/') && (
            <img src={value.dataUrl} alt={value.name} className={`${previewSize} object-cover rounded-lg ring-1 ring-neutral-200`} />
          )}
          <a className="text-sm text-[#2C5CC5] hover:underline" href={value.dataUrl} download={value.name} target="_blank" rel="noreferrer">{value.name}</a>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={pickFile} className="text-xs px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-50">{editLabel}</button>
            <button type="button" onClick={() => onClear && onClear()} className="text-xs px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">{removeLabel}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export const ViewOrEdit = ({ editing, children, view, valueClassName = '', chip = false }) => (
  editing ? children : (
    <div
      className={[
        'text-sm text-neutral-900 min-w-0 leading-relaxed',
        chip ? 'inline-block bg-neutral-50 rounded px-2 py-1' : '',
        valueClassName,
      ].join(' ').trim()}
    >
      {view}
    </div>
  )
)
