import React from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from './ui/sidebar'
import Link from 'next/link'
import NavigationItem from './navigation-item'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { EllipsisVertical } from 'lucide-react'

function AppSidebar() {
  return (
    <Sidebar>
        <SidebarHeader>
            <Link href={"/tableau-de-bord"}><img src={"/logo.svg"} className='h-8 w-auto'/></Link>
        </SidebarHeader>
        <SidebarContent className='p-2 flex flex-col gap-2'>
            <NavigationItem href={"/tableau-de-bord/projets"} title={"Projets"} />
            <NavigationItem href={"/tableau-de-bord/taches"} title={"Tâches"} />
            <NavigationItem href={"/tableau-de-bord/besoins"} title={"Besoins"} />
            <NavigationItem href={"/tableau-de-bord/depenses"} title={"Dépenses"} />
            <NavigationItem href={"/tableau-de-bord/fournisseurs"} title={"Fournisseurs"} />
            <NavigationItem href={"/tableau-de-bord/notifications"} title={"Notifications"} badge={4} />
            <NavigationItem href={"/tableau-de-bord/missions"} title={"Missions"} />
            <NavigationItem href={"/tableau-de-bord/documents"} title={"Documents"} />
            <NavigationItem href={"/tableau-de-bord/utilisateurs"} title={"Utilisateurs"} />
            <NavigationItem href={"/tableau-de-bord/organisation"} title={"Organisation"} />
        </SidebarContent>
        <SidebarFooter>
          <div className='flex items-center gap-2 justify-between'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-500'>{"Employé"}</span>
              <span className='text-sm font-medium text-gray-900'>{"St. Charles"}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                  <EllipsisVertical size={16}/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  {"Déconnexion"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar