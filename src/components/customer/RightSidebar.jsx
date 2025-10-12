import React from 'react'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

function ContactMini({ name, title, email, phone, color = 'neutral', onClick, dark = false }) {
  const initials = name.split(' ').map((s) => s[0]).join('').slice(0,2)
  const cl = dark
    ? 'bg-white/10 text-white ring-white/20'
    : color === 'pink'
      ? 'bg-pink-100 text-pink-700 ring-pink-200'
      : color === 'blue'
        ? 'bg-blue-100 text-blue-700 ring-blue-200'
        : 'bg-neutral-100 text-neutral-700 ring-neutral-200'
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div className={`flex items-start gap-3 p-2 rounded-lg ${dark ? 'hover:bg-white/5' : 'hover:bg-neutral-50'}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ${cl}`}>{initials}</div>
        <div className="text-sm">
          <div className={`${dark ? 'text-white' : 'text-neutral-900'} font-medium leading-tight`}>{name}</div>
          <div className={`text-xs leading-tight ${dark ? 'text-white/60' : 'text-neutral-500'}`}>{title}</div>
          <div className={`text-xs mt-1 ${dark ? 'text-white/60' : 'text-neutral-500'}`}>{email}</div>
          <div className={`text-xs ${dark ? 'text-white/60' : 'text-neutral-500'}`}>{phone}</div>
        </div>
      </div>
    </button>
  )
}

export default function RightSidebar({ contacts }) {
  const pic = contacts.picUtama || []
  const am = contacts.accountManager || []
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(null)
  // Non-collapsible sticky sidebar

  return (
    <aside className="relative shrink-0 w-full lg:w-[300px] lg:sticky lg:top-4">
      <div className="rounded-xl bg-white border border-neutral-200 shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <div className="text-sm font-medium text-neutral-800">Contacts</div>
        </div>
        <div className="p-3">
          {/* PIC */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-800">PIC Utama</div>
              <Badge className="px-2">{pic.length}</Badge>
            </div>
            <div className="space-y-2">
              {pic.map((c, i) => (
                <ContactMini
                  key={`pic-${i}`}
                  {...c}
                  color="pink"
                  onClick={() => {
                    setActive({ ...c, group: 'PIC Utama' })
                    setOpen(true)
                  }}
                />
              ))}
            </div>
          </div>

          {/* AM */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-neutral-800">Account Manager</div>
              <Badge className="px-2">{am.length}</Badge>
            </div>
            <div className="space-y-2">
              {am.map((c, i) => (
                <ContactMini
                  key={`am-${i}`}
                  {...c}
                  color="blue"
                  onClick={() => {
                    setActive({ ...c, group: 'Account Manager' })
                    setOpen(true)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={active ? `${active.group} — ${active.name}` : 'Detail Kontak'}
      >
        {active && (
          <div className="space-y-2 text-sm">
            <div><span className="text-neutral-500">Nama:</span> <span className="font-medium">{active.name}</span></div>
            <div><span className="text-neutral-500">Jabatan:</span> {active.title}</div>
            <div><span className="text-neutral-500">Email:</span> {active.email}</div>
            <div><span className="text-neutral-500">Telepon:</span> {active.phone}</div>
          </div>
        )}
      </Modal>
    </aside>
  )
}
