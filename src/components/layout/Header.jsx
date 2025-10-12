import React, { useState } from 'react'
import { FaBell } from 'react-icons/fa'
import { useAuth } from '../../auth/AuthContext'

export default function Header() {
  const { user, role } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="fixed left-[260px] right-0 top-0 h-[70px] bg-white/90 border-b border-neutral-200 flex items-center justify-end px-6 shadow-sm backdrop-blur-sm z-40">
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 group"
            aria-label="Notifications"
          >
            <FaBell className="text-neutral-600 text-lg group-hover:text-[#7C3AED] transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EC4899] rounded-full ring-2 ring-white animate-pulse"></span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#2E3048] font-semibold text-sm ring-1 ring-neutral-200 shadow-sm">
            {user?.name?.charAt(0) || 'G'}
          </div>
          <div className="text-sm">
            <div className="font-semibold text-neutral-800">{user?.name || 'Guest'}</div>
            {role && (
              <div className="text-xs text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]"></span>
                {role}
              </div>
            )}
          </div>
          {/* Logout removed from header; now located in the sidebar */}
        </div>
      </div>
    </header>
  )
}