import React from 'react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

function RichTextEditorImpl({
  /**
   * If `value` is provided => controlled mode.
   * Otherwise => uncontrolled, starting from `initialValue`.
   * Use controlled mode ONLY if you can guarantee stable updates per keystroke (usually not desired here).
   */
  value,
  initialValue = '',
  onChange,
  readOnly = false,
  onFocus,
  onBlur,
}) {
  const quillRef = React.useRef(null)
  const imageInputRef = React.useRef(null)
  const fileInputRef = React.useRef(null)
  const [_selectedImage, setSelectedImage] = React.useState(null)

  // Keep the latest onChange without recreating the handler
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const handleImage = React.useCallback(() => {
    if (readOnly) return
    imageInputRef.current?.click()
  }, [readOnly])

  const handleAttachment = React.useCallback(() => {
    if (readOnly) return
    fileInputRef.current?.click()
  }, [readOnly])

  const insertImageFromFile = (file) => {
    if (!file) return
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) { alert('Image too large. Max 2MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true)
      quill.insertEmbed(range ? range.index : 0, 'image', reader.result, 'user')
      quill.setSelection((range ? range.index : 0) + 1, 0)
      onChangeRef.current && onChangeRef.current(quill.root.innerHTML)
    }
    reader.readAsDataURL(file)
  }

  const insertAttachmentFromFile = (file) => {
    if (!file) return
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) { alert('File too large. Max 5MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true)
      const href = typeof reader.result === 'string' ? reader.result : ''
      const name = file.name
      const linkHtml = `<a href="${href}" download="${name}" target="_blank" rel="noreferrer">📎 ${name}</a>`
      const index = range ? range.index : 0
      quill.clipboard.dangerouslyPasteHTML(index, linkHtml)
      quill.setSelection(index + linkHtml.length, 0)
      onChangeRef.current && onChangeRef.current(quill.root.innerHTML)
    }
    reader.readAsDataURL(file)
  }

  const handleInsertTable = React.useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    const table = quill.getModule('table')
    if (table && typeof table.insertTable === 'function') {
      table.insertTable(2, 2)
      onChangeRef.current && onChangeRef.current(quill.root.innerHTML)
      return
    }
    const range = quill.getSelection(true)
    const html = '<table class="ql-table"><tbody><tr><td> </td><td> </td></tr><tr><td> </td><td> </td></tr></tbody></table><p><br/></p>'
    const index = range ? range.index : 0
    quill.clipboard.dangerouslyPasteHTML(index, html)
    quill.setSelection(index + 1, 0)
    onChangeRef.current && onChangeRef.current(quill.root.innerHTML)
  }, [])

  // Keep modules stable to avoid re-init on each render
  const modules = React.useMemo(() => (
    readOnly
      ? { toolbar: false, history: { delay: 500, maxStack: 100, userOnly: true }, table: true }
      : {
          toolbar: {
            container: [
              [{ header: [2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ list: 'bullet' }, { list: 'ordered' }, { list: 'check' }],
              ['blockquote', 'link', 'image', 'table', 'attachment'],
              ['clean'],
            ],
            handlers: {
              image: handleImage,
              table: handleInsertTable,
              attachment: handleAttachment,
            },
          },
          table: true,
          history: { delay: 500, maxStack: 100, userOnly: true },
        }
  ), [readOnly, handleImage, handleInsertTable, handleAttachment])

  const formats = React.useMemo(() => [
    'header',
    'bold', 'italic', 'underline',
    'list', 'blockquote', 'link', 'image', 'table',
  ], [])

  const controlled = value !== undefined

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      {!readOnly && (
        <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-500">
          Rich text
        </div>
      )}

      <style>{`
        .ql-container.ql-snow { border: 0 !important; }
        .ql-snow .ql-toolbar { border: 0 !important; border-bottom: 1px solid #e5e7eb !important; border-top-left-radius: 12px; border-top-right-radius: 12px; }
        .ql-editor { min-height: 120px; padding: 10px 12px; }
        .ql-editor img { max-width: 100%; height: auto; max-height: 480px; border-radius: 8px; }
        .ql-editor img.rte-selected { outline: 2px solid #2C5CC5; outline-offset: 2px; }
        .ql-toolbar.ql-snow { display: flex; align-items: center; gap: 8px; padding: 6px 12px; }
        .ql-toolbar .ql-formats { margin: 0; display: flex; align-items: center; gap: 4px; }
        .ql-toolbar.ql-snow .ql-picker, .ql-toolbar.ql-snow button { height: 28px; }
        .ql-toolbar.ql-snow button { width: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; }
        .ql-toolbar.ql-snow .ql-picker-label { border-radius: 6px; display: inline-flex; align-items: center; height: 28px; }
        .ql-toolbar.ql-snow button:hover, .ql-toolbar.ql-snow .ql-picker-label:hover { background: #f3f4f6; }
        .ql-toolbar.ql-snow button.ql-active, .ql-toolbar.ql-snow .ql-picker-label.ql-active { background: #e5e7eb; }
        .ql-toolbar .ql-stroke { fill: none; stroke: #6b7280; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .ql-toolbar .ql-picker-label .ql-stroke, .ql-toolbar button:hover .ql-stroke { stroke: #374151; }
      `}</style>

      {!readOnly && <SetToolbarTitles />}

      {/* Hidden inputs for uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) insertImageFromFile(file)
          e.currentTarget.value = ''
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) insertAttachmentFromFile(file)
          e.currentTarget.value = ''
        }}
      />

      <ReactQuill
        ref={quillRef}
        // IMPORTANT: keep theme *constant* so Quill doesn't re-init when readOnly flips.
        theme="snow"
        readOnly={readOnly}
        // Controlled vs uncontrolled (never pass both):
        {...(controlled ? { value } : { defaultValue: initialValue })}
        onChange={(html) => onChangeRef.current && onChangeRef.current(html)}
        modules={modules}
        formats={formats}
        placeholder={readOnly ? undefined : 'Write here…'}
        className="prose prose-neutral max-w-none text-left"
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={(e) => {
          if (!(e.target instanceof HTMLElement)) return
          const root = quillRef.current?.getEditor()?.root
          root?.querySelectorAll('img.rte-selected')?.forEach((el) => el.classList.remove('rte-selected'))
          if (e.target.tagName === 'IMG') {
            e.target.classList.add('rte-selected')
            setSelectedImage(e.target)
          } else {
            setSelectedImage(null)
          }
        }}
      />
    </div>
  )
}

const areEqual = (p, n) =>
  p.value === n.value &&
  p.initialValue === n.initialValue &&
  p.readOnly === n.readOnly

export default React.memo(RichTextEditorImpl, areEqual)

function SetToolbarTitles() {
  React.useEffect(() => {
    const set = () => {
      document.querySelectorAll('.ql-toolbar').forEach((el) => {
        const att = el.querySelector('button.ql-attachment')
        if (att) {
          att.setAttribute('title', 'Attach file')
          if (!att.querySelector('svg')) {
            att.innerHTML = "<svg viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><path class='ql-stroke' d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 115.66 5.66l-9.19 9.19a2 2 0 01-2.83-2.83l8.13-8.13'/></svg>"
          }
        }
        const tbl = el.querySelector('button.ql-table')
        if (tbl) {
          tbl.setAttribute('title', 'Insert table')
          if (!tbl.querySelector('svg')) {
            tbl.innerHTML = "<svg viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><rect class='ql-stroke' x='3' y='3' width='18' height='18' rx='2' ry='2' fill='none'/><path class='ql-stroke' d='M3 9h18M9 3v18'/></svg>"
          }
        }
            const chk = el.querySelector('button.ql-list[value="check"]')
        if (chk) {
          chk.setAttribute('title', 'Checklist')
          if (!chk.querySelector('svg')) {
            chk.innerHTML = "<svg viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><rect class='ql-stroke' x='4' y='4' width='16' height='16' rx='2' ry='2' fill='none'/><path class='ql-stroke' d='M7 9h5M7 15h10M13 11l2 2 4-4'/></svg>"
          }
        }
      })
    }
    set()
    const obs = new MutationObserver(set)
    document.querySelectorAll('.ql-toolbar').forEach((el) => {
      obs.observe(el, { childList: true, subtree: true })
    })
    return () => obs.disconnect()
  }, [])
  return null
}
