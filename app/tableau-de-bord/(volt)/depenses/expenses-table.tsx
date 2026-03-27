"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowRightToLine,
  ArrowUpDown,
  AsteriskIcon,
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  Coins,
  DollarSign,
  Download,
  Eye,
  Settings2,
  Signature,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { TabBar } from "@/components/base/TabBar";
import DepenseDocument from "@/components/depense/depenseDoc";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getRequestTypeBadge, XAF } from "@/lib/utils";
import {
  Bank,
  Invoice,
  PaymentRequest,
  PayType,
  PRIORITIES,
  ProjectT,
  Provider,
  RequestModelT,
  RequestType,
  Signatair,
  Transaction,
  User,
} from "@/types/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { VariantProps } from "class-variance-authority";
import { NoticeFile } from "./notice";
import PayExpense from "./pay-expense";
import ShareExpense from "./share-expense";
import ViewExpense from "./view-expense";
import CompleteGas from "./complete-gas";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Configuration des couleurs pour les priorités
const priorityConfig = {
  low: {
    label: "Basse",
    rowClassName: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20",
  },
  medium: {
    label: "Moyenne",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
  },
  high: {
    label: "Haute",
    rowClassName: "bg-red-50 hover:bg-red-100 dark:bg-red-950/20",
  },
  urgent: {
    label: "Urgente",
    rowClassName: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20",
  },
};

// Configuration des statuts (gardé pour les badges si besoin)
const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName: "bg-red-200 text-red-500 outline outline-red-600",
  },
  paid: {
    label: "paid",
    icon: Coins,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
  },
  pending_depense: {
    label: "en attente",
    icon: AlertCircle,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600 ",
  },
  cancel: {
    label: "ghost",
    icon: Ban,
    badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
  },
};

interface Props {
  payments: Array<PaymentRequest>;
  invoices: Array<Invoice>;
  banks: Array<Bank>;
  requestTypes: Array<RequestType>;
  paymentTypes: PayType[];
  providers: Array<Provider>;
  request: RequestModelT[];
  users: Array<User>;
  projects: Array<ProjectT>;
  transactions: Array<Transaction>;
  signataires: Array<Signatair>;
}

function getPriorityBadge(priority: PaymentRequest["priority"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const priorityData = PRIORITIES.find((p) => p.value === priority);
  const label = priorityData?.name ?? "Inconnu";

  switch (priority) {
    case "low":
      return { label, variant: "outline" };
    case "medium":
      return { label, variant: "blue" };
    case "high":
      return { label, variant: "destructive" };
    case "urgent":
      return { label, variant: "purple" };
    default:
      return { label, variant: "outline" };
  }
}

function getPriorityConfig(priority: PaymentRequest["priority"]) {
  const config = priorityConfig[priority as keyof typeof priorityConfig];
  return (
    config || {
      label: "Inconnu",
      rowClassName: "bg-gray-50 dark:bg-gray-950/20",
    }
  );
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const label =
    status === "unsigned"
      ? "En attente de signature"
      : status === "signed"
        ? "Signé"
        : status === "paid"
          ? "Payé"
          : status === "simple_signed"
            ? "Paiement ouvert"
            : "En attente";

  switch (status) {
    case "pending_depense":
      return { label, variant: "yellow" };
    case "unsigned":
      return { label, variant: "teal" };
    case "signed":
      return { label, variant: "lime" };
    case "paid":
      return { label, variant: "success" };
    case "simple_signed":
      return { label, variant: "success" };
    default:
      return { label, variant: "yellow" };
  }
}

function isGasComplete(item: PaymentRequest) {
  return (
    item.type === "gas" &&
    !!item.benefId &&
    !!item.liters &&
    !!item.price &&
    !!item.deadline
  );
}

function ExpensesTable({
  payments,
  invoices,
  banks,
  requestTypes,
  paymentTypes,
  providers,
  request,
  users,
  projects,
  transactions,
  signataires,
}: Props) {
  const types = requestTypes
    .map((x) => {
      return { value: x.type, label: x.label };
    })
    .concat({ value: "CURRENT", label: "Dépenses courantes" });

  // Construction correcte de la liste des bénéficiaires
  const beneficiairesMap = new Map<string, { value: string; label: string }>();

  // Créer un Set des requestIds qui ont des paiements
  const requestIdsWithPayments = new Set(
    payments.filter((x) => x.status === "validated").map((p) => p.requestId),
  );

  // Filtrer les demandes qui ont au moins un paiement
  request
    .filter((req) => requestIdsWithPayments.has(req.id))
    .forEach((req) => {
      // Traiter beneficiaryList
      if (req.beficiaryList?.length) {
        req.beficiaryList.forEach((benef) => {
          if (benef?.id && (benef.firstName || benef.lastName)) {
            const key = benef.id.toString();
            if (!beneficiairesMap.has(key)) {
              beneficiairesMap.set(key, {
                value: key,
                label:
                  `${benef.firstName || ""} ${benef.lastName || ""}`.trim(),
              });
            }
          }
        });
      }

      // Traiter beneficiary (string)
      if (req.beneficiary && req.beneficiary !== "me") {
        const user = users.find((u) => u.id === Number(req.beneficiary));
        if (user?.id) {
          const key = user.id.toString();
          if (!beneficiairesMap.has(key)) {
            beneficiairesMap.set(key, {
              value: key,
              label: `${user.firstName} ${user.lastName}`.trim(),
            });
          }
        }
      }

      // Pour le cas "me"
      if (req.beneficiary === "me" && req.userId) {
        const user = users.find((u) => u.id === req.userId);
        if (user?.id) {
          const key = user.id.toString();
          if (!beneficiairesMap.has(key)) {
            beneficiairesMap.set(key, {
              value: key,
              label: `${user.firstName} ${user.lastName}`.trim(),
            });
          }
        }
      }

      // Traiter benFac.list pour les facilitations
      if (req.benFac?.list?.length) {
        req.benFac.list.forEach((benef) => {
          if (benef?.id && benef.name) {
            const key = benef.id.toString();
            if (!beneficiairesMap.has(key)) {
              beneficiairesMap.set(key, {
                value: key,
                label: benef.name,
              });
            }
          }
        });
      }
    });

  // Convertir la Map en tableau et trier
  const beneficiaires = Array.from(beneficiairesMap.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "true" | "false" | "all"
  >("all");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPay, setShowPay] = React.useState<boolean>(false);
  const [showGas, setShowGas] = React.useState<boolean>(false);
  const [showShare, setShowShare] = React.useState<boolean>(false);
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const [typeFilter, setTypeFilter] = React.useState<
    "all" | PaymentRequest["type"]
  >("all");
  const [beneFilter, setBeneFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<
    "all" | PaymentRequest["priority"]
  >("all");
  const [providerFilter, setProviderFilter] = React.useState<
    "all" | "no-provider" | string
  >("all");
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal"
  >("greater");
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<
    "all" | string
  >("all");
  // States pour les recherches dans les dropdowns
  const [typeSearch, setTypeSearch] = React.useState("");
  const [beneSearch, setBeneSearch] = React.useState("");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [paymentMethodSearch, setPaymentMethodSearch] = React.useState("");

  const resetAllFilters = () => {
    setGlobalFilter("");
    setPriorityFilter("all");
    setTypeFilter("all");
    setBeneFilter("all");
    setAmountFilter(0);
    setAmountTypeFilter("greater");
    setPaymentMethodFilter("all");
    setProviderFilter("all");
  };

  const tabs = [
    {
      id: 0,
      title: "Tickets en attente",
      badge: payments.filter((p) => p.status === "validated").length,
    },
    {
      id: 1,
      title: "Tickets traités",
      badge: payments.filter(
        (p) =>
          p.status === "pending_depense" ||
          p.status === "signed" ||
          p.status === "simple_signed",
      ).length,
    },
    {
      id: 2,
      title: "Tickets payés",
    },
  ];

  const filteredData = React.useMemo(() => {
    return payments.filter((p) => {
      // Filter amount
      const matchAmount =
        amountTypeFilter === "greater"
          ? p.price >= amountFilter
          : amountTypeFilter === "equal"
            ? p.price === amountFilter
            : p.price <= amountFilter;
      //Filter provider
      const matchProvider =
        providerFilter === "all"
          ? true
          : providerFilter === "no-provider"
            ? !p.invoiceId
            : invoices.find((c) => c.id === p.invoiceId)?.command.providerId ===
              Number(providerFilter);
      //Filter tab
      const matchTab =
        selectedTab === 0
          ? p.status === "validated" || p.status === "unsigned"
          : selectedTab === 1
            ? p.status === "pending_depense" ||
              p.status === "signed" ||
              p.status === "simple_signed"
            : p.status === "paid";
      //Filter type
      const matchType = typeFilter === "all" ? true : p.type === typeFilter;
      //Filter priority
      const matchPriority =
        priorityFilter === "all" ? true : p.priority === priorityFilter;
      //Filter payment method
      const matchPaymentMethod =
        paymentMethodFilter === "all"
          ? true
          : String(p.methodId) === paymentMethodFilter;

      // Filter beneficiary - CORRECTION
      const matchBeneficiary = (() => {
        if (beneFilter === "all") return true;
        // Trouver la demande associée à ce paiement
        const requestItem = request.find((r) => r.id === p.requestId);

        if (!requestItem) return false;

        // Fonction utilitaire pour comparer les IDs (normaliser en string)
        const compareIds = (
          id1: string | number | undefined,
          id2: string | number,
        ): boolean => {
          if (id1 === undefined || id2 === undefined) return false;
          return String(id1) === String(id2);
        };

        // Cas où beneficiary === "me" - on filtre sur le userId de la demande
        if (requestItem.beneficiary === "me") {
          const userId = requestItem.userId;
          if (compareIds(userId, beneFilter)) return true;
        }

        // Vérifier si le bénéficiaire est dans beneficiary (string)
        if (requestItem.beneficiary && requestItem.beneficiary !== "me") {
          const beneficiaryId = requestItem.beneficiary;
          if (compareIds(beneficiaryId, beneFilter)) return true;
        }

        // Vérifier si le bénéficiaire est dans beneficiaryList (array)
        if (requestItem.beficiaryList && requestItem.beficiaryList.length > 0) {
          const isInList = requestItem.beficiaryList.some(
            (b) => b.id && compareIds(b.id, beneFilter),
          );
          if (isInList) return true;
        }

        // Vérifier aussi dans benFac.list pour les facilitations
        if (requestItem.benFac?.list && requestItem.benFac.list.length > 0) {
          const isInBenFac = requestItem.benFac.list.some(
            (b) => b.id && compareIds(b.id, beneFilter),
          );
          if (isInBenFac) return true;
        }

        return false;
      })();

      //Filter selected (approvisionnés)
      const matchSelected =
        selectedFilter === "all"
          ? true
          : p.selected === Boolean(selectedFilter);

      return (
        matchTab &&
        matchType &&
        matchPriority &&
        matchAmount &&
        matchProvider &&
        matchPaymentMethod &&
        matchSelected &&
        matchBeneficiary
      );
    });
  }, [
    payments,
    selectedTab,
    priorityFilter,
    typeFilter,
    amountTypeFilter,
    amountFilter,
    providerFilter,
    invoices,
    paymentMethodFilter,
    selectedFilter,
    beneFilter,
    request,
  ]);

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      accessorKey: "reference",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const type = getRequestTypeBadge({ type: value.type, requestTypes });
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titre"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const isSelected = value.selected === true;
        const transactionStatus = isSelected
          ? transactions.find(
              (t) =>
                t.Type === "TRANSFER" &&
                t.payments.some((p) => p.id === value.id) &&
                t.status === "APPROVED",
            )
          : false;
        const invoice = invoices.find((iv) => iv.id === value.invoiceId);
        const title = value.title;
        return (
          <div className="max-w-[500px] flex gap-1.5">
            {!!transactionStatus && (
              <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
                <AsteriskIcon size={16} />
              </span>
            )}
            <span className="line-clamp-1">{value.title ?? "--"}</span>
          </div>
        );
      },
    },
    {
      id: "beneficiary",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bénéficiaire"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const requestItem = request.find((x) => x.id === value.requestId);

        if (!requestItem) return <div>--</div>;

        // Vérifier dans beneficiary (string)
        if (requestItem.beneficiary && requestItem.beneficiary !== "me") {
          const user = users.find(
            (x) => x.id === Number(requestItem.beneficiary),
          );
          if (user) {
            return <div>{`${user.firstName} ${user.lastName}`}</div>;
          }
        }

        // Vérifier dans beneficiaryList (array)
        if (requestItem.beficiaryList && requestItem.beficiaryList.length > 0) {
          const names = requestItem.beficiaryList
            .map((b) => `${b.firstName || ""} ${b.lastName || ""}`.trim())
            .filter((name) => name)
            .join(", ");
          if (names) {
            return <div>{names}</div>;
          }
        }

        return <div>--</div>;
      },
    },
    {
      id: "provider",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const invoice = invoices.find((p) => p.id === value.invoiceId);
        return <div>{invoice?.command.provider.name ?? "--"}</div>;
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Montant"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("price");
        return <div className="font-medium">{XAF.format(Number(value))}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Priorité"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const priority = getPriorityBadge(value.priority);
        return <Badge variant={priority.variant}>{priority.label}</Badge>;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const priorityOrder = {
          low: 1,
          medium: 2,
          high: 3,
          urgent: 4,
        };
        const priorityA =
          priorityOrder[
            rowA.getValue(columnId) as keyof typeof priorityOrder
          ] || 0;
        const priorityB =
          priorityOrder[
            rowB.getValue(columnId) as keyof typeof priorityOrder
          ] || 0;
        return priorityA - priorityB;
      },
      filterFn: (row, id, value) => {
        return value === "" || value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statut"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const status = getStatusBadge(value.status);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date de création"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.createdAt;
        return (
          <div>
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Mise à jour le"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.updatedAt;
        return (
          <div>
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowDetail(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              {item.type === "gas" && (
                <DropdownMenuItem
                  disabled={isGasComplete(item)}
                  onClick={() => {
                    setSelected(item);
                    setShowGas(true);
                  }}
                >
                  <ArrowRightToLine />
                  {"Compléter le paiement"}
                </DropdownMenuItem>
              )}
              {selectedTab === 1 && (
                <>
                  <DropdownMenuItem
                    disabled={
                      item.status !== "pending_depense" &&
                      item.status !== "signed" &&
                      item.status !== "simple_signed"
                    }
                    onClick={() => {
                      setSelected(item);
                      setShowPay(true);
                    }}
                  >
                    <DollarSign />
                    {"Payer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PDFDownloadLink
                      document={
                        <DepenseDocument
                          getPaymentType={paymentTypes}
                          paymentRequest={item}
                          users={users}
                          requests={request}
                          requestTypes={requestTypes}
                        />
                      }
                      fileName={`recu-transport-${item.reference}.pdf`}
                    >
                      {({ loading }) => (
                        <Button
                          disabled={loading}
                          variant={"ghost"}
                          className="font-normal px-0 text-gray-600 bg-transparent hover:bg-transparent h-5"
                        >
                          <Download />
                          {loading
                            ? "Génération du PDF..."
                            : "Télécharger le PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </DropdownMenuItem>
                </>
              )}
              {selectedTab === 0 && (
                <DropdownMenuItem
                  disabled={
                    item.status === "unsigned" ||
                    (item.type === "gas" && !isGasComplete(item))
                  }
                  onClick={() => {
                    setSelected(item);
                    setShowShare(true);
                  }}
                >
                  <Signature />
                  {"Traiter"}
                </DropdownMenuItem>
              )}
              {!!item.invoiceId && (
                <DropdownMenuItem disabled={item.status !== "paid"}>
                  <PDFDownloadLink
                    document={<NoticeFile payment={item} />}
                    fileName={`avis-de-reglement-${item.reference}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        disabled={loading}
                        variant={"ghost"}
                        className="font-normal px-0 text-gray-600 bg-transparent hover:bg-transparent h-5"
                      >
                        {loading ? "Chargement..." : "Télécharger"}
                        <Download />
                      </Button>
                    )}
                  </PDFDownloadLink>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableColumns = ["reference", "provider", "title"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toLowerCase().includes(searchValue);
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
          className="w-fit"
        />
        <div className="flex flex-wrap items-end gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 grid gap-5 mt-4">
                {/* Recherche globale */}
                <div className="grid gap-1.5">
                  <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                  <Input
                    name="search"
                    type="search"
                    id="searchCommand"
                    placeholder="Référence, libellé"
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Type Filter */}
                <div className="grid gap-1.5">
                  <Label>{"Type"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {typeFilter === "all"
                            ? "Tous les types"
                            : types.find((t) => t.value === typeFilter)
                                ?.label || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un type..."
                          className="h-8"
                          value={typeSearch}
                          onChange={(e) => setTypeSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setTypeFilter("all");
                          setTypeSearch("");
                        }}
                        className={typeFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les types</span>
                      </DropdownMenuItem>
                      {types
                        .filter((t) =>
                          t.label
                            .toLowerCase()
                            .includes(typeSearch.toLowerCase()),
                        )
                        .map((t) => (
                          <DropdownMenuItem
                            key={t.value}
                            onClick={() => {
                              setTypeFilter(
                                t.value as "all" | PaymentRequest["type"],
                              );
                              setTypeSearch("");
                            }}
                            className={
                              typeFilter === t.value ? "bg-accent" : ""
                            }
                          >
                            <span className="truncate">{t.label}</span>
                          </DropdownMenuItem>
                        ))}
                      {types.filter((t) =>
                        t.label
                          .toLowerCase()
                          .includes(typeSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun type trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtre bénéficiaires */}
                <div className="grid gap-1.5">
                  <Label>{"Bénéficiaire"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {beneFilter === "all"
                            ? "Tous les bénéficiaires"
                            : beneficiaires.find((b) => b.value === beneFilter)
                                ?.label || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un bénéficiaire..."
                          className="h-8"
                          value={beneSearch}
                          onChange={(e) => setBeneSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setBeneFilter("all");
                          setBeneSearch("");
                        }}
                        className={beneFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les bénéficiaires</span>
                      </DropdownMenuItem>
                      {beneficiaires
                        .filter((b) =>
                          b.label
                            .toLowerCase()
                            .includes(beneSearch.toLowerCase()),
                        )
                        .map((b) => (
                          <DropdownMenuItem
                            key={b.value}
                            onClick={() => {
                              setBeneFilter(b.value);
                              setBeneSearch("");
                            }}
                            className={
                              beneFilter === b.value ? "bg-accent" : ""
                            }
                          >
                            <span className="truncate">{b.label}</span>
                          </DropdownMenuItem>
                        ))}
                      {beneficiaires.filter((b) =>
                        b.label
                          .toLowerCase()
                          .includes(beneSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun bénéficiaire trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Approvisionnés Filter */}
                <div className="grid gap-1.5">
                  <Label>{"Approvisionnés"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {selectedFilter === "all"
                            ? "Tous"
                            : selectedFilter === "true"
                              ? "Paiements approvisionnés"
                              : "Paiements non-approvisionnés"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => setSelectedFilter("all")}
                        className={selectedFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedFilter("true")}
                        className={selectedFilter === "true" ? "bg-accent" : ""}
                      >
                        <span>Paiements approvisionnés</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSelectedFilter("false")}
                        className={
                          selectedFilter === "false" ? "bg-accent" : ""
                        }
                      >
                        <span>Paiements non-approvisionnés</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Priority Filter */}
                <div className="grid gap-1.5">
                  <Label>{"Priorité"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {priorityFilter === "all"
                            ? "Toutes les priorités"
                            : PRIORITIES.find((p) => p.value === priorityFilter)
                                ?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => setPriorityFilter("all")}
                        className={priorityFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Toutes les priorités</span>
                      </DropdownMenuItem>
                      {PRIORITIES.map((p) => (
                        <DropdownMenuItem
                          key={p.value}
                          onClick={() =>
                            setPriorityFilter(
                              p.value as PaymentRequest["priority"],
                            )
                          }
                          className={
                            priorityFilter === p.value ? "bg-accent" : ""
                          }
                        >
                          <span>{p.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Provider Filter */}
                <div className="grid gap-1.5">
                  <Label>{"Fournisseur"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {providerFilter === "all"
                            ? "Tous les fournisseurs"
                            : providerFilter === "no-provider"
                              ? "Sans fournisseur"
                              : providers.find(
                                  (p) => String(p.id) === providerFilter,
                                )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un fournisseur..."
                          className="h-8"
                          value={providerSearch}
                          onChange={(e) => setProviderSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setProviderFilter("all");
                          setProviderSearch("");
                        }}
                        className={providerFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les fournisseurs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setProviderFilter("no-provider");
                          setProviderSearch("");
                        }}
                        className={
                          providerFilter === "no-provider" ? "bg-accent" : ""
                        }
                      >
                        <span>Sans fournisseur</span>
                      </DropdownMenuItem>
                      {providers
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(providerSearch.toLowerCase()),
                        )
                        .map((p) => (
                          <DropdownMenuItem
                            key={p.id}
                            onClick={() => {
                              setProviderFilter(String(p.id));
                              setProviderSearch("");
                            }}
                            className={
                              providerFilter === String(p.id) ? "bg-accent" : ""
                            }
                          >
                            <span className="truncate">{p.name}</span>
                          </DropdownMenuItem>
                        ))}
                      {providers.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(providerSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun fournisseur trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Payment Method Filter */}
                <div className="grid gap-1.5">
                  <Label>{"Moyen de paiement"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {paymentMethodFilter === "all"
                            ? "Tous les moyens"
                            : paymentTypes.find(
                                (p) => String(p.id) === paymentMethodFilter,
                              )?.label || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un moyen..."
                          className="h-8"
                          value={paymentMethodSearch}
                          onChange={(e) =>
                            setPaymentMethodSearch(e.target.value)
                          }
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setPaymentMethodFilter("all");
                          setPaymentMethodSearch("");
                        }}
                        className={
                          paymentMethodFilter === "all" ? "bg-accent" : ""
                        }
                      >
                        <span>Tous les moyens</span>
                      </DropdownMenuItem>
                      {paymentTypes
                        .filter((p) =>
                          p
                            .label!.toLowerCase()
                            .includes(paymentMethodSearch.toLowerCase()),
                        )
                        .map((p) => (
                          <DropdownMenuItem
                            key={p.id}
                            onClick={() => {
                              setPaymentMethodFilter(String(p.id));
                              setPaymentMethodSearch("");
                            }}
                            className={
                              paymentMethodFilter === String(p.id)
                                ? "bg-accent"
                                : ""
                            }
                          >
                            <span className="truncate">{p.label}</span>
                          </DropdownMenuItem>
                        ))}
                      {paymentTypes.filter((p) =>
                        p
                          .label!.toLowerCase()
                          .includes(paymentMethodSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun moyen trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Comparer le montant */}
                <div className="grid gap-1.5">
                  <Label>{"Comparer le montant"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {amountTypeFilter === "greater"
                            ? "Supérieur"
                            : amountTypeFilter === "equal"
                              ? "Égal"
                              : "Inférieur"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("greater")}
                        className={
                          amountTypeFilter === "greater" ? "bg-accent" : ""
                        }
                      >
                        <span>Supérieur</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("equal")}
                        className={
                          amountTypeFilter === "equal" ? "bg-accent" : ""
                        }
                      >
                        <span>Égal</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("inferior")}
                        className={
                          amountTypeFilter === "inferior" ? "bg-accent" : ""
                        }
                      >
                        <span>Inférieur</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Montant */}
                <div className="grid gap-1.5">
                  <Label>{"Montant"}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Ex. 250 000"
                      value={amountFilter ?? 0}
                      onChange={(e) => setAmountFilter(Number(e.target.value))}
                      className="w-full pr-12"
                    />
                    <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                      {"FCFA"}
                    </span>
                  </div>
                </div>

                {/* Bouton pour réinitialiser les filtres */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetAllFilters}
                    className="w-full"
                  >
                    {"Réinitialiser"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                {"Colonnes"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "createdAt"
                        ? "Date de création"
                        : column.id === "updatedAt"
                          ? "Date de modification"
                          : column.id === "reference"
                            ? "Référence"
                            : column.id === "title"
                              ? "Titre"
                              : column.id === "price"
                                ? "Montant"
                                : column.id === "status"
                                  ? "Statut"
                                  : column.id === "priority"
                                    ? "Priorité"
                                    : column.id === "provider"
                                      ? "Fournisseur"
                                      : column.id === "type"
                                        ? "Type"
                                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-r last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const priority = row.original.priority;
                const config = getPriorityConfig(priority);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(config.rowClassName)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r last:border-r-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {"Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {selected && (
        <ViewExpense
          open={showDetail}
          openChange={setShowDetail}
          payment={selected}
          invoices={invoices}
          projects={projects}
          users={users}
          payTypes={paymentTypes}
          requests={request}
          requestTypes={requestTypes}
        />
      )}
      {selected && (
        <>
          <ShareExpense
            ticket={selected}
            open={showShare}
            onOpenChange={setShowShare}
            banks={banks}
            users={users}
            requests={request}
            invoices={invoices}
            requestTypes={requestTypes}
            transactions={transactions}
            signataires={signataires}
            payTypes={paymentTypes}
          />
          <PayExpense
            ticket={selected}
            open={showPay}
            onOpenChange={setShowPay}
            banks={banks}
            transactions={transactions}
          />
          <CompleteGas
            ticket={selected}
            open={showGas}
            onOpenChange={setShowGas}
            users={users}
            requests={request}
            requestTypes={requestTypes}
          />
        </>
      )}
    </div>
  );
}

export default ExpensesTable;
