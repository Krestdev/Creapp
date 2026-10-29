import useAuthGuard from "@/hooks/useAuthGuard";
import { queryKeys } from "@/lib/query-keys";
import { useStore } from "@/providers/datastore";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import { quotationQ } from "@/queries/quotation";
import { requestQ } from "@/queries/requestModule";
import { transactionQ } from "@/queries/transaction";
import { NavigationGroup } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRightIcon,
  ArrowRightLeftIcon,
  BadgeDollarSignIcon,
  BanknoteIcon,
  BriefcaseBusiness,
  Building2Icon,
  ChartAreaIcon,
  CircleDollarSignIcon,
  CircleUserRoundIcon,
  ClipboardList,
  FileCheckIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LucideIcon,
  ReceiptIcon,
  Settings2Icon,
  SettingsIcon,
  ShoppingCart,
  SignatureIcon,
  TablePropertiesIcon,
  Ticket,
  VoteIcon,
  Wallet,
} from "lucide-react";
import { Sidebar, type ShellNavGroup } from "../shell/sidebar";

// Icône de chaque groupe (affichée quand la sidebar est repliée).
const groupIcons: Record<string, LucideIcon> = {
  "PG-00-00": LayoutDashboardIcon,
  "PG-00": BriefcaseBusiness,
  "PG-02": ClipboardList,
  "PG-03": ShoppingCart,
  "PG-03-07": ReceiptIcon,
  "PG-04": Ticket,
  "PG-91": Wallet,
  "PG-0000551": SignatureIcon,
  "PG-56489713246": LandmarkIcon,
  "PG-0000354650": Building2Icon,
  "PG-10235-01": SettingsIcon,
  "PG-55540665489": CircleUserRoundIcon,
};

function usePendingDepenseCount(
  paymentMethod: "cash" | "chq" | "ov",
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.depensesStats("pending-count", paymentMethod),
    queryFn: () =>
      paymentQ.getDepensesStats({
        paymentMethod,
        amount: 0,
        amountType: "greater",
      }),
    select: (stats) => stats.validated.count,
    enabled,
  });
}

function AppSidebar({
  collapsed,
  onExpand,
  onNavigate,
}: {
  collapsed: boolean;
  onExpand?: () => void;
  onNavigate?: () => void;
}) {
  const { user, isSignataire } = useStore();

  // Utilisation du hook pour la protection globale
  const { userRoles } = useAuthGuard({
    requireAuth: true,
    authorizedRoles: [],
  });

  const pendingRequestApprovalsCount = useQuery({
    queryKey: queryKeys.pendingRequestApprovalsCount,
    queryFn: async () => requestQ.getPendingCount(),
    enabled: !!user,
  });

  const usableRequestsCount = useQuery({
    queryKey: queryKeys.usableRequestsCount,
    queryFn: () => {
      return requestQ.getUsableRequestsCount();
    },
  });

  //Get service requests count
  const serviceRequestsCount = useQuery({
    queryKey: queryKeys.serviceRequestsCount,
    queryFn: () => requestQ.getServiceRequestsCount(),
    enabled: !!user,
  });

  const pendingCommandRequestsCount = useQuery({
    queryKey: queryKeys.pendingCommandRequestsCount,
    queryFn: () => commandRqstQ.getPendingCount(),
    enabled: !!user,
  });

  const pendingApprovalsTransactionsCount = useQuery({
    queryKey: queryKeys.pendingApprovalsTransactionsCount,
    queryFn: () => transactionQ.getApprovePendingCount(),
    enabled: !!user,
  });

  //Get purchase orders pending count
  const purchaseOrdersPendingCount = useQuery({
    queryKey: queryKeys.purchaseOrdersPendingCount,
    queryFn: () => purchaseQ.getPendingCount(),
    enabled: !!user,
  });

  const quotationToAssignCount = useQuery({
    queryKey: queryKeys.quotationToAssignCount,
    queryFn: () => quotationQ.getToAssignCount(),
    enabled: !!user,
  });

  //Volt Pending Count
  const voltPendingCount = useQuery({
    queryKey: queryKeys.voltPendingCount,
    queryFn: () => paymentQ.getVoltPendingCount(),
    enabled: !!user,
  });

  //Pending Depense Count (par moyen de paiement)
  const canSeeDepenses =
    user?.role.some((r) =>
      ["SUPERADMIN", "ACCOUNTANT", "VOLT"].includes(r.label),
    ) ?? false;
  const cashDepenseCount = usePendingDepenseCount("cash", canSeeDepenses);
  const chqDepenseCount = usePendingDepenseCount("chq", canSeeDepenses);
  const ovDepenseCount = usePendingDepenseCount("ov", canSeeDepenses);

  //Payment to Sign
  const paymentsToSignCount = useQuery({
    queryKey: queryKeys.paymentsToSignCount,
    queryFn: () => paymentQ.getPendingToSignCount(),
    enabled: !!user?.signatairs && user.signatairs.length > 0,
  });

  //Pending to Sign transfers count
  const pendingToSignTransfersCount = useQuery({
    queryKey: queryKeys.pendingToSignTransfersCount,
    queryFn: () => transactionQ.getPendingToSignCount(),
    enabled: !!user?.signatairs && user.signatairs.length > 0,
  });

  //Pending transfers count
  const pendingTransfersCount = useQuery({
    queryKey: queryKeys.pendingTransfersCount,
    queryFn: () => transactionQ.getPendingTransfersCount(),
    enabled: !!user,
  });

  if (
    serviceRequestsCount.isLoading ||
    pendingRequestApprovalsCount.isLoading ||
    usableRequestsCount.isLoading ||
    pendingCommandRequestsCount.isLoading ||
    quotationToAssignCount.isLoading ||
    purchaseOrdersPendingCount.isLoading ||
    voltPendingCount.isLoading ||
    pendingApprovalsTransactionsCount.isLoading ||
    paymentsToSignCount.isLoading ||
    pendingToSignTransfersCount.isLoading ||
    pendingTransfersCount.isLoading
  ) {
    return (
      <Sidebar
        groups={[]}
        loading
        collapsed={collapsed}
        onExpand={onExpand}
        onNavigate={onNavigate}
      />
    );
  }

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
          icon: ChartAreaIcon,
          href: "/tableau-de-bord/statistiques-vehicules",
          authorized: ["SUPERADMIN", "ADMIN"],
          title: "Statistiques véhicules",
        },
        /* {
            pageId: "PG-00-02",
            icon: DatabaseIcon,
            href: "/tableau-de-bord/admin",
            authorized: ["SUPERADMIN"],
            title: "Administration",
          }, */
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
          badgeValue: pendingRequestApprovalsCount.data?.data,
        },
        {
          pageId: "PG-02-05",
          title: "Besoins du Service",
          href: "/tableau-de-bord/besoins/service",
          authorized: ["SUPERADMIN", "USER"],
          badgeValue: serviceRequestsCount.data?.data,
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
          badgeValue: usableRequestsCount.data?.data,
        },
        {
          pageId: "PG-03-02",
          title: "Devis",
          href: "/tableau-de-bord/commande/devis",
          authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER"],
        },
        {
          pageId: "PG-03-45",
          title: "Approbation Devis",
          href: "/tableau-de-bord/commande/devis/approbation",
          authorized: ["SUPERADMIN", "SALES_MANAGER"],
          badgeValue: pendingCommandRequestsCount.data?.data,
        },
        {
          pageId: "PG-03-5",
          title: "Bons de commande",
          href: "/tableau-de-bord/commande/bon-de-commande",
          authorized: ["SUPERADMIN", "SALES", "SALES_MANAGER"],
          badgeValue: quotationToAssignCount.data?.data,
        },
        {
          pageId: "PG-03-44",
          title: "Approbation BC",
          href: "/tableau-de-bord/commande/bon-de-commande/approbation",
          authorized: ["SUPERADMIN", "VOLT_MANAGER"],
          badgeValue: purchaseOrdersPendingCount.data?.data,
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
          badgeValue: voltPendingCount.data?.data,
        },
        {
          pageId: "PG-04-02",
          title: "Approvisionnements",
          icon: ArrowLeftRightIcon,
          href: "/tableau-de-bord/ticket/transferts",
          authorized: ["SUPERADMIN", "VOLT_MANAGER"],
          badgeValue: pendingApprovalsTransactionsCount.data?.data,
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
      authorized: ["VOLT", "ACCOUNTANT", "SUPERADMIN"],
      title: "Dépenses",
      className: "text-emerald-800",
      items: [
        {
          pageId: "PG-23354987-00",
          title: "Espèces",
          icon: BanknoteIcon,
          href: "/tableau-de-bord/depenses/especes",
          badgeValue: cashDepenseCount.data,
          authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
        },
        {
          pageId: "PG-23354987-02",
          title: "Chèques",
          icon: FileCheckIcon,
          href: "/tableau-de-bord/depenses/cheques",
          badgeValue: chqDepenseCount.data,
          authorized: ["SUPERADMIN", "ACCOUNTANT", "VOLT"],
        },
        {
          pageId: "PG-23354987-03",
          title: "Ordres de virement",
          icon: BadgeDollarSignIcon,
          href: "/tableau-de-bord/depenses/ordres-de-virement",
          badgeValue: ovDepenseCount.data,
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
          badgeValue: paymentsToSignCount.data?.data,
        },
        {
          pageId: "PG-0000551-02",
          title: "Transferts",
          icon: VoteIcon,
          href: "/tableau-de-bord/signatures/transferts",
          authorized: [],
          badgeValue: pendingToSignTransfersCount.data?.data,
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
          badgeValue: pendingTransfersCount.data?.data,
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

  const groups: ShellNavGroup[] = filteredNavLinks
    .map(({ pageId, title, items }) => ({
      id: pageId,
      title,
      icon: groupIcons[pageId] ?? LayoutDashboardIcon,
      items: items
        .filter((i) => {
          if (i.authorized.length === 0) return true;
          if (i.pageId === "PG-02-05") {
            return typeof user?.serviceUserId === "number";
          }
          return i.authorized.some((role) => userRoles.includes(role));
        })
        .map((i) => ({
          title: i.title,
          href: i.href,
          icon: i.icon,
          badge: i.badgeValue,
        })),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar
      groups={groups}
      collapsed={collapsed}
      onExpand={onExpand}
      onNavigate={onNavigate}
    />
  );
}

export default AppSidebar;
