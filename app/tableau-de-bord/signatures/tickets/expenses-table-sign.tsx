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
  ArrowUpDown,
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  Coins,
  Eye,
  PenTool,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {
  Bank,
  BonsCommande,
  PAY_STATUS,
  PaymentRequest,
  PayType,
  PRIORITIES,
  RequestType,
  Signatair,
  Transaction,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import ViewExpense from "../../(volt)/depenses/view-expense";
import { useMemo } from "react";
import SignExpense from "./sign-expense";

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
  purchases: Array<BonsCommande>;
  type: "pending" | "validated";
  banks: Array<Bank>;
  requestTypes: Array<RequestType>;
  signatair: Array<Signatair>;
  payType: Array<PayType>;
  transactions: Array<Transaction>
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
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "validated":
      return { label, variant: "sky" };
    case "paid":
      return { label, variant: "success" };
    case "pending_depense":
      return { label, variant: "yellow" };
    case "unsigned":
      return { label, variant: "yellow" };
    case "signed":
      return { label, variant: "blue" };
    default:
      return { label, variant: "outline" };
  }
}

function ExpensesTableSign({
  payments,
  purchases,
  type,
  banks,
  requestTypes,
  signatair,
  payType,
  transactions
}: Props) {
  const { isHydrated, user } = useStore();

  // OPTIMISATION: Pré-calculer les autorisations avec useMemo
  const authorizedPayments = useMemo(() => {
    if (!user || !signatair.length) {
      return [];
    }

    const currentUserId = user.id;

    // Créer une Map pour un accès rapide O(1)
    const signerMap = new Map<string, boolean>();

    signatair.forEach(signer => {
      const key = `${signer.bankId}_${signer.payTypeId}`;
      const hasPermission = signer.user?.some(u => u.id === currentUserId) || false;
      signerMap.set(key, hasPermission);
    });

    // Filtrer les paiements une seule fois
    return payments.filter(payment => {
      const key = `${payment.bankId}_${payment.methodId}`;
      return signerMap.get(key) || false;
    });
  }, [payments, signatair, user]);

  // OPTIMISATION: Créer une Map pour les achats pour un accès rapide
  const purchasesMap = useMemo(() => {
    const map = new Map<number, BonsCommande>();
    purchases.forEach(purchase => {
      map.set(purchase.id, purchase);
    });
    return map;
  }, [purchases]);

  function getTypeBadge(type: PaymentRequest["type"]): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } {
    // Cas spécial
    if (type === "CURRENT") {
      return {
        label: "Dépenses courantes",
        variant: "yellow",
      };
    }

    const typeData = requestTypes.find((t) => t.type === type);
    const label = typeData?.label ?? "Inconnu";

    switch (type) {
      case "facilitation":
        return { label, variant: "lime" };
      case "achat":
        return { label, variant: "sky" };
      case "speciaux":
        return { label, variant: "purple" };
      case "ressource_humaine":
        return { label, variant: "blue" };
      default:
        return { label, variant: "outline" };
    }
  }

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      type: false,
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPay, setShowPay] = React.useState<boolean>(false);

  // OPTIMISATION: Fonction canSign mémoïsée
  const canSign = useMemo(() => {
    if (!user || !signatair.length) {
      return () => false;
    }

    const currentUserId = user.id;
    const signerMap = new Map<string, boolean>();

    signatair.forEach(signer => {
      const key = `${signer.bankId}_${signer.payTypeId}`;
      const hasPermission = signer.user?.some(u => u.id === currentUserId) || false;
      signerMap.set(key, hasPermission);
    });

    return (bankId: number | null, methodId: number | null) => {
      if (bankId == null || methodId == null) {
        return false;
      }
      const key = `${bankId}_${methodId}`;
      return signerMap.get(key) || false;
    };
  }, [signatair, user]);

  const columns: ColumnDef<PaymentRequest>[] = React.useMemo(() => [
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
        const type = getTypeBadge(value.type);
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "payType",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type de document"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        return (
          <div>
            {payType.find((t) => t.id === value.methodId)?.label ?? "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "docNumber",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Numéro de document"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const transaction = transactions.find((t) => t.id === value.transactionId);
        return (
          <div>
            {transaction?.docNumber ?? "--"}
          </div>
        );
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
        const purchase = purchasesMap.get(value.commandId || -1);
        return <div>{purchase?.provider?.name ?? "Creaconsult"}</div>;
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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("createdAt")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const cansign = canSign(item.bankId ?? -1, item.methodId ?? -1);

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
              <DropdownMenuItem
                disabled={!(item.status === "unsigned" && cansign)}
                onClick={() => {
                  setSelected(item);
                  setShowPay(true);
                }}
              >
                <PenTool />
                {"Signer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [canSign, purchasesMap]);

  const table = useReactTable({
    data: authorizedPayments, // Utiliser les paiements pré-filtrés
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
      const searchableColumns = ["reference", "title"];
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
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label>{"Recherche"}</Label>
            <Input
              placeholder="Référence ou titre"
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>{"Type de ticket"}</Label>
            <Select
              value={
                (table.getColumn("type")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("type")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Tous les types"}</SelectItem>
                {requestTypes.map((p) => (
                  <SelectItem key={p.type} value={p.type}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>{"Priorité"}</Label>
            <Select
              value={
                (table.getColumn("priority")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("priority")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Toutes"}</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
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
      <h3>{`Tickets ${type === "pending" ? "en attente" : "payés"} (${authorizedPayments.length
        })`}</h3>
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
                          header.getContext()
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
                          cell.getContext()
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
          purchases={purchases}
        />
      )}
      {selected && (
        <SignExpense
          ticket={selected}
          open={showPay}
          onOpenChange={setShowPay}
        />
      )}
    </div>
  );
}

export default ExpensesTableSign;