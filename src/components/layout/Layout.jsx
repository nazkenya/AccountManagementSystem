import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import SidebarPortal from './SidebarPortal'
import FeedbackTab from '../FeedbackTab'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 text-neutral-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E60012]/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#2E3048]/5 to-transparent rounded-full blur-3xl"></div>
      
      <SidebarPortal>
        <Sidebar />
      </SidebarPortal>

      <div className="flex flex-col flex-1 overflow-hidden relative z-10 ml-[260px] pt-[70px]">
        <Header />
        <main className="p-5 md:p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <FeedbackTab />
    </div>
  )
}