import useAuthGuard from "@/hooks/useAuthGuard";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { RequestQueries } from "@/queries/requestModule";
import { Category, RequestModelT, User } from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  ClipboardList,
  EllipsisVertical,
  ScrollText,
  Ticket,
  Truck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import React from "react";
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

  const request = new RequestQueries();
  const category = new CategoryQueries();
  const userQueries = new UserQueries();

  // Récupérer toutes les catégories avec leurs validateurs
  const categoriesData = useQuery({
    queryKey: ["categories-with-validators"],
    queryFn: async () => {
      return category.getCategories();
    },
    enabled: isHydrated,
  });

  // Récupérer tous les utilisateurs
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return userQueries.getAll();
    },
    enabled: isHydrated,
  });

  // Récupérer tous les besoins
  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return request.getAll();
    },
    enabled: isHydrated,
  });

  const useHasUserAlreadyValidated = (
    categoryData: UseQueryResult<{ data: Category[] }, Error>
  ) => {
    return React.useCallback(
      (request: RequestModelT, userId: number) => {
        const categories = categoryData.data?.data;
        if (!categories || !request.categoryId) return false;

        const validatorId = categories
          .find((c) => c.id === request.categoryId)
          ?.validators.find((v) => v.userId === userId)?.id;

        if (!validatorId) return false;

        return (
          request.revieweeList?.some((r) => r.validatorId === validatorId) ??
          false
        );
      },
      [categoryData.data?.data]
    );
  };

  const usePendingData = (
    filteredData: RequestModelT[],
    user: User,
    categoryData: UseQueryResult<{ data: Category[] }, Error>
  ) => {
    const hasUserAlreadyValidated = useHasUserAlreadyValidated(categoryData);

    return React.useMemo(() => {
      const categories = categoryData.data?.data;
      if (!categories) return [];

      return filteredData.filter((item) => {
        // 1️⃣ Seulement les besoins en attente
        if (item.state !== "pending") return false;

        const category = categories.find((c) => c.id === item.categoryId);
        if (!category || !category.validators?.length) return false;

        // 2️⃣ Vérifier que l'utilisateur est validateur
        const currentValidator = category.validators.find(
          (v) => v.userId === user?.id
        );
        if (!currentValidator) return false;

        // 3️⃣ S'il a déjà validé → ne plus afficher
        if (hasUserAlreadyValidated(item, user?.id!)) return false;

        // 4️⃣ Trouver les validateurs précédents (rank inférieur)
        const previousValidators = category.validators.filter(
          (v) => v.rank < currentValidator.rank
        );

        // 5️⃣ Aucun validateur avant lui → OK (rank 1)
        if (previousValidators.length === 0) return true;

        // 6️⃣ IDs des validateurs précédents
        const previousValidatorIds = previousValidators.map((v) => v.id);

        // 7️⃣ Vérifier qu'ils ont TOUS validé
        const validatedIds = item.revieweeList?.map((r) => r.validatorId) ?? [];

        const allPreviousValidated = previousValidatorIds.every((id) =>
          validatedIds.includes(id!)
        );

        return allPreviousValidated;
      });
    }, [
      filteredData,
      user?.id,
      categoryData.data?.data,
      hasUserAlreadyValidated,
    ]);
  };

  const useFilteredRequests = (
    requestData: UseQueryResult<{ data: RequestModelT[] }, Error>
  ) => {
    return React.useMemo(() => {
      const data = requestData.data?.data ?? [];
      const start = new Date(0);
      const end = new Date();

      return data.filter((item) => {
        const d = new Date(item.createdAt);
        return d >= start && d <= end;
      });
    }, [requestData.data?.data]);
  };

  const filteredData = useFilteredRequests(requestData);

  const pendingData = usePendingData(filteredData, user!, categoriesData);
  // Utilisation du hook pour la protection globale
  const { hasAccess, isChecking, userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
  });
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
        /* {
          pageId: "PG-00-01",
          authorized: ["ADMIN"],
          title: "Créer un projet",
          href: "/tableau-de-bord/projets/create",
        }, */
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
          title: "Créer un besoin",
          href: "/tableau-de-bord/besoins/create",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
        {
          pageId: "PG-02-02",
          title: "Mes besoins",
          href: "/tableau-de-bord/besoins/mylist",
          authorized: ["ADMIN", "MANAGER", "USER"],
        },
        // {
        //   pageId: "PG-02-03",
        //   title: "Approbation",
        //   href: "/tableau-de-bord/besoins/approbation",
        //   authorized: ["ADMIN", "MANAGER"],
        //   badge: data?.length > 0 ? data?.length : undefined,
        // },
        {
          pageId: "PG-02-03",
          title: "Approbation",
          href: "/tableau-de-bord/besoins/validation",
          authorized: ["ADMIN", "MANAGER"],
          badge: pendingData?.length > 0 ? pendingData?.length : undefined,
        },
        {
          pageId: "PG-09-03",
          title: "Catégories",
          href: "/tableau-de-bord/organisation/categories",
          authorized: ["ADMIN"],
        },
      ],
    },
    {
      pageId: "PG-03",
      icon: ClipboardList,
      href: "/tableau-de-bord/commande",
      authorized: ["ADMIN", "SALES"],
      title: "Commande",
      items: [
        {
          pageId: "PG-03-01",
          title: "Demande de cotation",
          href: "/tableau-de-bord/commande/cotation",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-02",
          title: "Devis",
          href: "/tableau-de-bord/commande/devis",
          authorized: ["ADMIN", "SALES"],
        },
        // {
        //   pageId: "PG-03-03",
        //   title: "Besoins",
        //   href: "/tableau-de-bord/commande/besoins",
        //   authorized: ["ADMIN", "SALES"],
        // },
        {
          pageId: "PG-03-5",
          title: "Bons de commande",
          href: "/tableau-de-bord/commande/bon-de-commande",
          authorized: ["ADMIN", "SALES"],
        },
        // {
        //   pageId: "PG-03-04",
        //   title: "Validation",
        //   href: "/tableau-de-bord/commande/validation",
        //   authorized: ["ADMIN"],
        // },
        // {
        //   pageId: "PG-03-06",
        //   title: "Créer une cotation",
        //   href: "/tableau-de-bord/commande/creercotation",
        //   authorized: ["ADMIN", "SALES"],
        // },
        // {
        //   pageId: "PG-03-07",
        //   title: "Nouveaux",
        //   href: "/tableau-de-bord/commande/nouveaux",
        //   authorized: ["ADMIN"],
        // },
        // {
        //   pageId: "PG-03-07",
        //   title: "Receptions",
        //   href: "/tableau-de-bord/commande/receptions",
        //   authorized: ["ADMIN", "SALES"],
        // },
        {
          pageId: "PG-03-06",
          title: "Paiements",
          href: "/tableau-de-bord/commande/paiements",
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
          title: "Créer un fournisseur",
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
    // {
    //   pageId: "PG-09",
    //   icon: Building,
    //   href: "/tableau-de-bord/organisation",
    //   authorized: ["ADMIN"],
    //   title: "Organisation",
    //   items: [
    //     {
    //       pageId: "PG-09-01",
    //       title: "Departements",
    //       href: "/tableau-de-bord/organisation/departements",
    //       authorized: ["ADMIN"],
    //     },
    //     {
    //       pageId: "PG-09-02",
    //       title: "Creer un departement",
    //       href: "/tableau-de-bord/organisation/createdepartement",
    //       authorized: ["ADMIN"],
    //     },
    //     {
    //       pageId: "PG-09-04",
    //       title: "Creer un categorie",
    //       href: "/tableau-de-bord/organisation/createcategorie",
    //       authorized: ["ADMIN"],
    //     },
    //   ],
    // },
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
      <SidebarFooter className="px-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full h-auto border-none shadow-none p-2 flex items-center gap-2 justify-between cursor-pointer hover:shadow-sm transition-all duration-300 ease-out">
            <div className="flex flex-col gap-1">
              <span className="text-xs leading-[120%] text-gray-500">
                {"Employé"}
              </span>
              <span className="text-sm font-medium leading-[120%] text-gray-900 capitalize">
                {user?.name || "Utilisateur"}
              </span>
            </div>
            <EllipsisVertical size={16} className="text-gray-900!" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={logout}>
              {"Déconnexion"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
