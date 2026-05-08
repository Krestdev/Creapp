import useAuthGuard from "@/hooks/useAuthGuard";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { approbatorRequests } from "@/lib/requests-helpers";
import { cn } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { categoryQ } from "@/queries/categoryModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { providerQ } from "@/queries/providers";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { requestQ } from "@/queries/requestModule";
import { signatairQ } from "@/queries/signatair";
import { transactionQ } from "@/queries/transaction";
import {
  NavigationGroup,
  PaymentRequest,
  RequestModelT,
  TransferTransaction,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRightIcon,
  ArrowRightLeftIcon,
  BadgeDollarSignIcon,
  BriefcaseBusiness,
  Building2Icon,
  CircleDollarSignIcon,
  CircleUserRoundIcon,
  DatabaseIcon,
  EllipsisVertical,
  LandmarkIcon,
  LayoutDashboardIcon,
  LockIcon,
  LogOutIcon,
  ReceiptIcon,
  Settings2Icon,
  SettingsIcon,
  SignatureIcon,
  TablePropertiesIcon,
  Ticket,
  VoteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

function AppSidebar() {
  const { user, logout, isHydrated, isSignataire } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const sessionClose = () => {
    logout();
    router.replace("/connexion");
  };

  // Utilisation du hook pour la protection globale
  const { userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
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

  const pendingRequestApprovalsCount = useQuery({
    queryKey: ["pending-request-approvals-count"],
    queryFn: async () => requestQ.getPendingCount(),
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
    queryFn: () => paymentQ.getAll(),
  });

  const usableRequestsCount = useQuery({
    queryKey: ["usableRequestsCount"],
    queryFn: () => {
      return requestQ.getUsableRequestsCount();
    },
  });

  const SignPay = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentQ.getAll(),
  });

  const signatair = useQuery({
    queryKey: ["signatairs"],
    queryFn: signatairQ.getAll,
  });

  const getTransactions = useQuery({
    queryKey: ["transactions"],
    queryFn: () => {
      return transactionQ.getAll();
    },
  });

  const getPayType = useQuery({
    queryKey: ["payType"],
    queryFn: payTypeQ.getAll,
  });

  const getBanks = useQuery({
    queryKey: ["banks"],
    queryFn: bankQ.getAll,
  });

  //Get service requests count
  const serviceRequestsCount = useQuery({
    queryKey: ["service-requests-count"],
    queryFn: () => requestQ.getServiceRequestsCount(),
    enabled: !!user,
  });

  const pendingCommandRequestsCount = useQuery({
    queryKey: ["pending-commandRequests-count"],
    queryFn: () => commandRqstQ.getPendingCount(),
    enabled:
      !!user &&
      user?.role.some((role) =>
        ["VOLT_MANAGER", "ADMIN", "SUPERADMIN", "SALES_MANAGER"].includes(
          role.label,
        ),
      ),
  });

  const pendingApprovalsTransactionsCount = useQuery({
    queryKey: ["pending-approvals-transactions-count"],
    queryFn: () => transactionQ.getApprovePendingCount(),
    enabled:
      !!user &&
      user?.role.some((role) =>
        ["VOLT_MANAGER", "SUPERADMIN"].includes(role.label),
      ),
  });

  //Get purchase orders pending count
  const purchaseOrdersPendingCount = useQuery({
    queryKey: ["purchaseOrders-pending-count"],
    queryFn: () => purchaseQ.getPendingCount(),
    enabled: !!user,
  });

  const quotationToAssignCount = useQuery({
    queryKey: ["quotation-to-assign-count"],
    queryFn: () => quotationQ.getToAssignCount(),
    enabled:
      !!user &&
      user?.role.some((role) =>
        [
          "SALES_MANAGER",
          "VOLT_MANAGER",
          "ADMIN",
          "SUPERADMIN",
          "SALES",
        ].includes(role.label),
      ),
  });

  //Volt Pending Count
  const voltPendingCount = useQuery({
    queryKey: ["volt-pending-count"],
    queryFn: () => paymentQ.getVoltPendingCount(),
    enabled:
      !!user &&
      user?.role.some((role) =>
        ["VOLT_MANAGER", "SUPERADMIN"].includes(role.label),
      ),
  });

  //Pending Depense Count
  const pendingDepenseCount = useQuery({
    queryKey: ["pending-depense-count"],
    queryFn: () => paymentQ.getPendingDepenseCount(),
    enabled:
      !!user &&
      user?.role.some((role) => ["VOLT", "SUPERADMIN"].includes(role.label)),
  });

  //Payment to Sign
  const paymentsToSignCount = useQuery({
    queryKey: ["payments-to-sign-count"],
    queryFn: () => paymentQ.getPendingToSignCount(),
    enabled: !!user?.signatairs && user.signatairs.length > 0,
  });

  //Signataires
  const transfersToSign: Array<TransferTransaction> = useMemo(() => {
    if (!getTransactions.data || !signatair.data) return [];
    return getTransactions.data.data
      .filter((t) => t.Type === "TRANSFER")
      .filter((t) => {
        if (!t.methodId) return false;
        if (t.from.type === "BANK" && t.to.type === "BANK") {
          return signatair.data.data
            .find((x) => x.bankId === t.from.id && x.payTypeId === t.method?.id)
            ?.user?.some((u) => u.id === user?.id);
        }
        return false;
      })
      .filter(
        (t) =>
          t.isSigned === false && !t.signers.find((s) => s.userId === user?.id),
      );
  }, [getTransactions.data, signatair.data, user?.id]);

  const transfersToCheck: Array<TransferTransaction> = useMemo(() => {
    if (!getTransactions.data) return [];
    return getTransactions.data.data
      .filter((t) => t.Type === "TRANSFER")
      .filter((t) => {
        if (t.status === "ACCEPTED") return true;
        return false;
      });
  }, [getTransactions.data]);

  if (
    getPayments.isLoading ||
    signatories.isLoading ||
    myList.isLoading ||
    categoriesData.isLoading ||
    providers.isLoading ||
    getPurchases.isLoading ||
    getPayType.isLoading ||
    getBanks.isLoading ||
    serviceRequestsCount.isLoading ||
    pendingRequestApprovalsCount.isLoading ||
    usableRequestsCount.isLoading ||
    pendingCommandRequestsCount.isLoading ||
    quotationToAssignCount.isLoading ||
    purchaseOrdersPendingCount.isLoading ||
    voltPendingCount.isLoading ||
    pendingApprovalsTransactionsCount.isLoading ||
    pendingDepenseCount.isLoading ||
    paymentsToSignCount.isLoading
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
            <Skeleton key={i} className="w-full h-10" />
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }
  if (
    getPayments.isError ||
    signatories.isError ||
    myList.isError ||
    categoriesData.isError ||
    providers.isError ||
    getPurchases.isError ||
    getPayType.isError ||
    getBanks.isError ||
    serviceRequestsCount.isError ||
    pendingRequestApprovalsCount.isError ||
    usableRequestsCount.isError ||
    pendingCommandRequestsCount.isError ||
    quotationToAssignCount.isError ||
    purchaseOrdersPendingCount.isError ||
    voltPendingCount.isError ||
    pendingApprovalsTransactionsCount.isError ||
    pendingDepenseCount.isError ||
    paymentsToSignCount.isError
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
            <Skeleton key={i} className="w-full h-10" />
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }
  if (
    getPayments.isSuccess &&
    signatories.isSuccess &&
    myList.isSuccess &&
    categoriesData.isSuccess &&
    providers.isSuccess &&
    getPurchases.isSuccess &&
    getPayType.isSuccess &&
    getBanks.isSuccess &&
    serviceRequestsCount.isSuccess &&
    pendingRequestApprovalsCount.isSuccess &&
    usableRequestsCount.isSuccess &&
    pendingCommandRequestsCount.isSuccess &&
    quotationToAssignCount.isSuccess &&
    purchaseOrdersPendingCount.isSuccess &&
    voltPendingCount.isSuccess &&
    pendingApprovalsTransactionsCount.isSuccess &&
    pendingDepenseCount.isSuccess &&
    paymentsToSignCount.isSuccess
  ) {
    const navLinks: NavigationGroup[] = [
      {
        pageId: "PG-00-00",
        authorized: ["USER"],
        title: "Tableau de bord",
        items: [
          {
            pageId: "PG-00-01",
            icon: LayoutDashboardIcon,
            href: "/tableau-de-bord",
            authorized: ["USER"],
            title: "Tableau de bord",
          },
          {
            pageId: "PG-00-02",
            icon: DatabaseIcon,
            href: "/tableau-de-bord/admin",
            authorized: ["SUPERADMIN"],
            title: "Administration",
          },
        ],
      },
      {
        pageId: "PG-00",
        authorized: ["SUPERADMIN", "ADMIN"],
        title: "Projets",
        className: "text-teal-800",
        items: [
          {
            pageId: "PG-00-02",
            icon: BriefcaseBusiness,
            href: "/tableau-de-bord/projets",
            authorized: ["SUPERADMIN", "ADMIN"],
            title: "Projets",
          },
        ],
      },
      {
        pageId: "PG-02",
        authorized: ["SUPERADMIN", "MANAGER", "USER"],
        title: "Besoins",
        className: "text-primary-800",
        items: [
          {
            pageId: "PG-02-01",
            title: "Créer un besoin",
            href: "/tableau-de-bord/besoins/creer",
            authorized: ["SUPERADMIN", "MANAGER", "USER"],
          },
          {
            pageId: "PG-02-02",
            title: "Mes besoins",
            href: "/tableau-de-bord/besoins/mes-besoins",
            authorized: ["SUPERADMIN", "MANAGER", "USER"],
          },
          {
            pageId: "PG-02-04",
            title: "Tous les besoins",
            href: "/tableau-de-bord/besoins/besoins",
            authorized: ["SUPERADMIN"],
          },
          {
            pageId: "PG-02-03",
            title: "Approbation",
            href: "/tableau-de-bord/besoins/validation",
            authorized: ["SUPERADMIN", "MANAGER"],
            badgeValue: pendingRequestApprovalsCount.data.data,
          },
          {
            pageId: "PG-02-05",
            title: "Besoins du Service",
            href: "/tableau-de-bord/besoins/service",
            authorized: ["SUPERADMIN", "USER"],
            badgeValue: serviceRequestsCount.data.data,
          },
        ],
      },
      {
        pageId: "PG-03",
        authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER", "VOLT_MANAGER"],
        title: "Commandes",
        className: "text-sky-800",
        items: [
          {
            pageId: "PG-03-01",
            title: "Demande de cotation",
            href: "/tableau-de-bord/commande/cotation",
            authorized: ["SUPERADMIN", "SALES"],
            badgeValue: usableRequestsCount.data.data,
          },
          {
            pageId: "PG-03-02",
            title: "Devis",
            href: "/tableau-de-bord/commande/devis",
            authorized: ["SUPERADMIN", "SALES"],
          },
          {
            pageId: "PG-03-45",
            title: "Approbation Devis",
            href: "/tableau-de-bord/commande/devis/approbation",
            authorized: ["SUPERADMIN", "SALES_MANAGER"],
            badgeValue: pendingCommandRequestsCount.data.data,
          },
          {
            pageId: "PG-03-5",
            title: "Bons de commande",
            href: "/tableau-de-bord/commande/bon-de-commande",
            authorized: ["SUPERADMIN", "SALES"],
            badgeValue: quotationToAssignCount.data.data,
          },
          {
            pageId: "PG-03-44",
            title: "Approbation BC",
            href: "/tableau-de-bord/commande/bon-de-commande/approbation",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
            badgeValue: purchaseOrdersPendingCount.data.data,
          },
          {
            pageId: "PG-03-065897",
            title: "Statistiques",
            href: "/tableau-de-bord/commande/bon-de-commande/statistiques",
            authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER"],
          },
        ],
      },
      {
        pageId: "PG-03-07",
        title: "Factures",
        className: "text-orange-800",
        authorized: ["SUPERADMIN", "ACCOUNTANT"],
        items: [
          {
            pageId: "PG-03-07-01",
            title: "Factures",
            icon: ReceiptIcon,
            href: "/tableau-de-bord/factures",
            authorized: ["ACCOUNTANT", "SUPERADMIN"],
          },
          {
            pageId: "PG-03-07-02",
            title: "Paiements",
            icon: CircleDollarSignIcon,
            href: "/tableau-de-bord/factures/paiements",
            authorized: ["ACCOUNTANT", "SUPERADMIN"],
          },
        ],
      },
      {
        pageId: "PG-04",
        authorized: ["SUPERADMIN", "VOLT_MANAGER"],
        title: "Autorisations",
        className: "text-purple-800",
        items: [
          {
            pageId: "PG-04-01",
            icon: Ticket,
            title: "Paiements",
            href: "/tableau-de-bord/ticket",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
            badgeValue: voltPendingCount.data.data,
          },
          {
            pageId: "PG-04-02",
            title: "Approvisionnements",
            icon: ArrowLeftRightIcon,
            href: "/tableau-de-bord/ticket/transferts",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
            badgeValue: pendingApprovalsTransactionsCount.data.data,
          },
          /* {
            pageId: "PG-04-04",
            title: "Rapports",
            href: "/tableau-de-bord/ticket/rapports",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
          }, */
          /* {
            pageId: "PG-04-03",
            title: "Statistiques",
            href: "/tableau-de-bord/ticket/statistiques",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
          }, */
        ],
      },
      {
        pageId: "PG-91",
        authorized: ["VOLT", "SUPERADMIN"],
        title: "Dépenses",
        className: "text-emerald-800",
        items: [
          {
            pageId: "PG-23354987-00",
            title: "Dépenses",
            icon: BadgeDollarSignIcon,
            href: "/tableau-de-bord/depenses",
            badgeValue: pendingDepenseCount.data.data,
            authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
          },
          /* {
            pageId: "PG-23354987-01",
            title: "Créer une dépense",
            href: "/tableau-de-bord/depenses/creer",
            authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
          }, */
        ],
      },
      {
        pageId: "PG-0000551",
        title: "Signatures",
        className: "text-rose-800",
        authorized: [],
        items: [
          {
            pageId: "PG-0000551-01",
            title: "Paiements",
            icon: SignatureIcon,
            href: "/tableau-de-bord/signatures/tickets",
            authorized: [],
            badgeValue: paymentsToSignCount.data.data,
          },
          {
            pageId: "PG-0000551-02",
            title: "Transferts",
            icon: VoteIcon,
            href: "/tableau-de-bord/signatures/transferts",
            authorized: [],
            badgeValue:
              transfersToSign.length > 0 //to-do update router for this
                ? transfersToSign.length
                : undefined,
          },
        ],
      },
      {
        pageId: "PG-56489713246",
        authorized: ["ACCOUNTANT", "VOLT", "SUPERADMIN"],
        title: "Banques",
        className: "text-indigo-800",
        items: [
          {
            pageId: "PG-23354987-00",
            title: "États des comptes",
            icon: LandmarkIcon,
            href: "/tableau-de-bord/banques",
            authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
          },
          {
            pageId: "PG-23354987-01",
            title: "Transactions",
            icon: TablePropertiesIcon,
            href: "/tableau-de-bord/banques/transactions",
            authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
          },
          {
            pageId: "PG-23354987-02",
            title: "Transferts",
            icon: ArrowRightLeftIcon,
            href: "/tableau-de-bord/banques/transactions/transferts",
            authorized: ["SUPERADMIN", "VOLT"],
            badgeValue:
              transfersToCheck.length > 0 ? transfersToCheck.length : undefined, //to-do update router for this
          },
        ],
      },
      {
        pageId: "PG-0000354650",
        title: "Services",
        className: "text-teal-800",
        authorized: ["SUPERADMIN", "ADMIN", "VOLT_MANAGER"],
        items: [
          {
            pageId: "PG-0000354650-01",
            title: "Services",
            icon: Building2Icon,
            href: "/tableau-de-bord/services",
            authorized: ["USER"],
          },
        ],
      },
      {
        pageId: "PG-10235-01",
        title: "Réglages",
        className: "text-red-800",
        authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER", "ADMIN"],
        items: [
          {
            pageId: "PG-10235-01-01",
            title: "Commandes",
            icon: Settings2Icon,
            href: "/tableau-de-bord/parametres-commandes",
            authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER"],
          },
          {
            pageId: "PG-10235-01-02",
            title: "Paramètres",
            icon: SettingsIcon,
            href: "/tableau-de-bord/parametres",
            authorized: ["SUPERADMIN", "ADMIN"],
          },
        ],
      },
      {
        pageId: "PG-55540665489",
        title: "Mon Compte",
        className: "text-slate-800",
        authorized: ["USER"],
        items: [
          {
            pageId: "PG-55540665489-01",
            title: "Mon Profil",
            icon: CircleUserRoundIcon,
            href: "/tableau-de-bord/profil",
            authorized: ["USER"],
          },
        ],
      },
    ];

    // Filtrer les liens de navigation selon les rôles de l'utilisateur
    const filteredNavLinks = navLinks.filter((navLink) => {
      if (navLink.pageId === "PG-0000551") {
        return isSignataire;
      }
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
          {filteredNavLinks.map(({ items, title, className }, id) => (
            <SidebarGroup key={id}>
              <SidebarGroupLabel className={cn(className)}>
                {title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items
                    .filter((i) => {
                      if (i.authorized.length === 0) return true;
                      if (i.pageId === "PG-02-05") {
                        return typeof user?.serviceUserId === "number";
                      }
                      return i.authorized.some((role) =>
                        userRoles.includes(role),
                      );
                    })
                    .map((item, id) => (
                      <SidebarMenuItem key={id}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            {item.icon && <item.icon size={20} />}
                            <span className="w-full">{item.title}</span>
                            {!!item.badgeValue && item.badgeValue > 0 && (
                              <span className="inline-flex shrink-0 h-[26px] min-w-[26px] px-1 items-center justify-center text-center rounded bg-accent text-xs font-medium text-primary-700">
                                {item.badgeValue > 99 ? "99+" : item.badgeValue}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
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
              <DropdownMenuItem variant="destructive" onClick={sessionClose}>
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
