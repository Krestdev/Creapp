import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from './ui/sidebar'
import Link from 'next/link'
import NavigationItem from './navigation-item'

function AppSidebar() {
  return (
    <Sidebar>
        <SidebarHeader>
            <Link href={"/tableau-de-bord"}><img src={"/logo.svg"} className='h-8 w-auto'/></Link>
        </SidebarHeader>
        <SidebarContent className='p-2 flex flex-col gap-2'>
            <NavigationItem href={"/tableau-de-bord"} title={"Tableau de bord"} />
            <NavigationItem href={"/projets"} title={"Projets"} />
            <NavigationItem href={"/taches"} title={"Tâches"} />
            <NavigationItem href={"/besoins"} title={"Besoins"} />
            <NavigationItem href={"/depenses"} title={"Dépenses"} />
            <NavigationItem href={"/notifications"} title={"Notifications"} badge={4} />
            <NavigationItem href={"/missions"} title={"Missions"} />
            <NavigationItem href={"/documents"} title={"Documents"} />
            <NavigationItem href={"/utilisateurs"} title={"Utilisateurs"} />
            <NavigationItem href={"/organisation"} title={"Organisation"} />
        </SidebarContent>
        <SidebarFooter/>
    </Sidebar>
  )
}

export default AppSidebar