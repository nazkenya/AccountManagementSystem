// src/components/layout/Sidebar.jsx
import React, { useState } from 'react'
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
  FaFirefoxBrowser,
  FaUserTie,
} from 'react-icons/fa'
import { useAuth } from '../../auth/AuthContext'
import { ROLES } from '../../auth/roles'

/**
 * MENU definition:
 * - keep base (always visible)
 * - roleMenus keyed by ROLES.* for specific roles
 * - sharedGroups for menu blocks shared by multiple roles (manager/admin)
 */
const BASE_MENU = [{ to: '/', label: 'Beranda', icon: FaHome }]

const ROLE_MENUS = {
  [ROLES.admin]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
    { to: '/sales-funnel', label: 'Sales Funnel', icon: FaBullhorn },
    { to: '/produk', label: 'Produk & Solusi', icon: FaBoxOpen },
    { to: '/dokumen', label: 'Dokumen', icon: FaFileAlt },
    { to: '/monitoring', label: 'Monitoring Proses', icon: FaDesktop },
    { to: '/partnership', label: 'Partnership', icon: FaHandshake },
    { to: '/aktivitas', label: 'Aktivitas', icon: FaChartLine },
  ],
  [ROLES.sales]: [
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
    { to: '/sales-funnel', label: 'Sales Funnel', icon: FaBullhorn },
    { to: '/aktivitas', label: 'Aktivitas', icon: FaChartLine },
  ],
  [ROLES.viewer]: [{ to: '/customers', label: 'Pelanggan', icon: FaUsers }],
  [ROLES.staff]: [
    // staff minimal akses ecrm workspace + pelanggan (sesuaikan sesuai kebutuhan)
    { to: '/ecrm-workspace', label: 'ECRM Workspace', icon: FaUserTie },
    { to: '/customers', label: 'Pelanggan', icon: FaUsers },
  ],
}

// shared group menu (visible to either manager OR admin)
const SHARED_GROUPS = [
  {
    // use a unique id/label as key
    id: 'update-data',
    label: 'Update Data',
    icon: FaFirefoxBrowser,
    rolesAllowed: [ROLES.manager, ROLES.admin, ROLES.staff],
    subMenu: [
      { to: '/customers', label: 'Pelanggan', icon: FaUsers },
      { to: '/ecrm-workspace', label: 'Update AM', icon: FaChartLine },
      { to: '/profile/am', label: 'Profile AM', icon: FaUserTie },
      { to: '/produk', label: 'Produk & Solusi', icon: FaBoxOpen },
      { to: '/monitoring', label: 'Monitoring Proses', icon: FaDesktop },
    ],
  },
]

export default function Sidebar() {
  const { role, logout } = useAuth()
  const [openMenus, setOpenMenus] = useState({})

  // build items: base + role-specific + shared groups (if role allowed)
  const roleItems = role && ROLE_MENUS[role] ? ROLE_MENUS[role] : []
  const sharedItems = SHARED_GROUPS.filter((g) => g.rolesAllowed.includes(role))

  // flatten sharedGroups into items that the component expects (either subMenu item or top item)
  // we will put shared groups as items with `subMenu`
  const items = [
    ...BASE_MENU,
    // role-items (top-level simple links)
    ...roleItems,
    // insert shared groups (collapsible)
    ...sharedItems.map((g) => ({ label: g.label, icon: g.icon, subMenu: g.subMenu })),
  ]

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <nav className="fixed left-0 top-0 w-[260px] h-[100dvh] bg-[#0F162A] text-white/80 flex flex-col py-4 shrink-0 overflow-hidden z-40">
      {/* Brand Row */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center ring-1 ring-white/10 text-white font-semibold">
            M
          </div>
          <div className="leading-tight">
            <div className="text-white font-semibold">AMS</div>
            <div className="text-white/50 text-[11px]">Account Management System</div>
          </div>
        </div>
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
          // collapse menu (has subMenu)
          if (item.subMenu && Array.isArray(item.subMenu)) {
            const isOpen = !!openMenus[item.label]
            const ParentIcon = item.icon
            return (
              <li key={item.label} className="mx-3 my-1">
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isOpen ? 'bg-white/10 border border-white/10 text-white' : 'hover:bg-white/5 text-white/75 hover:text-white'
                  }`}
                >
                  <ParentIcon className="w-5 h-5 text-white/75 group-hover:text-white" />
                  <span className="text-[14px]">{item.label}</span>
                  <FaChevronDown className={`ml-auto w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'} text-white/60`} />
                </button>

                {/* submenu */}
                <ul className={`mt-1 ${isOpen ? 'block' : 'hidden'}`}>
                  {item.subMenu.map((sub) => {
                    const Icon = sub.icon
                    return (
                      <li key={sub.label} className="mx-2 my-1">
                        <NavLink
                          to={sub.to}
                          className={({ isActive }) =>
                            `group flex items-center gap-3 ml-6 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-white/10 border border-white/10 text-white'
                                : 'hover:bg-white/5 text-white/75 hover:text-white'
                            }`
                          }
                          end={sub.to === '/'}
                        >
                          <Icon className="w-4.5 h-4.5 text-white/75 group-hover:text-white" />
                          <span className="text-[13.5px]">{sub.label}</span>
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          }

          // default render (top-level single link)
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
