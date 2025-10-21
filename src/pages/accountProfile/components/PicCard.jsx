import React from 'react'
import { FiEdit, FiMove, FiPhone, FiMail, FiCalendar, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { DebouncedTextInput, DebouncedTextArea } from './Inputs'
import Select from '../../../components/ui/Select'
import Button from '../../../components/ui/Button'

function useInitials() {
  return React.useCallback((name) => (name || '').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]).join('').toUpperCase(), [])
}

export const PicCard = React.memo(function PicCard({ p, idx, isEditing, isReordering, isTyping, updatePic, removePic, movePic, setIsReordering, onAvatarChange, toWhatsApp, onTypingStart, onTypingEnd }) {
  const initialsOf = useInitials()
  return (
    <div
      className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
      onDragOver={(e) => { if (isEditing && isReordering) e.preventDefault() }}
      onDrop={(e) => { if (!isEditing || !isReordering) return; const from = Number(e.dataTransfer.getData('text/plain')); if (!Number.isNaN(from) && from !== idx) movePic(from, idx); setIsReordering(false) }}
    >
      <div className="flex items-center gap-3 p-4 bg-neutral-50 border-b border-neutral-200">
        <div className="relative">
          {p.avatar?.dataUrl ? (
            <img src={p.avatar.dataUrl} alt={p.name || 'Avatar'} className="w-12 h-12 rounded-lg object-cover ring-2 ring-white shadow-sm" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#F0F6FF] text-[#2C5CC5] grid place-items-center ring-2 ring-white shadow-sm font-semibold text-sm">
              {initialsOf(p.name) || 'PIC'}
            </div>
          )}
          {isEditing && (
            <>
              <label 
                htmlFor={`pic-avatar-${idx}`} 
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiEdit className="w-4 h-4 text-white" />
              </label>
              <input id={`pic-avatar-${idx}`} type="file" accept="image/*" className="hidden" onChange={(e) => onAvatarChange(idx, e.target.files?.[0] || null)} />
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <DebouncedTextInput
                id={`pic-name-${idx}`}
                value={p.name}
                onChange={v => { updatePic(idx, 'name', v) }}
                placeholder="Full name"
                className="font-semibold"
                onFocus={onTypingStart}
                onBlur={(e) => { onTypingEnd?.(); e?.target?.blur?.() }}
              />
              <DebouncedTextInput
                id={`pic-title-${idx}`}
                value={p.title}
                onChange={v => { updatePic(idx, 'title', v) }}
                placeholder="Title/Position"
                className="text-xs text-neutral-600"
                onFocus={onTypingStart}
                onBlur={() => onTypingEnd?.()}
              />
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold text-neutral-900 truncate">{p.name || 'Unnamed Contact'}</div>
              <div className="text-xs text-neutral-500 truncate mt-0.5">{p.title || 'No title'}</div>
            </>
          )}
        </div>
        {isEditing && (
          <button 
            type="button"
            draggable={!isTyping}
            onDragStart={(e) => { if (isTyping) { e.preventDefault(); return; } e.stopPropagation(); setIsReordering(true); e.dataTransfer.setData('text/plain', String(idx)) }}
            onDragEnd={() => setIsReordering(false)}
            className={`p-2 rounded-lg hover:bg-neutral-200/60 text-neutral-400 hover:text-neutral-600 transition-colors ${isTyping ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing'}`}
            title="Drag to reorder"
          >
            <FiMove className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {!isEditing && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
              <div className="inline-flex items-center gap-2 truncate">
                <FiPhone className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                {p.phone ? (
                  <a href={toWhatsApp(p.phone)} target="_blank" rel="noreferrer" className="text-[#2C5CC5] hover:underline">{p.phone}</a>
                ) : <span className="text-neutral-400">—</span>}
              </div>
              <div className="inline-flex items-center gap-2 truncate">
                <FiMail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                {p.email ? (
                  <a href={`mailto:${p.email}`} className="text-[#2C5CC5] hover:underline truncate">{p.email}</a>
                ) : <span className="text-neutral-400">—</span>}
              </div>
              <div className="inline-flex items-center gap-2 truncate">
                <FiMapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>{p.birthPlace || '—'}</span>
              </div>
              <div className="inline-flex items-center gap-2 truncate">
                <FiCalendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>{p.birthDate || '—'}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" />
                Personal Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Education History</div>
                  <div className="text-neutral-900 whitespace-pre-wrap">{p.education || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Hobbies & Interests</div>
                  <div className="text-neutral-900 whitespace-pre-wrap">{p.hobbies || '—'}</div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" />
                Relationship & Role
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Relationship Status</div>
                  <div className="text-neutral-900">{p.relationshipStatus || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Decision Role</div>
                  <div className="text-neutral-900">{p.decisionRole || '—'}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {!isEditing && (p.phone || p.email) && (
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
            {p.phone && (
              <a 
                href={toWhatsApp(p.phone)} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-[#2C5CC5] hover:bg-[#F0F6FF] text-[#2C5CC5] text-xs font-medium transition-colors"
              >
                <FaWhatsapp className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            {p.email && (
              <a 
                href={`mailto:${p.email}`} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-[#2C5CC5] hover:bg-[#F0F6FF] text-[#2C5CC5] text-xs font-medium transition-colors"
              >
                <FiMail className="w-3.5 h-3.5" /> Email
              </a>
            )}
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" />
                Contact Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`pic-phone-${idx}`} className="block text-xs text-neutral-500 mb-1">Phone Number</label>
                  <DebouncedTextInput id={`pic-phone-${idx}`} value={p.phone} onChange={v => updatePic(idx, 'phone', v)} placeholder="+62 812 3456 7890" onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
                </div>
                <div>
                  <label htmlFor={`pic-email-${idx}`} className="block text-xs text-neutral-500 mb-1">Email Address</label>
                  <DebouncedTextInput id={`pic-email-${idx}`} type="email" value={p.email} onChange={v => updatePic(idx, 'email', v)} placeholder="name@company.com" onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" />
                Personal Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`pic-birthPlace-${idx}`} className="block text-xs text-neutral-500 mb-1">Place of Birth</label>
                  <DebouncedTextInput id={`pic-birthPlace-${idx}`} value={p.birthPlace} onChange={v => updatePic(idx, 'birthPlace', v)} placeholder="Jakarta" onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
                </div>
                <div>
                  <label htmlFor={`pic-birthDate-${idx}`} className="block text-xs text-neutral-500 mb-1">Date of Birth</label>
                  <DebouncedTextInput id={`pic-birthDate-${idx}`} type="date" value={p.birthDate} onChange={v => updatePic(idx, 'birthDate', v)} placeholder="" onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
                </div>
              </div>
              <div>
                <label htmlFor={`pic-education-${idx}`} className="block text-xs text-neutral-500 mb-1">Education History</label>
                <DebouncedTextArea id={`pic-education-${idx}`} value={p.education} onChange={v => updatePic(idx, 'education', v)} placeholder="e.g., MBA from Harvard Business School" rows={2} onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
              </div>
              <div>
                <label htmlFor={`pic-hobbies-${idx}`} className="block text-xs text-neutral-500 mb-1">Hobbies & Interests</label>
                <DebouncedTextArea id={`pic-hobbies-${idx}`} value={p.hobbies} onChange={v => updatePic(idx, 'hobbies', v)} placeholder="e.g., Golf, Reading, Photography" rows={2} onFocus={onTypingStart} onBlur={() => onTypingEnd?.()} />
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#2C5CC5]" />
                Relationship & Role
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor={`pic-relationship-${idx}`} className="block text-xs text-neutral-500 mb-1">Relationship Status</label>
                  <Select id={`pic-relationship-${idx}`} value={p.relationshipStatus} onChange={e => updatePic(idx, 'relationshipStatus', e.target.value)} onFocus={onTypingStart} onBlur={onTypingEnd}>
                    <option value="">Select status...</option>
                    <option value="Promotor">Promotor</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Detractor">Detractor</option>
                  </Select>
                </div>
                <div>
                  <label htmlFor={`pic-decision-${idx}`} className="block text-xs text-neutral-500 mb-1">Decision Role</label>
                  <Select id={`pic-decision-${idx}`} value={p.decisionRole} onChange={e => updatePic(idx, 'decisionRole', e.target.value)} onFocus={onTypingStart} onBlur={onTypingEnd}>
                    <option value="">Select role...</option>
                    <option value="Decision Maker">Decision Maker</option>
                    <option value="Influencer">Influencer</option>
                    <option value="User">User</option>
                  </Select>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Button variant="danger" size="sm" onClick={() => removePic(idx)} aria-label="Remove PIC">
                <FiTrash2 className="w-4 h-4" /> Remove Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
