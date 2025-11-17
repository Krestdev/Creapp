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
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import NavigationItem from "./navigation-item";
import { useStore } from "@/providers/datastore";

function AppSidebar() {
  // ...existing code...
  const navLinks = [
    {
      pageId: "PG-00",
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets",
      authorized: ["ADMIN", "MANAGER"],
      title: "Projets",
      items: [
        {
          pageId: "PG-00-01",
          authorized: ["ADMIN", "MANAGER"],
          title: "Creer un projet",
          href: "/tableau-de-bord/projets/create",
        },
        {
          pageId: "PG-00-02",
          authorized: ["ADMIN", "MANAGER"],
          title: "Liste des projets",
          href: "/tableau-de-bord/projets/liste",
        },
      ],
    },
    {
      icon: Clipboard,
      pageId: "PG-001",
      href: "/tableau-de-bord/taches",
      authorized: ["ADMIN", "MANAGER", "USER"],
      title: "Tâches",
    },
    {
      icon: ScrollText,
      pageId: "PG-02",
      href: "/tableau-de-bord/besoins",
      authorized: ["ADMIN", "MANAGER", "USER"],
      title: "Besoins",
      items: [
        {
          pageId: "PG-02-01",
          title: "Creer un besoin",
          href: "/tableau-de-bord/besoins/create",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
        {
          pageId: "PG-02-02",
          title: "Mes besoin",
          href: "/tableau-de-bord/besoins/mylist",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
        {
          pageId: "PG-02-03",
          title: "Approbation",
          href: "/tableau-de-bord/besoins/approbation",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
      ],
    },
    {
      pageId: "PG-03",
      icon: ClipboardList,
      href: "/tableau-de-bord/bdcommande",
      authorized: ["ADMIN", "MANAGER", "SALES"],
      title: "Bon de commande",
      items: [
        {
          pageId: "PG-03-01",
          title: "Demande de cotation",
          href: "/tableau-de-bord/bdcommande/cotation",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-02",
          title: "Devis",
          href: "/tableau-de-bord/bdcommande/devis",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-03",
          title: "Besoins",
          href: "/tableau-de-bord/bdcommande/besoins",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-04",
          title: "Validation",
          href: "/tableau-de-bord/bdcommande/validation",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-5",
          title: "Bons de commande",
          href: "/tableau-de-bord/bdcommande/commande",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-06",
          title: "Créer une cotation",
          href: "/tableau-de-bord/bdcommande/creercotation",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
        {
          pageId: "PG-03-07",
          title: "Nouveaux",
          href: "/tableau-de-bord/bdcommande/nouveaux",
          authorized: ["ADMIN", "MANAGER", "SALES"],
        },
      ],
    },
    {
      pageId: "PG-04",
      icon: Ticket,
      href: "/tableau-de-bord/ticket",
      authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
      title: "Tickets",
      items: [
        {
          pageId: "PG-04-01",
          title: "Validation",
          href: "/tableau-de-bord/ticket/validation",
          authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
        },
        {
          pageId: "PG-04-02",
          title: "Liste des tickets",
          href: "/tableau-de-bord/ticket/liste",
          authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
        },
        {
          pageId: "PG-04-03",
          title: "Créer un paiement",
          href: "/tableau-de-bord/ticket/nouveaux",
          authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
        },
        {
          pageId: "PG-04-04",
          title: "Paiements",
          href: "/tableau-de-bord/ticket/paiements",
          authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
        },
        {
          pageId: "PG-04-5",
          title: "Paiements reçus",
          href: "/tableau-de-bord/ticket/paiementrecus",
          authorized: ["ADMIN", "MANAGER", "SALES", "ACCOUNTING"],
        },
      ],
    },
    {
      pageId: "PG-05",
      icon: Bell,
      href: "/tableau-de-bord/notifications",
      authorized: ["ADMIN", "MANAGER", "USER"],
      title: "Notifications",
      badge: 4,
    },
    {
      pageId: "PG-06",
      icon: BookText,
      href: "/tableau-de-bord/missions",
      authorized: ["ADMIN", "MANAGER", "USER"],
      title: "Missions",
    },
    {
      pageId: "PG-07",
      icon: FolderOpen,
      href: "/tableau-de-bord/documents",
      authorized: ["ADMIN", "MANAGER", "USER"],
      title: "Documents",
    },
    {
      pageId: "PG-08",
      icon: UsersRound,
      href: "/tableau-de-bord/utilisateurs",
      authorized: ["ADMIN"],
      title: "Utilisateurs",
      items: [
        {
          pageId: "PG-08-01",
          title: "Creer un utilisateur",
          href: "/tableau-de-bord/utilisateurs/create",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-08-02",
          title: "Liste des utilisateurs",
          href: "/tableau-de-bord/utilisateurs/liste",
          authorized: ["ADMIN"],
        },
      ],
    },
    {
      pageId: "PG-09",
      icon: Building,
      href: "/tableau-de-bord/organisation",
      authorized: ["ADMIN"],
      title: "Organisation",
      items: [
        {
          pageId: "PG-09-01",
          title: "les Departements",
          href: "/tableau-de-bord/organisation/departements",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-09-02",
          title: "Creer un departement",
          href: "/tableau-de-bord/organisation/createdepartement",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-09-03",
          title: "les Services",
          href: "/tableau-de-bord/organisation/services",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-09-04",
          title: "Creer un service",
          href: "/tableau-de-bord/organisation/createservice",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-09-5",
          title: "gerer les postes",
          href: "/tableau-de-bord/organisation/postes",
          authorized: ["ADMIN"],
        },
      ],
    },
  ];

  const { user, logout } = useStore();
  const roles = user?.role.map((r) => r.label) || ["USER"];

  console.log(user);
  

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={"/tableau-de-bord"}>
          <img src={"/logo.svg"} className="h-8 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex flex-col gap-02">
        {navLinks.map((navLink) => {
          if (!navLink.authorized.some((role) => roles.includes(role))) {
            return null;
          }
          return <NavigationItem key={navLink.href} {...navLink} />;
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex flex-col gap-01">
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
              <DropdownMenuItem onClick={logout}>{"Déconnexion"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
