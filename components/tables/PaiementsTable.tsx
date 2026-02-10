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
  ArrowUpDown,
  ChevronDown,
  Eye,
  LucidePen,
  Settings2,
  Trash,
} from "lucide-react";
import * as React from "react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  BonsCommande,
  PAY_STATUS,
  PaymentRequest,
  PRIORITIES,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { Pagination } from "../base/pagination";
import DetailPaiement from "../modals/detail-paiement";
import { Label } from "../ui/label";
import EditPayment from "@/app/tableau-de-bord/(accounting)/factures/paiements/edit-payment";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { toast } from "sonner";
import { paymentQ } from "@/queries/payment";
import { useMutation } from "@tanstack/react-query";
import { ModalWarning } from "../modals/modal-warning";

interface Props {
  payments: Array<PaymentRequest>;
  purchases: Array<BonsCommande>;
}

const getPriorityBadge = (
  priority: PaymentRequest["priority"],
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
  rowClassName?: string;
} => {
  const label = PRIORITIES.find((c) => c.value === priority)?.name ?? "Inconnu";
  switch (priority) {
    case "low":
      return {
        label,
        variant: "amber",
        rowClassName:
          "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30",
      };
    case "medium":
      return {
        label,
        variant: "success",
        rowClassName:
          "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30",
      };
    case "high":
      return {
        label,
        variant: "destructive",
        rowClassName:
          "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30",
      };
    case "urgent":
      return {
        label,
        variant: "primary",
        rowClassName:
          "bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/30",
      };
    default:
      return {
        label: "Inconnu",
        variant: "outline",
        rowClassName:
          "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
      };
  }
};

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const statusData = PAY_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";

  switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "accepted":
      return { label, variant: "sky" };
    case "rejected":
      return { label, variant: "destructive" };
    case "cancelled":
      return { label, variant: "default" };
    case "validated":
      return { label, variant: "sky" };
    case "signed":
      return { label, variant: "lime" };
    case "paid":
      return { label, variant: "success" };
    default:
      return { label, variant: "outline" };
  }
}

export function PaiementsTable({ payments, purchases }: Props) {
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
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState<boolean>(false);
  const [openRejectModal, setOpenRejectModal] = React.useState<boolean>(false);
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | PaymentRequest["status"]
  >("all");
  const [priorityFilter, setPriorityFilter] = React.useState<
    "all" | PaymentRequest["priority"]
  >("all");

  const toReject = useMutation({
    mutationFn: async (data: PaymentRequest) =>
      paymentQ.update(Number(data.id), { status: "cancelled" }),
    onSuccess: () => {
      toast.success("Vous avez annulé une facture avec succès !");
      setOpenRejectModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Préparer les données avec les informations de fournisseur incluses
  const enhancedPayments = React.useMemo(() => {
    return payments.map(payment => {
      const purchase = purchases.find(p => p.id === payment.commandId);
      return {
        ...payment,
        // Ajouter les champs de recherche pour le filtrage global
        providerName: purchase?.provider?.name || "",
        bonCommandeTitle: purchase?.devi.commandRequest.title || "",
      };
    });
  }, [payments, purchases]);

  // Filtrer les données par statut et priorité
  const filteredByStatusAndPriority = React.useMemo(() => {
    let filtered = enhancedPayments;

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(p => p.priority === priorityFilter);
    }

    return filtered;
  }, [enhancedPayments, statusFilter, priorityFilter]);

  const columns: ColumnDef<PaymentRequest & { providerName: string; bonCommandeTitle: string }>[] = [
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
      accessorKey: "bonCommandeTitle",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bon de commande"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        return <div>{row.getValue("bonCommandeTitle")}</div>;
      },
    },
    {
      accessorKey: "providerName",
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
        return <div>{row.getValue("providerName")}</div>;
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
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Priorité"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const priority = getPriorityBadge(value.priority);
        return <Badge variant={priority.variant}>{priority.label}</Badge>;
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
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date de creation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">
          {format(row.getValue("createdAt"), "dd/MM/yyyy")}
        </div>
      ),
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowUpdateModal(true);
                }}
                disabled={item.status !== "pending"}
              >
                <LucidePen />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setOpenRejectModal(true);
                }}
                disabled={item.status !== "pending"}
              >
                <Trash />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredByStatusAndPriority,
    columns: columns as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    // Configuration du filtrage global
    globalFilterFn: (row, columnId, filterValue) => {
      const searchStr = filterValue.toLowerCase();

      // Recherche dans tous les champs pertinents
      const reference = (row.getValue("reference") || "").toString().toLowerCase();
      const bonCommandeTitle = (row.getValue("bonCommandeTitle") || "").toString().toLowerCase();
      const providerName = (row.getValue("providerName") || "").toString().toLowerCase();

      return reference.includes(searchStr) ||
        bonCommandeTitle.includes(searchStr) ||
        providerName.includes(searchStr);
    },
  });

  const resetAllFilters = () => {
    setGlobalFilter("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setColumnFilters([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Settings2 className="mr-2 h-4 w-4" />
              {"Filtres"}
            </Button>
          </SheetTrigger>

          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les filtres pour affiner vos données"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 px-5">
              <div className="space-y-3">
                <Label htmlFor="searchPO">{"Recherche globale"}</Label>
                <Input
                  id="searchPO"
                  type="search"
                  placeholder="Référence, fournisseur, bon de commande..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>{"Priorité"}</Label>
                <Select
                  value={priorityFilter}
                  onValueChange={(v: "all" | PaymentRequest["priority"]) =>
                    setPriorityFilter(v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>{"Statut"}</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as "all" | PaymentRequest["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {PAY_STATUS.filter(s => payments.some(d => d.status === s.value)).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="flex-1"
                >
                  {"Réinitialiser"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Fermer le sheet
                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                  }}
                >
                  {"Appliquer"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Indicateur de filtres actifs */}
        {(statusFilter !== "all" || priorityFilter !== "all" || globalFilter.trim() !== "") && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
            <span className="font-medium">Filtres actifs:</span>
            {statusFilter !== "all" && (
              <Badge variant="outline" className="text-xs">
                Statut: {PAY_STATUS.find(s => s.value === statusFilter)?.name || statusFilter}
              </Badge>
            )}
            {priorityFilter !== "all" && (
              <Badge variant="outline" className="text-xs">
                Priorité: {PRIORITIES.find(p => p.value === priorityFilter)?.name || priorityFilter}
              </Badge>
            )}
            {globalFilter.trim() !== "" && (
              <Badge variant="outline" className="text-xs">
                Recherche: {globalFilter}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-6 text-xs"
            >
              Tout effacer
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              {"Colonnes"}
              <ChevronDown className="ml-2 h-4 w-4" />
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
                      ? "Date de creation"
                      : column.id === "status"
                        ? "Statut"
                        : column.id === "priority"
                          ? "Priorité"
                          : column.id === "price"
                            ? "Montant"
                            : column.id === "bonCommandeTitle"
                              ? "Bon de commande"
                              : column.id === "providerName"
                                ? "Fournisseur"
                                : column.id === "reference"
                                  ? "Référence"
                                  : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    getPriorityBadge(row.original.priority)?.rowClassName || "",
                  )}
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
              ))
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

      {/* Afficher le nombre de résultats filtrés */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {table.getFilteredRowModel().rows.length} résultat{table.getFilteredRowModel().rows.length > 1 ? 's' : ''} sur {payments.length}
        </div>
        <Pagination table={table} />
      </div>

      {selected && (
        <>
          <DetailPaiement
            payment={selected}
            open={showDetail}
            openChange={setShowDetail}
            purchases={purchases}
          />
          <EditPayment
            open={showUpdateModal}
            openChange={setShowUpdateModal}
            payment={selected}
            purchases={purchases}
          />
          <ModalWarning
            open={openRejectModal}
            onOpenChange={setOpenRejectModal}
            title="Annuler la facture"
            description="Êtes-vous sûr de vouloir annuler cette facture ?"
            onAction={() => toReject.mutate(selected)}
            actionText="Annuler"
            variant="error"
          />
        </>
      )}
    </div>
  );
}