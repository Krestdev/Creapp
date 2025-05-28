import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from './ui/sidebar'
import Link from 'next/link'

function AppSidebar() {
  return (
    <Sidebar>
        <SidebarHeader>
            <Link href={"/tableau-de-bord"}><img src={"/logo.svg"} className='h-8 w-auto'/></Link>
        </SidebarHeader>
        <SidebarContent className='p-2 flex flex-col gap-2'>
            
        </SidebarContent>
        <SidebarFooter/>
    </Sidebar>
  )
}

export default AppSidebar