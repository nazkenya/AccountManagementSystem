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
import RelationshipPlan from '../components/accountPlan/RelationshipPlan'
import SalesPlan from '../components/accountPlan/SalesPlan'
// import OpportunityDetails from '../components/customer/OpportunityDetails'
// import TasksList from '../components/customer/TasksList'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const base = customers.find((c) => c.id === id) || customers[0]
  const details = detailsById[id] || detailsById.default
  // Top-level tabs: Account Plan | Visiting (as per reference HTML)
  const [tab, setTab] = React.useState('account-plan')
  // Account Plan subtabs: Relationship Plan | Sales Plan
  const [subtab, setSubtab] = React.useState('relationship')

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
                { key: 'account-plan', label: 'Account Plan' },
                { key: 'visiting', label: 'Visiting' },
              ]}
              activeKey={tab}
              onChange={(k) => {
                setTab(k)
                // default subtab when entering Account Plan
                if (k === 'account-plan') setSubtab((s) => s || 'relationship')
              }}
              color="blue"
            />
            <div className="p-4">
              {tab === 'account-plan' && (
                <div className="space-y-4">
                  {/* Sub tabs for Account Plan */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg">
                    <Tabs
                      tabs={[
                        { key: 'relationship', label: 'Relationship Plan' },
                        { key: 'sales', label: 'Sales Plan' },
                      ]}
                      activeKey={subtab}
                      onChange={setSubtab}
                      color="blue"
                    />
                    <div className="p-4">
                      {subtab === 'relationship' && (
                        <RelationshipPlan customerId={details.nipnas || base.code || id} contacts={details.contacts || []} />
                      )}
                      {subtab === 'sales' && (
                        <SalesPlan customerId={details.nipnas || base.code || id} />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'visiting' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900">Visiting</h3>
                      <p className="text-xs text-neutral-500">Jadwal activity kunjungan dan rapat akun ini.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 hover:bg-neutral-50">Export ICS</button>
                      <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Add Activity</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Calendar placeholder */}
                    <div className="lg:col-span-1 border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold">Oktober</div>
                          <div className="text-xs text-neutral-500 -mt-0.5">2025</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-md border border-neutral-300 hover:bg-neutral-50">‹</button>
                          <button className="w-8 h-8 rounded-md border border-neutral-300 hover:bg-neutral-50">›</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-[11px] text-neutral-500 mb-1">
                        {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map((d)=> (
                          <div key={d} className="text-center py-1 font-semibold">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => (
                          <div key={i} className="h-14 border border-dashed border-neutral-200 rounded-md p-1 text-[11px] text-neutral-700">
                            <div className="font-semibold">{i+1 <= 31 ? i+1 : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Visit list placeholder */}
                    <div className="lg:col-span-2">
                      <div className="border border-neutral-200 rounded-lg p-4">
                        <div className="text-sm text-neutral-600">Tidak ada activity untuk ditampilkan.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar (fixed drawer) */}
        <RightSidebar contacts={details.contacts} />
      </div>
    </div>
  )
}
