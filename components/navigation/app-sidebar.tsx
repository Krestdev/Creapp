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
  Ticket,
  UsersRound,
} from "lucide-react";
import { title } from "process";

function AppSidebar() {
  // ...existing code...
  const navLinks = [
    {
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets",
      title: "Projets",
      items: [
        {
          title: "Creer un projet",
          href: "/tableau-de-bord/projets/create",
        },
        {
          title: "Liste des projets",
          href: "/tableau-de-bord/projets/liste",
        },
      ],
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
          href: "/tableau-de-bord/bdcommande/cotation",
        },
        { title: "Devis", href: "/tableau-de-bord/bdcommande/devis" },
        { title: "Besoins", href: "/tableau-de-bord/bdcommande/besoins" },
        { title: "Validation", href: "/tableau-de-bord/bdcommande/validation" },
        {
          title: "Bons de commande",
          href: "/tableau-de-bord/bdcommande/commande",
        },
        {
          title: "Créer une cotation",
          href: "/tableau-de-bord/bdcommande/creercotation",
        },
        {
          title: "Nouveaux",
          href: "/tableau-de-bord/bdcommande/nouveaux",
        },
      ],
    },
    {
      icon: Ticket,
      href: "/tableau-de-bord/ticket",
      title: "Tickets",
      items: [
        { title: "Validation", href: "/tableau-de-bord/ticket/validation" },
        {
          title: "Liste des tickets",
          href: "/tableau-de-bord/ticket/liste",
        },
        {
          title: "Créer un paiement",
          href: "/tableau-de-bord/ticket/nouveaux",
        },
        { title: "Paiements", href: "/tableau-de-bord/ticket/paiements" },
        {
          title: "Paiements reçus",
          href: "/tableau-de-bord/ticket/paiementrecus",
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
      items: [
        {
          title: "Creer un utilisateur",
          href: "/tableau-de-bord/utilisateurs/create",
        },
        {
          title: "Liste des utilisateurs",
          href: "/tableau-de-bord/utilisateurs/liste",
        },
      ],
    },
    {
      icon: Building,
      href: "/tableau-de-bord/organisation",
      title: "Organisation",
      items: [
        {
          title: "les Departements",
          href: "/tableau-de-bord/organisation/departements",
        },
        {
          title: "Creer un departement",
          href: "/tableau-de-bord/organisation/createdepartement",
        },
        {
          title: "les Services",
          href: "/tableau-de-bord/organisation/services",
        },
        {
          title: "Creer un service",
          href: "/tableau-de-bord/organisation/createservice",
        },
        {
          title: "gerer les postes",
          href: "/tableau-de-bord/organisation/postes",
        },
      ],
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
