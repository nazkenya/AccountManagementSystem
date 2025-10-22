import React from 'react'
import RichTextEditor from './RichTextEditor'

/**
 * Uncontrolled while focused:
 * - We pass only `initialValue` into the inner RTE (not `value`).
 * - Parent receives updates on blur (and on unmount / optional idle debounce).
 * - Parent renders won't reset Quill.
 */
export default function DebouncedRichTextEditor({
  value = '',
  onChange,
  readOnly = false,
  debounce = 0, // >0 to enable idle flush when not focused
}) {
  const initial = React.useRef(value ?? '').current
  const [inner, setInner] = React.useState(initial)
  const [focused, setFocused] = React.useState(false)
  const lastPushed = React.useRef(initial)

  // If parent prop value changes while not focused, sync it into local state.
  React.useEffect(() => {
    const v = value ?? ''
    if (!focused && v !== lastPushed.current) {
      lastPushed.current = v
      setInner(v)
    }
  }, [value, focused])

  // Optional idle flush while not focused
  React.useEffect(() => {
    if (focused || debounce <= 0) return
    const id = setTimeout(() => {
      if (inner !== lastPushed.current) {
        lastPushed.current = inner
        onChange?.(inner)
      }
    }, debounce)
    return () => clearTimeout(id)
  }, [inner, focused, debounce, onChange])

  // Flush on unmount
  React.useEffect(() => {
    return () => {
      if (inner !== lastPushed.current) {
        lastPushed.current = inner
        onChange?.(inner)
      }
    }
  }, [inner, onChange])

  return (
    <RichTextEditor
      // DO NOT pass `value` — keep Quill uncontrolled during typing
      initialValue={initial}
      readOnly={readOnly}
      onChange={(html) => setInner(html)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        if (inner !== lastPushed.current) {
          lastPushed.current = inner
          onChange?.(inner)
        }
      }}
    />
  )
}
