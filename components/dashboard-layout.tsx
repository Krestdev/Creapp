import React from 'react'
import { SidebarProvider, SidebarTrigger } from './ui/sidebar'
import AppSidebar from './app-sidebar'

function DashboardLayout({children}:{children: React.ReactNode}) {
  return (
    <SidebarProvider>
        <AppSidebar/>
        <main>
            <SidebarTrigger/>
            {children}
        </main>
    </SidebarProvider>
  )
}

export default DashboardLayout