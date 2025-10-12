import React from 'react'
import {
  FaUsers,
  FaChartLine,
  FaFileInvoiceDollar,
  FaBell,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa'
import Card from '../components/ui/Card'
import StatsCard from '../components/ui/StatsCard'
import PageHeader from '../components/ui/PageHeader'

export default function Dashboard() {
  const stats = [
    { label: 'Total Pelanggan', value: '1,247', icon: FaUsers, trend: '+12%', trendUp: true },
    { label: 'Revenue Bulan Ini', value: 'Rp 45.2M', icon: FaChartLine, trend: '+8.3%', trendUp: true },
    { label: 'Collection Rate', value: '94.5%', icon: FaFileInvoiceDollar, trend: '-2.1%', trendUp: false },
    { label: 'Active Campaigns', value: '23', icon: FaBell, trend: '+5', trendUp: true },
  ]

  const recentActivities = [
    { title: 'New customer registered', time: '2 minutes ago', type: 'success' },
    { title: 'Revenue milestone reached', time: '1 hour ago', type: 'info' },
    { title: 'Collection reminder sent', time: '3 hours ago', type: 'warning' },
    { title: 'Report generated', time: '5 hours ago', type: 'neutral' },
  ]

  const topPerformers = [
    { name: 'Ahmad Wijaya', region: 'Jakarta', score: 98 },
    { name: 'Siti Nurhaliza', region: 'Bandung', score: 95 },
    { name: 'Budi Santoso', region: 'Surabaya', score: 92 },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        variant="hero"
        title="Selamat Datang di MyTEnS GoBeyond"
        subtitle="Dashboard untuk mengelola pelanggan dan performa bisnis Anda"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <StatsCard {...stat}>
              <div className="flex items-center gap-2 text-xs mt-2">
                <span className={`flex items-center gap-1 font-semibold ${stat.trendUp ? 'text-[#2ECC71]' : 'text-[#E74C3C]'}`}>
                  {stat.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                  {stat.trend}
                </span>
                <span className="text-neutral-400">vs last month</span>
              </div>
            </StatsCard>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-800">Aktivitas Terbaru</h2>
              <FaBell className="text-[#E60012]" />
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 group"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success'
                        ? 'bg-[#2ECC71]'
                        : activity.type === 'info'
                        ? 'bg-[#3498DB]'
                        : activity.type === 'warning'
                        ? 'bg-[#F1C40F]'
                        : 'bg-neutral-300'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800 group-hover:text-[#E60012] transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        <div>
          <Card className="h-full bg-gradient-to-br from-white to-neutral-50">
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="text-[#F1C40F] text-xl" />
              <h2 className="text-lg font-semibold text-neutral-800">Top Performers</h2>
            </div>
            <div className="space-y-3">
              {topPerformers.map((performer, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#E60012]/20 to-[#E60012]/5 text-[#E60012] font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800">{performer.name}</p>
                    <p className="text-xs text-neutral-500">{performer.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#E60012]">{performer.score}</p>
                    <p className="text-xs text-neutral-400">score</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
  <Card className="bg-gradient-to-br from-white to-[#EDE9FE]/40">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Customer', icon: '👥' },
            { label: 'Generate Report', icon: '📊' },
            { label: 'Send Campaign', icon: '📧' },
            { label: 'View Analytics', icon: '📈' },
          ].map((action, idx) => (
            <button
              key={idx}
              className="group p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-white border-2 border-[#EDE9FE]/60 hover:border-[#7C3AED]/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className="text-sm font-medium text-neutral-700 group-hover:text-[#7C3AED] transition-colors">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}