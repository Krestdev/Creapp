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
import { usePathname } from "next/navigation";
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

  const pathname = usePathname();

  // Utilisation du hook pour la protection globale
  const { userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
  });

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

  const requestsData = useQuery({
    queryKey: ["requests"],
    queryFn: () => {
      return requestQ.getAll();
    },
  });

  const getCommandRequests = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const SignPay = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
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

  const filteredTickTransfert = React.useMemo(() => {
    return getTransactions.data?.data.filter((transaction) => {
      //Filter Tab
      const matchTab =
        transaction.Type === "TRANSFER" && transaction.status === "PENDING";
      return matchTab;
    });
  }, [getTransactions.data?.data]);

  const filteredData = useMemo(() => {
    if (!SignPay?.data?.data || !signatair.data?.data || !user) {
      return {
        unsignedPayments: [],
        signedPayments: [],
      };
    }

    const allPayments = SignPay.data.data;
    const allSignatair = signatair.data.data;
    const currentUserId = user.id;

    // Pré-calculer les signataires autorisés par banque et type de paiement
    const authorizedSigners = new Map<string, Set<number>>();

    allSignatair.forEach((signer) => {
      const key = `${signer.bankId}_${signer.payTypeId}`;
      const userIds = new Set(signer.user?.map((u) => u.id) || []);
      authorizedSigners.set(key, userIds);
    });

    // Fonction optimisée pour vérifier si l'utilisateur peut signer
    const userCanSign = (bankId: number | null, methodId: number | null) => {
      if (bankId == null || methodId == null) return false;
      const key = `${bankId}_${methodId}`;
      const userIds = authorizedSigners.get(key);
      return userIds ? userIds.has(currentUserId) : false;
    };

    // Filtrer les paiements selon les permissions - version optimisée
    const authorizedPayments = allPayments.filter((p) =>
      userCanSign(p.bankId!, p.methodId!),
    );

    // Séparation des paiements par statut
    const pendingDepensePayments = authorizedPayments.filter(
      (p) =>
        p.signer?.flatMap((u) => u.id)?.includes(currentUserId) &&
        p.status === "pending_depense",
    );

    const unsignedPayments = authorizedPayments.filter(
      (p) =>
        !p.signer?.flatMap((u) => u.id)?.includes(currentUserId) &&
        p.status === "unsigned",
    );

    const signedPayments = authorizedPayments.filter(
      (p) => p.status === "signed" || p.status === "paid",
    );

    // Tous les paiements en attente (pour l'onglet)
    const allPendingPayments = [...pendingDepensePayments, ...unsignedPayments];

    return {
      pendingDepensePayments,
      unsignedPayments,
      signedPayments,
      allPendingPayments,
      allPayments,
    };
  }, [SignPay?.data?.data, signatair.data?.data, user]);

  const data: Array<RequestModelT> = useMemo(() => {
    if (!requestData.data) return [];
    return approbatorRequests(requestData.data.data, user?.id);
  }, [requestData.data, user?.id]);

  const purchase = useMemo(() => {
    if (!getPurchases.data) return [];
    return getPurchases.data?.data.filter(
      (c) => c.status === "IN-REVIEW" || c.status === "PENDING",
    );
  }, [getPurchases.data]);

  const devisTraite = useMemo(() => {
    if (!getQuotations.data || !getPurchases.data) return [];
    return (
      getPurchases.isSuccess &&
      getQuotations.data.data.filter(
        (c) =>
          c.status === "APPROVED" &&
          !getPurchases.data.data.some((a) => a.deviId === c.id),
      )
    );
  }, [getQuotations.data, getPurchases.data]);

  const approbationDevis = useMemo(() => {
    if (!providers.data || !getQuotationRequests.data || !getQuotations.data)
      return [];
    return providers.data.data &&
      getQuotationRequests.data &&
      getQuotations.data
      ? groupQuotationsByCommandRequest(
          getQuotationRequests.data.data,
          getQuotations.data.data,
          providers.data.data,
        ).filter((c) => c.status === "NOT_PROCESSED")
      : [];
  }, [providers.data, getQuotationRequests.data, getQuotations.data]);

  // Récupérer tous les IDs des besoins présents dans les cotations
  const commandRequests = useMemo(() => {
    if (!getQuotationRequests.data) return [];
    return getQuotationRequests.data.data;
  }, [getQuotationRequests.data]);

  const isRequestUsed = (requestId: number): boolean =>
    commandRequests.some((c) => c.besoins.some((b) => b.id === requestId));

  // Filtrer les besoins validés qui ne sont pas dans une cotation
  const requestToUse = useMemo(() => {
    if (!requestsData.data || !getCommandRequests.data) return [];
    return requestsData.data.data.filter(
      (x) =>
        x.type === "achat" && x.state === "validated" && !isRequestUsed(x.id),
    );
  }, [requestsData.data, getCommandRequests.data, isRequestUsed]);

  const pendingData = useMemo(() => {
    if (!data) return [];
    return data.filter((b) => {
      return (
        b.state === "pending" &&
        b.validators.find((v) => v.userId === user?.id)?.validated === false
      );
    });
  }, [data, user?.id]);

  const ticketsData = useMemo(() => {
    if (!getPayments.data) return [];
    return getPayments.data.data.filter((ticket) => ticket.status !== "ghost");
  }, [getPayments.data]);

  const approvedTicket = useMemo(() => {
    if (!ticketsData) return [];
    return ticketsData
      .filter((x) => x.type !== "appro")
      .filter((ticket) => ticket.status === "validated");
  }, [ticketsData]);

  const simpleTicket = useMemo(() => {
    if (!ticketsData) return [];
    return ticketsData.filter((ticket) => ticket.status === "simple_signed");
  }, [ticketsData]);

  const signedTicket = useMemo(() => {
    if (!ticketsData) return [];
    return ticketsData.filter((ticket) => ticket.status === "signed");
  }, [ticketsData]);

  const pendingTicket = useMemo(() => {
    if (!ticketsData) return [];
    return ticketsData.filter((ticket) => ticket.status === "pending_depense");
  }, [ticketsData]);

  const ticketPending = useMemo(() => {
    const bannedTypes: Array<PaymentRequest["type"]> = [
      "transport",
      "others",
      // "appro",
      "gas",
    ];
    if (!ticketsData) return [];
    return ticketsData.filter(
      (ticket) =>
        ticket.status === "accepted" ||
        (ticket.status === "pending" &&
          !bannedTypes.some((t) => t === ticket.type)),
    );
  }, [ticketsData]);

  const ticketsDataP = useMemo(() => {
    if (!getPayments.data) return [];
    return getPayments.data.data.filter(
      (ticket) =>
        ticket.status !== "ghost" &&
        ticket.status !== "pending" &&
        ticket.status !== "rejected" &&
        ticket.status !== "validated" &&
        ticket.status !== "pending_depense" &&
        ticket.status !== "unsigned" &&
        ticket.status !== "paid",
    );
  }, [getPayments.data]);

  const overall = useMemo(() => {
    if (!approvedTicket || !signedTicket || !pendingTicket || !simpleTicket)
      return [];
    return approvedTicket?.concat(signedTicket, pendingTicket, simpleTicket);
  }, [approvedTicket, signedTicket, pendingTicket, simpleTicket]);

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
    getQuotationRequests.isLoading ||
    getQuotations.isLoading ||
    getPayments.isLoading ||
    signatories.isLoading ||
    myList.isLoading ||
    requestData.isLoading ||
    categoriesData.isLoading ||
    providers.isLoading ||
    getPurchases.isLoading ||
    getPayType.isLoading ||
    getBanks.isLoading
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
    getQuotationRequests.isError ||
    getQuotations.isError ||
    getPayments.isError ||
    signatories.isError ||
    myList.isError ||
    requestData.isError ||
    categoriesData.isError ||
    providers.isError ||
    getPurchases.isError ||
    getPayType.isError ||
    getBanks.isError
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
    getQuotationRequests.isSuccess &&
    getQuotations.isSuccess &&
    getPayments.isSuccess &&
    signatories.isSuccess &&
    myList.isSuccess &&
    requestData.isSuccess &&
    categoriesData.isSuccess &&
    providers.isSuccess &&
    getPurchases.isSuccess &&
    getPayType.isSuccess &&
    getBanks.isSuccess
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
            badgeValue: pendingData.length > 0 ? pendingData.length : undefined,
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
            badgeValue:
              requestToUse.length > 0 ? requestToUse.length : undefined,
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
            badgeValue:
              approbationDevis && approbationDevis.length > 0
                ? approbationDevis?.length
                : undefined,
          },
          {
            pageId: "PG-03-5",
            title: "Bons de commande",
            href: "/tableau-de-bord/commande/bon-de-commande",
            authorized: ["SUPERADMIN", "SALES"],
            badgeValue:
              devisTraite && devisTraite.length > 0
                ? devisTraite?.length
                : undefined,
          },
          {
            pageId: "PG-03-44",
            title: "Approbation BC",
            href: "/tableau-de-bord/commande/bon-de-commande/approbation",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
            badgeValue:
              purchase && purchase.length > 0 ? purchase?.length : undefined,
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
            badgeValue:
              ticketPending && ticketPending.length > 0
                ? ticketPending?.length
                : undefined,
          },
          {
            pageId: "PG-04-02",
            title: "Approvisionnements",
            icon: ArrowLeftRightIcon,
            href: "/tableau-de-bord/ticket/transferts",
            authorized: ["SUPERADMIN", "VOLT_MANAGER"],
            badgeValue:
              filteredTickTransfert && filteredTickTransfert?.length > 0
                ? filteredTickTransfert?.length
                : undefined,
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
            badgeValue:
              approvedTicket &&
              signedTicket &&
              pendingTicket &&
              simpleTicket &&
              approvedTicket?.length +
                signedTicket?.length +
                pendingTicket?.length +
                simpleTicket?.length >
                0
                ? approvedTicket?.length +
                  signedTicket?.length +
                  pendingTicket?.length +
                  simpleTicket?.length
                : undefined,
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
            badgeValue:
              filteredData?.unsignedPayments?.length > 0
                ? filteredData?.unsignedPayments?.length
                : undefined,
          },
          {
            pageId: "PG-0000551-02",
            title: "Transferts",
            icon: VoteIcon,
            href: "/tableau-de-bord/signatures/transferts",
            authorized: [],
            badgeValue:
              transfersToSign.length > 0 ? transfersToSign.length : undefined,
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
            title: "Liste des comptes",
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
              transfersToCheck.length > 0 ? transfersToCheck.length : undefined,
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
                            {item.badgeValue && item.badgeValue > 0 && (
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
