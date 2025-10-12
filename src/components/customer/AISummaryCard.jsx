import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { FaRobot } from 'react-icons/fa'

export default function AISummaryCard({ customerName }) {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F6FF] text-[#2C5CC5] ring-1 ring-[#CFE0FF] mb-2">
            <FaRobot className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </div>
          <div className="text-sm text-neutral-700 leading-relaxed">
            {customerName ? (
              <>
                <span className="font-medium text-neutral-900">{customerName}</span> shows stable engagement across core services. Key contacts are responsive and there are potential upsell angles in connectivity and managed services. Consider completing the account profile to unlock tailored recommendations.
              </>
            ) : (
              'AI-generated overview of this customer. Complete the account profile to unlock more tailored insights.'
            )}
          </div>
        </div>
        <div className="shrink-0">
          <Button variant="secondary" onClick={() => navigate(`/customers/${id}/account-profile`)}>
            Complete Account Profile
          </Button>
        </div>
      </div>
    </Card>
  )
}
