import useAuthGuard from "@/hooks/useAuthGuard";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { approbatorRequests } from "@/lib/requests-helpers";
import { useStore } from "@/providers/datastore";
import { categoryQ } from "@/queries/categoryModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { paymentQ } from "@/queries/payment";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { requestQ } from "@/queries/requestModule";
import { signatairQ } from "@/queries/signatair";
import { NavigationItemProps } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  ClipboardList,
  DollarSign,
  EllipsisVertical,
  LandmarkIcon,
  LayoutDashboardIcon,
  LockIcon,
  LogOutIcon,
  ReceiptIcon,
  ScrollText,
  SettingsIcon,
  SignatureIcon,
  Ticket,
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
import { Skeleton } from "../ui/skeleton";
import NavigationItem from "./navigation-item";

function AppSidebar() {
  const { user, logout, isHydrated } = useStore();

  // Utilisation du hook pour la protection globale
  const { userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
  });

  /*  function getRoleName(roles: Array<Role>): string {
    if (roles.some((r) => r.label === "ADMIN")) return "Administrateur";
    if (roles.some((r) => r.label === "VOLT_MANAGER")) return "DO Décaissement";
    if (roles.some((r) => r.label === "VOLT")) return "Trésorier";
    if (roles.some((r) => r.label === "SALES_MANAGER")) return "DO d'Achats";
    if (roles.some((r) => r.label === "SALES")) return "Responsable d'Achats";
    if (roles.some((r) => r.label === "ACCOUNTING")) return "Comptable";
    return "Employé";
  } */

  //Get Quotation requests
  const getQuotationRequests = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  //Get Quotations
  const getQuotations = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });

  //Get Purchase orders (Bons de commande)
  const getPurchases = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: purchaseQ.getAll,
  });

  //Get Providers
  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  // Get Categories
  const categoriesData = useQuery({
    queryKey: ["categoryList"],
    queryFn: async () => {
      return categoryQ.getCategories();
    },
    enabled: isHydrated,
  });

  // Get requests for approvals
  const requestData = useQuery({
    queryKey: ["requests-for-approval"],
    queryFn: async () => requestQ.getValidatorRequests(user?.id ?? 0),
    enabled: !!user,
  });

  //Get my requests sent
  const myList = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: () => requestQ.getMine(user!.id),
  });

  //Get signature requests
  const signatories = useQuery({
    queryKey: ["SignatairList"],
    queryFn: signatairQ.getAll,
  });

  //Get Payments
  const getPayments = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const filteredData = React.useMemo(() => {
    if (!requestData.data) return [];
    return approbatorRequests(requestData.data.data, user?.id);
  }, [requestData.data, user?.id]);

  if (
    getQuotationRequests.isLoading ||
    getQuotations.isLoading ||
    getPayments.isLoading ||
    signatories.isLoading ||
    myList.isLoading ||
    requestData.isLoading ||
    categoriesData.isLoading ||
    providers.isLoading ||
    getPurchases.isLoading
  ) {
    return (
      <Sidebar>
        <SidebarHeader>
          <Link href={"/tableau-de-bord"}>
            <img src={"/logo.svg"} alt="Logo" className="h-8 w-auto" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="w-full h-10"></Skeleton>
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }
  if (
    getQuotationRequests.isError ||
    getQuotations.isError ||
    getPayments.isError ||
    signatories.isError ||
    myList.isError ||
    requestData.isError ||
    categoriesData.isError ||
    providers.isError ||
    getPurchases.isError
  ) {
    return (
      <Sidebar>
        <SidebarHeader>
          <Link href={"/tableau-de-bord"}>
            <img src={"/logo.svg"} alt="Logo" className="h-8 w-auto" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 flex flex-col gap-2">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="w-full h-10"></Skeleton>
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }
  if (
    getQuotationRequests.isSuccess &&
    getQuotations.isSuccess &&
    getPayments.isSuccess &&
    signatories.isSuccess &&
    myList.isSuccess &&
    requestData.isSuccess &&
    categoriesData.isSuccess &&
    providers.isSuccess &&
    getPurchases.isSuccess
  ) {
    const purchase = getPurchases.data?.data.filter(
      (c) => c.status === "IN-REVIEW" || c.status === "PENDING",
    );

    const devisTraite =
      getPurchases.isSuccess &&
      getQuotations.data.data.filter(
        (c) =>
          c.status === "APPROVED" &&
          !getPurchases.data.data.some((a) => a.deviId === c.id),
      );

    const approbationDevis =
      providers.data.data && getQuotationRequests.data && getQuotations.data
        ? groupQuotationsByCommandRequest(
            getQuotationRequests.data.data,
            getQuotations.data.data,
            providers.data.data,
          ).filter((c) => c.status === "NOT_PROCESSED")
        : [];

    const besoinDéstocké =
      myList.data?.data.filter((x) => x.state === "store").length ?? 0;

    // Récupérer tous les IDs des besoins présents dans les cotations
    const besoinsDansCotation =
      getQuotationRequests.data.data.flatMap((item) =>
        item.besoins.map((b) => b.id),
      ) ?? [];

    // Filtrer les besoins validés qui ne sont pas dans une cotation
    const besoinVal = requestData.data.data.filter(
      (x) =>
        x.categoryId !== 0 &&
        x.state === "validated" &&
        !besoinsDansCotation.includes(x.id),
    );

    const pendingData = approbatorRequests(
      requestData.data.data,
      user?.id,
    ).filter((b) => {
      return (
        b.state === "pending" &&
        b.validators.find((v) => v.userId === user?.id)?.validated === false
      );
    });
    // const pendingData = requestData.data.data.filter((b) => {
    //   return (
    //     b.state === "pending" &&
    //     b.validators.find((v) => v.userId === user?.id)?.validated === false
    //   );
    // });

    const ticketsData = getPayments.data.data.filter(
      (ticket) => ticket.status !== "ghost",
    );
    const pendingTicket = ticketsData.filter(
      (ticket) => ticket.status === "pending",
    );
    const approvedTicket = ticketsData.filter(
      (ticket) => ticket.status === "validated",
    );
    const approvedDepense = ticketsData.filter(
      (ticket) => ticket.status === "pending_depense",
    );

    const ticketsDataP = getPayments.data.data.filter(
      (ticket) =>
        ticket.status !== "ghost" &&
        ticket.status !== "pending" &&
        ticket.status !== "rejected" &&
        ticket.status !== "validated" &&
        ticket.status !== "pending_depense" &&
        ticket.status !== "unsigned" &&
        ticket.status !== "paid",
    );

    const overall = approvedDepense?.concat(approvedDepense);

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
            href: "/tableau-de-bord/besoins/creer",
            authorized: ["ADMIN", "MANAGER", "USER"],
          },
          {
            pageId: "PG-02-02",
            title: "Mes besoins",
            href: "/tableau-de-bord/besoins/mes-besoins",
            authorized: ["ADMIN", "MANAGER", "USER"],
            badgeValue: besoinDéstocké > 0 ? besoinDéstocké : undefined,
          },
          {
            pageId: "PG-02-03",
            title: "Approbation",
            href: "/tableau-de-bord/besoins/validation",
            authorized: ["ADMIN", "MANAGER"],
            badgeValue:
              pendingData?.length > 0 ? pendingData?.length : undefined,
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
            pageId: "PG-03-065897",
            title: "Statistiques",
            href: "/tableau-de-bord/commande/bon-de-commande/statistiques",
            authorized: ["ADMIN", "SALES", "SALES_MANAGER"],
          },
        ],
      },
      {
        pageId: "PG-03-07",
        title: "Factures",
        href: "/tableau-de-bord/factures",
        authorized: ["ADMIN", "ACCOUNTING"],
        icon: ReceiptIcon,
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
              ticketsDataP && ticketsDataP.length > 0
                ? ticketsDataP?.length
                : undefined,
          },
          {
            pageId: "PG-04-02",
            title: "Transferts",
            href: "/tableau-de-bord/ticket/transferts",
            authorized: ["ADMIN", "VOLT_MANAGER"],
          },
          {
            pageId: "PG-04-03",
            title: "Statistiques",
            href: "/tableau-de-bord/ticket/statistiques",
            authorized: ["ADMIN", "VOLT_MANAGER"],
          },
        ],
      },
      {
        pageId: "PG-91",
        icon: DollarSign,
        href: "/tableau-de-bord/depenses",
        authorized: ["VOLT", "ADMIN"],
        title: "Dépenses",
        badgeValue:
          overall && overall?.length > 0 ? overall?.length : undefined,
        items: [
          {
            pageId: "PG-23354987-00",
            title: "Dépenses",
            href: "/tableau-de-bord/depenses",
            badgeValue:
              approvedTicket &&
              approvedDepense &&
              approvedTicket?.length + approvedDepense?.length > 0
                ? approvedTicket?.length + approvedDepense?.length
                : undefined,
            authorized: ["ADMIN", "ACCOUNTANT", "VOLT"],
          },
          {
            pageId: "PG-23354987-01",
            title: "Créer une dépense",
            href: "/tableau-de-bord/depenses/creer",
            authorized: ["ADMIN", "ACCOUNTANT", "VOLT"],
          },
        ],
      },
      {
        pageId: "PG-00001",
        title: "Signatures",
        href: "/tableau-de-bord/signatures",
        authorized: [],
        icon: SignatureIcon,
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
        href: "/tableau-de-bord/parametres",
        authorized: ["ADMIN"],
        title: "Paramètres",
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
    const filteredNavLinks = navLinks.filter((navLink) => {
      const signPage = navLink.pageId === "PG-00001";
      const canSign = signatories.data?.data.find((s) =>
        s.user?.some((o) => o.id === user?.id),
      );
      if (signPage) return !!canSign;
      if (navLink.authorized.length === 0) return true;
      return navLink.authorized.some((role) => userRoles.includes(role));
    });

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
                item.authorized.some((role) => userRoles.includes(role)),
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
                  {/* {getRoleName(user?.role || [])} */}
                  {user?.post}
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
}

export default AppSidebar;
