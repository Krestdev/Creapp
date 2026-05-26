"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationOptions,
  PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Ellipsis,
  Eye,
  LucidePen,
  Settings2,
  Trash,
} from "lucide-react";
import * as React from "react";

import EditPayment from "@/app/tableau-de-bord/(accounting)/factures/paiements/edit-payment";
import EditPaymentMethod from "@/app/tableau-de-bord/(accounting)/factures/paiements/edit-payment-method";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, subText, XAF } from "@/lib/utils";
import { paymentQ } from "@/queries/payment";
import { PAY_STATUS, PaymentRequest, PRIORITIES } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import DetailPaiement from "../modals/detail-paiement";
import { ModalWarning } from "../modals/modal-warning";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import PaymentFilters, {
  PaymentFiltersProps,
} from "@/app/tableau-de-bord/(accounting)/factures/paiements/paymentFilters";

interface Props {
  payments: Array<PaymentRequest>;
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  filters: PaymentFiltersProps;
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
  const label = statusData?.name ?? status;

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

export function PaiementsTable({
  payments,
  pagination,
  paginationOptions,
  filters,
}: Props) {
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
  const [updateMethod, setUpdateMethod] = React.useState<boolean>(false);

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
        <p className="normal-case">{row.getValue("reference")}</p>
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
        const value = row.original;
        const purchase = value.facture?.command;
        return subText({
          text: purchase?.devi.commandRequest.title ?? "--",
          length: 21,
        });
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
        const value = row.original;
        const providerName = value.facture?.command.provider.name ?? "--";
        return providerName;
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
        return <p className="normal-case">{XAF.format(Number(value))}</p>;
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
        <p className="normal-case">
          {format(row.getValue("createdAt"), "dd/MM/yyyy")}
        </p>
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
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
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
                  setUpdateMethod(true);
                }}
                disabled={
                  item.status !== "pending" &&
                  item.status !== "validated" &&
                  item.status !== "accepted"
                }
              >
                <LucidePen />
                {"Modifier la méthode de paiement"}
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
    data: payments,
    columns: columns as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    ...paginationOptions,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    // Configuration du filtrage global
    globalFilterFn: (row, columnId, filterValue) => {
      const searchStr = filterValue.toLowerCase();

      // Recherche dans tous les champs pertinents
      const reference = (row.getValue("reference") || "")
        .toString()
        .toLowerCase();
      const bonCommandeTitle = (row.getValue("bonCommandeTitle") || "")
        .toString()
        .toLowerCase();
      const providerName = (row.getValue("providerName") || "")
        .toString()
        .toLowerCase();

      return (
        reference.includes(searchStr) ||
        bonCommandeTitle.includes(searchStr) ||
        providerName.includes(searchStr)
      );
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Rechercher..."
            value={filters.customFilters.search}
            onChange={(e) =>
              filters.setCustomFilters({
                ...filters.customFilters,
                search: e.target.value,
              })
            }
            className="w-full sm:w-[250px] h-9"
          />
          <Sheet>
            <SheetTrigger asChild className="w-fit">
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent className="px-3">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <PaymentFilters
                customFilters={filters.customFilters}
                setCustomFilters={filters.setCustomFilters}
                isCustomDateModalOpen={filters.isCustomDateModalOpen}
                setIsCustomDateModalOpen={filters.setIsCustomDateModalOpen}
                providers={filters.providers}
                setDateFilter={filters.setDateFilter}
                resetAllFilters={filters.resetAllFilters}
              />
            </SheetContent>
          </Sheet>
        </div>
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
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
      <Pagination table={table} />

      {selected && (
        <>
          <DetailPaiement
            payment={selected}
            open={showDetail}
            openChange={setShowDetail}
          />
          <EditPayment
            open={showUpdateModal}
            openChange={setShowUpdateModal}
            payment={selected}
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
          <EditPaymentMethod
            open={updateMethod}
            openChange={setUpdateMethod}
            payment={selected}
          />
        </>
      )}
    </div>
  );
}
