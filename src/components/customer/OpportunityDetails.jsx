import React from 'react'
import Card from '../ui/Card'

function Row({ label, value }) {
  return (
    <div className="py-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm md:text-base font-semibold text-neutral-900 mt-0.5">{value}</div>
    </div>
  )
}

export default function OpportunityDetails({ data }) {
  const d = data || {
    opportunityId: 'OP-001',
    industry: 'Technology/Software',
    closeDate: '2024-12-05',
    probability: '70%',
  }

  return (
    <Card>
      <div className="text-lg font-semibold text-neutral-900 mb-2">Opportunity Details</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Row label="Opportunity ID" value={d.opportunityId} />
        <Row label="Industry" value={d.industry} />
        <Row label="Close Date" value={d.closeDate} />
        <Row label="Probability of Closure" value={d.probability} />
      </div>
    </Card>
  )
}
