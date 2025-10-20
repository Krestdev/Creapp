import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import Link from "next/link";
import NavigationItem from "./navigation-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Bell,
  BookText,
  BriefcaseBusiness,
  Building,
  Clipboard,
  ClipboardList,
  EllipsisVertical,
  FolderOpen,
  ScrollText,
  UsersRound,
} from "lucide-react";

function AppSidebar() {
  // ...existing code...
  const navLinks = [
    {
      Icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets",
      title: "Projets",
    },
    {
      Icon: Clipboard,
      href: "/tableau-de-bord/taches",
      title: "Tâches",
    },
    {
      Icon: ScrollText,
      href: "/tableau-de-bord/besoins",
      title: "Besoins",
    },
    {
      Icon: ClipboardList,
      href: "/tableau-de-bord/depenses",
      title: "Dépenses",
    },
    {
      Icon: Bell,
      href: "/tableau-de-bord/notifications",
      title: "Notifications",
      badge: 4,
    },
    {
      Icon: BookText,
      href: "/tableau-de-bord/missions",
      title: "Missions",
    },
    {
      Icon: FolderOpen,
      href: "/tableau-de-bord/documents",
      title: "Documents",
    },
    {
      Icon: UsersRound,
      href: "/tableau-de-bord/utilisateurs",
      title: "Utilisateurs",
    },
    {
      Icon: Building,
      href: "/tableau-de-bord/organisation",
      title: "Organisation",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={"/tableau-de-bord"}>
          <img src={"/logo.svg"} className="h-8 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex flex-col gap-2">
        {navLinks.map((navLink) => {
          return <NavigationItem {...navLink} />;
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">{"Employé"}</span>
            <span className="text-sm font-medium text-gray-900">
              {"St. Charles"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <EllipsisVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{"Déconnexion"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
