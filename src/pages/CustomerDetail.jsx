import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import detailsById from '../data/mockCustomerDetails'
import customers from '../data/mockCustomers'
import ProfileHeader from '../components/customer/ProfileHeader'
import CustomerInfoCard from '../components/customer/CustomerInfoCard'
import RightSidebar from '../components/customer/RightSidebar'
import ActivityTimeline from '../components/customer/ActivityTimeline'
import { Tabs } from '../components/ui/Tabs'
import AISummaryCard from '../components/customer/AISummaryCard'
// import OpportunityDetails from '../components/customer/OpportunityDetails'
// import TasksList from '../components/customer/TasksList'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const base = customers.find((c) => c.id === id) || customers[0]
  const details = detailsById[id] || detailsById.default
  const [tab, setTab] = React.useState('overview')

  return (
    <div className="space-y-6 animate-fade-in">
      <ProfileHeader
        name={base.name}
        code={base.code}
        tag={base.tag}
        nipnas={details.nipnas}
        onBack={() => navigate('/customers')}
      />

  <div className="flex flex-col lg:flex-row gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-4">
          <CustomerInfoCard details={details} />
          <AISummaryCard customerName={base.name} />
          <div className="bg-white rounded-xl shadow-card">
            <Tabs
              tabs={[
                { key: 'overview', label: 'Overview' },
                { key: 'activity', label: 'Activity' },
              ]}
              activeKey={tab}
              onChange={setTab}
              color="blue"
            />
            <div className="p-4">
              {tab === 'overview' && (
                <div className="text-sm text-neutral-600">No overview widgets yet.</div>
              )}
              {tab === 'activity' && <ActivityTimeline />}
            </div>
          </div>
        </div>

        {/* Right sidebar (fixed drawer) */}
        <RightSidebar contacts={details.contacts} />
      </div>
    </div>
  )
}
