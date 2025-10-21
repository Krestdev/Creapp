import React, { useState } from "react";
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
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets",
      title: "Projets",
    },
    {
      icon: Clipboard,
      href: "/tableau-de-bord/taches",
      title: "Tâches",
    },
    {
      icon: ScrollText,
      href: "/tableau-de-bord/besoins",
      title: "Besoins",
      items: [
        { title: "Creer un besoin", href: "/tableau-de-bord/besoins/create" },
        { title: "Mes besoin", href: "/tableau-de-bord/besoins/mylist" },
        { title: "Approbation", href: "/tableau-de-bord/besoins/approbation" },
      ],
    },
    {
      icon: ClipboardList,
      href: "/tableau-de-bord/bdcommande",
      title: "Bon de commande",
      items: [
        {
          title: "Demande de cotation",
          href: "/tableau-de-bordbdcommande/cotation",
        },
        { title: "Devis", href: "/tableau-de-bordbdcommande/devis" },
        { title: "Besoins", href: "/tableau-de-bordbdcommande/besoins" },
        { title: "Validation", href: "/tableau-de-bordbdcommande/validation" },
        {
          title: "Bons de commande",
          href: "/tableau-de-bordbdcommande/commande",
        },
      ],
    },
    {
      icon: Bell,
      href: "/tableau-de-bord/notifications",
      title: "Notifications",
      badge: 4,
    },
    {
      icon: BookText,
      href: "/tableau-de-bord/missions",
      title: "Missions",
    },
    {
      icon: FolderOpen,
      href: "/tableau-de-bord/documents",
      title: "Documents",
    },
    {
      icon: UsersRound,
      href: "/tableau-de-bord/utilisateurs",
      title: "Utilisateurs",
    },
    {
      icon: Building,
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
          return <NavigationItem key={navLink.href} {...navLink} />;
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
