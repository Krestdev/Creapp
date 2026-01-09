import useAuthGuard from "@/hooks/useAuthGuard";
import { useFetchQuery } from "@/hooks/useData";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { PaymentQueries } from "@/queries/payment";
import { ProviderQueries } from "@/queries/providers";
import { PurchaseOrder } from "@/queries/purchase-order";
import { QuotationQueries } from "@/queries/quotation";
import { RequestQueries } from "@/queries/requestModule";
import {
  Category,
  NavigationItemProps,
  RequestModelT,
  Role,
  User,
} from "@/types/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  ClipboardList,
  LandmarkIcon,
  Coins,
  DollarSign,
  EllipsisVertical,
  ScrollText,
  Ticket,
  Truck,
  UsersRound,
  LayoutDashboardIcon,
  SettingsIcon,
  LogOutIcon,
  LockIcon,
  UserLock,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../ui/sidebar";
import NavigationItem from "./navigation-item";

function AppSidebar() {
  const { user, logout, isHydrated } = useStore();

  function getRoleName(roles: Array<Role>): string {
    if (roles.some((r) => r.label === "ADMIN")) return "Administrateur";
    if (roles.some((r) => r.label === "VOLT_MANAGER")) return "DO Décaissement";
    if (roles.some((r) => r.label === "VOLT")) return "Trésorier";
    if (roles.some((r) => r.label === "SALES_MANAGER")) return "DO d'Achats";
    if (roles.some((r) => r.label === "SALES")) return "Responsable d'Achats";
    if (roles.some((r) => r.label === "ACCOUNTING")) return "Comptable";
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

  const purchase = getPurchases.data?.data.filter(
    (c) => c.status === "IN-REVIEW" || c.status === "PENDING"
  );

  const devisTraite =
    getPurchases.isSuccess &&
    quotationsData?.data.filter(
      (c) =>
        c.status === "APPROVED" &&
        !getPurchases.data.data.some((a) => a.deviId === c.id)
    );

  const approbationDevis =
    providers?.data?.data && cotation?.data && quotationsData?.data
      ? groupQuotationsByCommandRequest(
          cotation?.data!,
          quotationsData?.data!,
          providers?.data?.data!
        ).filter((c) => c.status === "NOT_PROCESSED")
      : [];

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
      pageId: "PG-00-00",
      icon: LayoutDashboardIcon,
      href: "/tableau-de-bord",
      authorized: ["USER"],
      title: "Tableau de bord",
    },
    {
      pageId: "PG-00",
      icon: BriefcaseBusiness,
      href: "/tableau-de-bord/projets/liste",
      authorized: ["ADMIN"],
      title: "Projets",
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
          authorized: ["ADMIN", "SALES", "SALES_MANAGER"],
        },
        {
          pageId: "PG-03-45",
          title: "Approbation Devis",
          href: "/tableau-de-bord/commande/devis/approbation",
          authorized: ["ADMIN", "SALES_MANAGER"],
          badgeValue:
            approbationDevis && approbationDevis.length > 0
              ? approbationDevis?.length
              : undefined,
        },
        {
          pageId: "PG-03-5",
          title: "Bons de commande",
          href: "/tableau-de-bord/commande/bon-de-commande",
          authorized: ["ADMIN", "SALES", "SALES_MANAGER"],
          badgeValue:
            devisTraite && devisTraite.length > 0
              ? devisTraite?.length
              : undefined,
        },
        {
          pageId: "PG-03-44",
          title: "Approbation BC",
          href: "/tableau-de-bord/commande/bon-de-commande/approbation",
          authorized: ["ADMIN", "SALES_MANAGER"],
          badgeValue:
            purchase && purchase.length > 0 ? purchase?.length : undefined,
        },
        {
          pageId: "PG-03-06",
          title: "Paiements",
          href: "/tableau-de-bord/commande/paiements",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-07",
          title: "Factures",
          href: "/tableau-de-bord/commande/factures/validation",
          authorized: ["ADMIN", "SALES"],
        },
        {
          pageId: "PG-03-065897",
          title: "Statistiques",
          href: "/tableau-de-bord/commande/bon-de-commande/statistiques",
          authorized: ["ADMIN", "SALES", "SALES_MANAGER"],
        },
      ],
    },
    {
      pageId: "PG-04",
      icon: Ticket,
      href: "/tableau-de-bord/ticket",
      authorized: ["ADMIN", "VOLT_MANAGER"],
      title: "Tickets",
      items: [
        {
          pageId: "PG-04-01",
          title: "Tickets",
          href: "/tableau-de-bord/ticket",
          authorized: ["ADMIN", "VOLT_MANAGER"],
          badgeValue:
        pendingTicket && pendingTicket?.length > 0
          ? pendingTicket?.length
          : undefined,
        },
        {
          pageId: "PG-04-02",
          title: "Transferts",
          href: "/tableau-de-bord/ticket/transferts",
          authorized: ["ADMIN", "VOLT_MANAGER"],
        }
      ]
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
      icon: LandmarkIcon,
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
        {
          pageId: "PG-23354987-02",
          title: "Transferts",
          href: "/tableau-de-bord/banques/transactions/transferts",
          authorized: ["ADMIN", "VOLT"],
        },
      ],
    },
    {
      pageId: "PG-08",
      icon: SettingsIcon,
      href: "/tableau-de-bord/settings",
      authorized: ["ADMIN"],
      title: "Parametre",
      // items: [
      //   {
      //     pageId: "PG-08",
      //     icon: UsersRound,
      //     href: "/tableau-de-bord/settings/utilisateurs",
      //     authorized: ["ADMIN"],
      //     title: "Utilisateurs",
      //     items: [
      //       {
      //         pageId: "PG-08-02",
      //         title: "Liste",
      //         href: "/tableau-de-bord/settings/utilisateurs/liste",
      //         authorized: ["ADMIN"],
      //       },
      //     ],
      //   },
      //   {
      //     pageId: "PG-09-5",
      //     icon: UserLock,
      //     title: "Rôles",
      //     href: "/tableau-de-bord/settings/roles",
      //     authorized: ["ADMIN"],
      //   },
      //   {
      //     pageId: "PG-08",
      //     icon: Truck,
      //     href: "/tableau-de-bord/settings/provider",
      //     authorized: ["ADMIN"],
      //     title: "Fournisseurs",
      //     items: [
      //       {
      //         pageId: "PG-08-01",
      //         title: "Créer un fournisseur",
      //         href: "/tableau-de-bord/settings/provider/create",
      //         authorized: ["ADMIN"],
      //       },
      //       {
      //         pageId: "PG-08-02",
      //         title: "Liste des fournisseurs",
      //         href: "/tableau-de-bord/settings/provider/liste",
      //         authorized: ["ADMIN"],
      //       },
      //     ],
      //   },
      // ],
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
                {user?.lastName + " " + user?.firstName || "Utilisateur"}
              </span>
              <span className="text-xs leading-[120%] text-gray-500">
                {getRoleName(user?.role || [])}
              </span>
            </div>
            <EllipsisVertical size={16} className="text-gray-900!" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{"Mon Compte"}</span>
              <span className="text-xs font-normal text-gray-600">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href={"/tableau-de-bord/changer-mot-de-passe"}
                className="inline-flex gap-2 items-center"
              >
                <LockIcon />
                {"Changer de mot de passe"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOutIcon />
              {"Se déconnecter"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
