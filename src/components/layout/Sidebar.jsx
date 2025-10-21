import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  FaHome,
  FaChartLine,
  FaUsers,
  FaBoxOpen,
  FaBullhorn,
  FaFileAlt,
  FaDesktop,
  FaHandshake,
  FaChevronDown,
  FaSearch,
  FaPlus,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa'
import { useAuth } from '../../auth/AuthContext'
import { ROLES } from '../../auth/roles'

// Define per-role menus. Add items for your new role here.
const MENU = {
  base: [{ to: '/', label: 'Beranda', icon: FaHome }],
  [ROLES.admin]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
    { to: '/sales-funnel', label: 'Sales Funnel', icon: FaBullhorn },
    { to: '/produk', label: 'Produk & Solusi', icon: FaBoxOpen },
    { to: '/dokumen', label: 'Dokumen', icon: FaFileAlt },
    { to: '/monitoring', label: 'Monitoring Proses', icon: FaDesktop },
    { to: '/partnership', label: 'Partnership', icon: FaHandshake },
    { to: '/aktivitas', label: 'Aktivitas', icon: FaChartLine },
    { to: '/ecrm-workspace', label: 'ECRM Workspace', icon: FaChartLine },
  ],
  [ROLES.sales]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
    { to: '/sales-funnel', label: 'Sales Funnel', icon: FaBullhorn },
    { to: '/aktivitas', label: 'Aktivitas', icon: FaChartLine },
  ],
  [ROLES.viewer]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
  ],
  [ROLES.manager]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
    { to: '/produk', label: 'Produk & Solusi', icon: FaBoxOpen },
    { to: '/monitoring', label: 'Monitoring Proses', icon: FaDesktop },
    { to: '/manager/account-managers', label: 'Account Managers', icon: FaUsers },
  ],
}

export default function Sidebar() {
  const { role, logout } = useAuth()
  const roleItems = MENU[role] || []
  const items = [...MENU.base, ...roleItems]

  return (
  <nav className="fixed left-0 top-0 w-[260px] h-[100dvh] bg-[#0F162A] text-white/80 flex flex-col py-4 shrink-0 overflow-hidden z-40">
      {/* Brand Row */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10 text-white font-semibold">
            M
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold">MyTEnS</div>
            <div className="text-white/50 text-[11px]">GoBeyond</div>
          </div>
        </div>
        <FaChevronDown className="text-white/50" />
      </div>
      <div className="h-px bg-white/10 mx-4" />

      {/* Section heading with actions */}
      <div className="px-4 py-2 mt-2 flex items-center justify-between">
        <span className="text-xs tracking-wide text-white/60">Main</span>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-md hover:bg-white/5" title="Search"><FaSearch className="w-3.5 h-3.5 text-white/60" /></button>
          <button className="p-1.5 rounded-md hover:bg-white/5" title="Add"><FaPlus className="w-3.5 h-3.5 text-white/60" /></button>
        </div>
      </div>

      {/* Navigation */}
      <ul className="flex-1 mt-1">
        {items.map((item) => {
          const Icon = item.icon
          const showBadge = item.label === 'Aktivitas'
          return (
            <li key={item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group mx-3 my-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-white/10 border border-white/10 text-white'
                      : 'hover:bg-white/5 text-white/75 hover:text-white'
                  }`
                }
                end={item.to === '/'}
              >
                <Icon className="w-5 h-5 text-white/75 group-hover:text-white" />
                <span className="text-[14px]">{item.label}</span>
                {showBadge && (
                  <span className="ml-auto inline-flex items-center justify-center text-[11px] w-5 h-5 rounded-full bg-[#E74C3C] text-white">1</span>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>

      {/* Bottom actions */}
      <div className="mt-2 pt-3 border-t border-white/10">
        <div className="px-3 space-y-1">
          <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 text-white/75 hover:text-white">
            <FaQuestionCircle className="w-5 h-5" />
            <span>Help and Support</span>
          </button>
          <button type="button" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 text-white/75 hover:text-white">
            <FaCog className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button type="button" onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 text-white/75 hover:text-white">
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}