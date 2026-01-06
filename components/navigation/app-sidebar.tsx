import useAuthGuard from "@/hooks/useAuthGuard";
import { useFetchQuery } from "@/hooks/useData";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { PaymentQueries } from "@/queries/payment";
import { PurchaseOrder } from "@/queries/purchase-order";
import { QuotationQueries } from "@/queries/quotation";
import { RequestQueries } from "@/queries/requestModule";
import { Category, NavigationItemProps, NavigationLinkProps, RequestModelT, Role, User } from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  ClipboardList,
  CreditCardIcon,
  DollarSign,
  EllipsisVertical,
  LucideIcon,
  ScrollText,
  Ticket,
  Truck,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
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
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { ProviderQueries } from "@/queries/providers";

function AppSidebar() {
  const { user, logout, isHydrated } = useStore();

  function getRoleName(roles: Array<Role>): string {
    if (roles.some(r => r.label === "ADMIN")) return "Administrateur";
    if (roles.some(r => r.label === "VOLT_MANAGER")) return "DO Décaissement";
    if (roles.some(r => r.label === "VOLT")) return "Trésorier";
    if (roles.some(r => r.label === "SALES_MANAGER")) return "DO d'Achats";
    if (roles.some(r => r.label === "SALES")) return "Responsable d'Achats";
    if (roles.some(r => r.label === "ACCOUNTING")) return "Comptable";
    return "Employé";
  }

  const request = new RequestQueries();
  const category = new CategoryQueries();
  const command = new CommandRqstQueries();
  const quotationQuery = new QuotationQueries();
  const purchaseOrderQuery = new PurchaseOrder();
  const providersQuery = new ProviderQueries();

  const { data: cotation } = useFetchQuery(["commands"], command.getAll);
  const { data: quotationsData } = useFetchQuery(
    ["quotations"],
    quotationQuery.getAll
  );

  const getPurchases = useFetchQuery(
    ["purchaseOrders"],
    purchaseOrderQuery.getAll
  );

  const providers = useFetchQuery(["providers"], providersQuery.getAll);

  const purchase = getPurchases.data?.data.filter(c => c.status === "IN-REVIEW" || c.status === "PENDING")

  const devisTraite = getPurchases.isSuccess && quotationsData?.data.filter(c => c.status === "APPROVED" && !getPurchases.data.data.some(a => a.deviId === c.id))

  const approbationDevis = providers?.data?.data && cotation?.data && quotationsData?.data ?
    groupQuotationsByCommandRequest(cotation?.data!, quotationsData?.data!, providers?.data?.data!).filter(c => c.status === "NOT_PROCESSED") : []

  // Récupérer toutes les catégories avec leurs validateurs
  const categoriesData = useQuery({
    queryKey: ["categoryList"],
    queryFn: async () => {
      return category.getCategories();
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

  // Récupérer tous les IDs des besoins présents dans les cotations
  const besoinsDansCotation =
    cotation?.data.flatMap((item) => item.besoins.map((b) => b.id)) ?? [];

  // Filtrer les besoins validés qui ne sont pas dans une cotation
  const besoinVal = requestData.data?.data.filter(
    (x) =>
      x.categoryId !== 0 &&
      x.state === "validated" &&
      !besoinsDansCotation.includes(x.id)
  );

  const isValidCategoryId = (id: number | null | undefined): id is number =>
    id !== null && id !== undefined;

  const isUserValidatorForCategory = (
    categoryId: number | null | undefined,
    userId: number,
    categories: Category[]
  ): boolean => {
    if (!isValidCategoryId(categoryId)) return false;

    const category = categories.find((c) => c.id === categoryId);
    if (!category?.validators) return false;

    return category.validators.some((v) => v.userId === userId);
  };

  const hasUserValidatedRequest = (
    request: RequestModelT,
    userId: number,
    categories: Category[]
  ): boolean => {
    if (!isValidCategoryId(request.categoryId)) return false;

    const category = categories.find((c) => c.id === request.categoryId);
    if (!category?.validators || !request.revieweeList) return false;

    const validator = category.validators.find((v) => v.userId === userId);
    if (!validator) return false;

    return request.revieweeList.some((r) => r.validatorId === validator.id);
  };

  const hasAllPreviousValidatorsApproved = (
    request: RequestModelT,
    userId: number,
    categories: Category[]
  ): boolean => {
    if (!isValidCategoryId(request.categoryId)) return false;

    const category = categories.find((c) => c.id === request.categoryId);
    if (!category?.validators) return false;

    const currentValidator = category.validators.find(
      (v) => v.userId === userId
    );
    if (!currentValidator) return false;

    // Rank 1 → toujours visible
    if (currentValidator.rank === 1) return true;

    const previousValidators = category.validators.filter(
      (v) => v.rank < currentValidator.rank
    );

    if (previousValidators.length === 0) return true;

    const validatedIds = request.revieweeList?.map((r) => r.validatorId) ?? [];

    return previousValidators.every((v) => validatedIds.includes(v.id!));
  };

  const usePendingData = (
    filteredData: RequestModelT[],
    user: User,
    categoryData: UseQueryResult<{ data: Category[] }, Error>
  ) => {
    return React.useMemo(() => {
      const categories = categoryData.data?.data;
      if (!categories) return [];

      return filteredData.filter((item) => {
        return (
          item.state === "pending" &&
          isUserValidatorForCategory(item.categoryId, user.id!, categories) &&
          !hasUserValidatedRequest(item, user.id!, categories) &&
          hasAllPreviousValidatorsApproved(item, user.id!, categories)
        );
      });
    }, [filteredData, user.id, categoryData.data?.data]);
  };

  const useFilteredRequests = (
    requestData: UseQueryResult<{ data: RequestModelT[] }, Error>
  ) => {
    return React.useMemo(() => {
      const data =
        requestData.data?.data.filter((r) => r.state !== "cancel") ?? [];

      let start = new Date(0);
      let end = new Date();

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

  const paymentsQuery = new PaymentQueries();
  const { data, isSuccess, isError, error, isLoading } = useFetchQuery(
    ["payments"],
    paymentsQuery.getAll,
    30000
  );

  const ticketsData = data?.data.filter((ticket) => ticket.status !== "ghost");
  const pendingTicket = ticketsData?.filter(
    (ticket) => ticket.status === "pending"
  );
  const approvedTicket = ticketsData?.filter(
    (ticket) => ticket.status === "validated"
  );

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

  const navLinks: NavigationItemProps[] = [
    {
      pageId: "PG-00",
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets/liste",
      authorized: ["ADMIN"],
      title: "Projets",
      // items: [
      //   /* {
      //     pageId: "PG-00-01",
      //     authorized: ["ADMIN"],
      //     title: "Créer un projet",
      //     href: "/tableau-de-bord/projets/create",
      //   }, */
      //   {
      //     pageId: "PG-00-02",
      //     authorized: ["ADMIN"],
      //     title: "Liste des projets",
      //     href: "/tableau-de-bord/projets/liste",
      //   },
      // ],
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
          badgeValue: pendingData?.length > 0 ? pendingData?.length : undefined,
        },
        {
          pageId: "PG-09-03",
          title: "Catégories",
          href: "/tableau-de-bord/besoins/categories",
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
          badgeValue:
            besoinVal && besoinVal.length > 0 ? besoinVal?.length : undefined,
        },
        {
          pageId: "PG-03-02",
          title: "Devis",
          href: "/tableau-de-bord/commande/devis",
          authorized: ["ADMIN", "SALES"],
          // badge:
          //   newCotation && newCotation.length > 0
          //     ? newCotation?.length
          //     : undefined,
        },
        {
          pageId: "PG-03-45",
          title: "Approbation Devis",
          href: "/tableau-de-bord/commande/devis/approbation",
          authorized: ["ADMIN", "SALES_MANAGER"],
          badgeValue:
            approbationDevis && approbationDevis.length > 0 ? approbationDevis?.length : undefined,
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
          badgeValue:
            devisTraite && devisTraite.length > 0 ? devisTraite?.length : undefined,
          // badge:
          //   newDevis && newDevis?.length > 0 ? newDevis?.length : undefined,
        },
        {
          pageId: "PG-03-44",
          title: "Approbation BC",
          href: "/tableau-de-bord/commande/bon-de-commande/approbation",
          authorized: ["ADMIN", "SALES_MANAGER"],
          badgeValue:
            purchase && purchase.length > 0 ? purchase?.length : undefined,
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
      authorized: ["ADMIN", "VOLT_MANAGER"],
      title: "Tickets",
      badgeValue:
        pendingTicket && pendingTicket?.length > 0
          ? pendingTicket?.length
          : undefined,
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
    {
      pageId: "PG-91",
      icon: DollarSign,
      href: "/tableau-de-bord/depenses",
      authorized: ["VOLT", "ADMIN"],
      title: "Dépenses",
      badgeValue:
        approvedTicket && approvedTicket?.length > 0
          ? approvedTicket?.length
          : undefined,
    },
    {
      pageId: "PG-56489713246",
      icon: CreditCardIcon,
      href: "/tableau-de-bord/banques",
      authorized: ["ACCOUNTANT", "VOLT", "ADMIN"],
      title: "Banques",
      items: [
        {
          pageId: "PG-23354987-00",
          title: "Liste des comptes",
          href: "/tableau-de-bord/banques",
          authorized: ["ADMIN", "ACCOUNTANT", "VOLT"],
        },
        {
          pageId: "PG-23354987-01",
          title: "Transactions",
          href: "/tableau-de-bord/banques/transactions",
          authorized: ["ADMIN", "ACCOUNTANT", "VOLT"],
        },
      ]
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
    // {
    //   pageId: "PG-10",
    //   icon: Bell,
    //   href: "/tableau-de-bord/notifications",
    //   authorized: ["USER"],
    //   title: "Notifications",
    // }
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
      <SidebarContent className="p-2 flex flex-col gap-1.5">
        {filteredNavLinks.map(({ items, ...props }, id) => (
          <NavigationItem
            key={id}
            {...props}
            items={items?.filter((item) =>
              item.authorized.some((role) => userRoles.includes(role))
            )}
          />
        ))}
      </SidebarContent>
      <SidebarFooter className="px-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full h-auto border-none shadow-none p-2 flex items-center gap-2 justify-between cursor-pointer hover:shadow-sm transition-all duration-300 ease-out">
            <div className="flex flex-col gap-1 text-left flex-start">
              <span className="text-sm font-medium leading-[120%] text-gray-900 capitalize">
                {user?.firstName + " " + user?.lastName || "Utilisateur"}
              </span>
              <span className="text-xs leading-[120%] text-gray-500">
                {getRoleName(user?.role || [])}
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
