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
  Truck,
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
import useAuthGuard from "@/hooks/useAuthGuard";
import React from "react";
import { RequestQueries } from "@/queries/requestModule";
import { useQuery } from "@tanstack/react-query";
import { DepartmentQueries } from "@/queries/departmentModule";
import { RequestModelT } from "@/types/types";

type ItemSide = {
  pageId: string;
  href: string;
  authorized: string[];
  title: string;
  badge?: number;
};
type Sidebar = {
  pageId: string;
  icon: any;
  href: string;
  authorized: string[];
  title: string;
  items?: ItemSide[];
};

function AppSidebar() {
  const { user, logout, isHydrated } = useStore();
  const [data, setData] = React.useState<RequestModelT[]>([]);

  const request = new RequestQueries();
  const department = new DepartmentQueries();

  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      return department.getAll();
    },
  });
  // Récupérer tous les besoins en attente de validation (pour les validateurs)
  const requestData = useQuery({
    queryKey: ["requests-validation"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  // Utilisation du hook pour la protection globale
  const { hasAccess, isChecking, userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
  });

  const isLastValidator =
    departmentData.data?.data
      .flatMap((mem) => mem.members)
      .find((mem) => mem.userId === user?.id)?.finalValidator === true;

  React.useEffect(() => {
    if (requestData.data?.data && user) {
      const show = requestData.data?.data
        .filter((x) => x.state === "pending")
        .filter((item) => {
          // Récupérer la liste des IDs des validateurs pour ce departement
          const validatorIds = departmentData.data?.data
            .flatMap((x) => x.members)
            .filter((x) => x.validator === true)
            .map((x) => x.userId);

          if (isLastValidator) {
            return validatorIds?.every((id) =>
              item.revieweeList?.flatMap((x) => x.validatorId).includes(id)
            );
          } else {
            return (
              !item.revieweeList
                ?.flatMap((x) => x.validatorId)
                .includes(user?.id ?? -1) && item.state === "pending"
            );
          }
        });
      setData(show);
    }
  }, [
    requestData.data?.data,
    user,
    isLastValidator,
    departmentData.data?.data,
  ]);

  // Si en cours de vérification, afficher un loader
  if (isChecking) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-100 animate-pulse rounded"
            ></div>
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }

  // Si pas d'accès, ne pas afficher la sidebar
  if (!hasAccess) {
    return null;
  }

  const navLinks: Sidebar[] = [
    {
      pageId: "PG-00",
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets",
      authorized: ["ADMIN"],
      title: "Projets",
      items: [
        {
          pageId: "PG-00-01",
          authorized: ["ADMIN"],
          title: "Creer un projet",
          href: "/tableau-de-bord/projets/create",
        },
        {
          pageId: "PG-00-02",
          authorized: ["ADMIN"],
          title: "Liste des projets",
          href: "/tableau-de-bord/projets/liste",
        },
      ],
    },
    // {
    //   icon: Clipboard,
    //   pageId: "PG-001",
    //   href: "/tableau-de-bord/taches",
    //   authorized: ["ADMIN"],
    //   title: "Tâches",
    // },
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
          title: "Mes besoins",
          href: "/tableau-de-bord/besoins/mylist",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
        {
          pageId: "PG-02-03",
          title: "Approbation",
          href: "/tableau-de-bord/besoins/approbation",
          authorized: ["ADMIN", "MANAGER"],
          badge: data?.length > 0 ? data?.length : undefined,
        },
      ],
    },
    {
      pageId: "PG-03",
      icon: ClipboardList,
      href: "/tableau-de-bord/bdcommande",
      authorized: ["ADMIN", "SALES"],
      title: "Commande",
      items: [
        {
          pageId: "PG-03-01",
          title: "Demande de cotation",
          href: "/tableau-de-bord/bdcommande/cotation",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-02",
          title: "Devis",
          href: "/tableau-de-bord/bdcommande/devis",
          authorized: ["ADMIN", "SALES"],
        },
        // {
        //   pageId: "PG-03-03",
        //   title: "Besoins",
        //   href: "/tableau-de-bord/bdcommande/besoins",
        //   authorized: ["ADMIN", "SALES"],
        // },
        {
          pageId: "PG-03-5",
          title: "Bons de commande",
          href: "/tableau-de-bord/bdcommande/commande",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-04",
          title: "Validation",
          href: "/tableau-de-bord/bdcommande/validation",
          authorized: ["ADMIN"],
        },
        // {
        //   pageId: "PG-03-06",
        //   title: "Créer une cotation",
        //   href: "/tableau-de-bord/bdcommande/creercotation",
        //   authorized: ["ADMIN", "SALES"],
        // },
        {
          pageId: "PG-03-07",
          title: "Nouveaux",
          href: "/tableau-de-bord/bdcommande/nouveaux",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-03-06",
          title: "Paiements",
          href: "/tableau-de-bord/bdcommande/paiements",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-07",
          title: "Receptions",
          href: "/tableau-de-bord/bdcommande/receptions",
          authorized: ["ADMIN", "SALES"],
        },
      ],
    },
    {
      pageId: "PG-04",
      icon: Ticket,
      href: "/tableau-de-bord/ticket",
      authorized: ["ADMIN", "ACCOUNTING"],
      title: "Tickets",
      // items: [
      //   {
      //     pageId: "PG-04-01",
      //     title: "Validation",
      //     href: "/tableau-de-bord/ticket/validation",
      //     authorized: ["ADMIN", "SALES", "ACCOUNTING"],
      //   },
      //   {
      //     pageId: "PG-04-02",
      //     title: "Liste des tickets",
      //     href: "/tableau-de-bord/ticket/liste",
      //     authorized: ["ADMIN", "SALES", "ACCOUNTING"],
      //   },
      //   {
      //     pageId: "PG-04-03",
      //     title: "Créer un paiement",
      //     href: "/tableau-de-bord/ticket/nouveaux",
      //     authorized: ["ADMIN", "SALES", "ACCOUNTING"],
      //   },
      //   {
      //     pageId: "PG-04-04",
      //     title: "Paiements",
      //     href: "/tableau-de-bord/ticket/paiements",
      //     authorized: ["ADMIN", "SALES", "ACCOUNTING"],
      //   },
      //   {
      //     pageId: "PG-04-5",
      //     title: "Paiements reçus",
      //     href: "/tableau-de-bord/ticket/paiementrecus",
      //     authorized: ["ADMIN", "SALES", "ACCOUNTING"],
      //   },
      // ],
    },
    // {
    //   pageId: "PG-05",
    //   icon: Bell,
    //   href: "/tableau-de-bord/notifications",
    //   authorized: ["ADMIN"],
    //   title: "Notifications",
    // },
    // {
    //   pageId: "PG-06",
    //   icon: BookText,
    //   href: "/tableau-de-bord/missions",
    //   authorized: ["ADMIN"],
    //   title: "Missions",
    // },
    // {
    //   pageId: "PG-07",
    //   icon: FolderOpen,
    //   href: "/tableau-de-bord/documents",
    //   authorized: ["ADMIN"],
    //   title: "Documents",
    // },
    {
      pageId: "PG-08",
      icon: UsersRound,
      href: "/tableau-de-bord/utilisateurs",
      authorized: ["ADMIN"],
      title: "Utilisateurs",
      items: [
        {
          pageId: "PG-08-02",
          title: "Liste",
          href: "/tableau-de-bord/utilisateurs/liste",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-09-5",
          title: "Rôles",
          href: "/tableau-de-bord/utilisateurs/roles",
          authorized: ["ADMIN"],
        },
      ],
    },
    {
      pageId: "PG-08",
      icon: Truck,
      href: "/tableau-de-bord/provider",
      authorized: ["ADMIN"],
      title: "Fournisseurs",
      items: [
        {
          pageId: "PG-08-01",
          title: "Creer un fournisseur",
          href: "/tableau-de-bord/provider/create",
          authorized: ["ADMIN"],
        },
        {
          pageId: "PG-08-02",
          title: "Liste des fournisseurs",
          href: "/tableau-de-bord/provider/liste",
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
          title: "Departements",
          href: "/tableau-de-bord/organisation/departements",
          authorized: ["ADMIN"],
        },
        // {
        //   pageId: "PG-09-02",
        //   title: "Creer un departement",
        //   href: "/tableau-de-bord/organisation/createdepartement",
        //   authorized: ["ADMIN"],
        // },
        {
          pageId: "PG-09-03",
          title: "Catégories",
          href: "/tableau-de-bord/organisation/categories",
          authorized: ["ADMIN"],
        },
        // {
        //   pageId: "PG-09-04",
        //   title: "Creer un categorie",
        //   href: "/tableau-de-bord/organisation/createcategorie",
        //   authorized: ["ADMIN"],
        // },
      ],
    },
  ];

  // Filtrer les liens de navigation selon les rôles de l'utilisateur
  const filteredNavLinks = navLinks.filter((navLink) =>
    navLink.authorized.some((role) => userRoles.includes(role))
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href={"/tableau-de-bord"}>
          <img src={"/logo.svg"} alt="Logo" className="h-8 w-auto" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2 flex flex-col gap-02">
        {filteredNavLinks.map((navLink) => (
          <NavigationItem key={navLink.href} {...navLink} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 justify-between">
          <div className="flex flex-col gap-01">
            <span className="text-xs text-gray-500">{"Employé"}</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.name || "Utilisateur"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <EllipsisVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={logout}>
                {"Déconnexion"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
