import React from 'react'
import Card from '../ui/Card'
import { FaEnvelope, FaPhone, FaStickyNote } from 'react-icons/fa'

function Item({ icon, title, meta, note }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 grid place-items-center text-neutral-600 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral-900 truncate">{title}</div>
        <div className="text-xs text-neutral-500">{meta}</div>
        {note && <div className="text-sm text-neutral-700 mt-1">{note}</div>}
      </div>
    </div>
  )
}

export default function ActivityTimeline() {
  const items = [
    { icon: <FaEnvelope className="w-4 h-4" />, title: 'Email sent to PIC Utama', meta: 'Today · 10:15', note: 'Followed up proposal and requested feedback.' },
    { icon: <FaPhone className="w-4 h-4" />, title: 'Call with Account Manager', meta: 'Yesterday · 16:40', note: 'Discussed next steps and scheduling demo.' },
    { icon: <FaStickyNote className="w-4 h-4" />, title: 'Internal note added', meta: '2 days ago', note: 'Customer interested in bundle pricing.' },
  ]

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Recent Activity</div>
      </div>
      <div className="divide-y divide-neutral-100">
        {items.map((it, i) => (
          <Item key={i} {...it} />
        ))}
      </div>
    </Card>
  )
}
