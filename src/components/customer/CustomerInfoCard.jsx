import React from 'react'
import Card from '../ui/Card'

function Row({ label, value }) {
  return (
    <div className="py-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm md:text-base font-semibold text-neutral-900 mt-0.5 whitespace-pre-wrap break-words">{value}</div>
    </div>
  )
}

export default function CustomerInfoCard({ details }) {
  return (
    <Card className="p-5 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6">
        <div>
          <Row label="BUD" value={details.bud} />
          <Row label="Segmen" value={details.segmen} />
          <Row label="Sub Segmen" value={details.subSegmen} />
        </div>
        <div>
          <Row label="Witel" value={details.witel} />
          <Row label="Telkom Daerah" value={details.telkomDaerah} />
          <Row label="Alamat" value={details.alamat} />
        </div>
        <div>
          <Row label="Dokumen" value={details.dokumen} />
        </div>
      </div>
    </Card>
  )
}
