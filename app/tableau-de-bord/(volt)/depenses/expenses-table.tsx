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
  DollarSign,
  Eye,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Bank, BonsCommande,
  PAY_STATUS,
  PAYMENT_TYPES,
  PaymentRequest,
  PRIORITIES,
  RequestType,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import ViewExpense from "./view-expense";
import PayExpense from "./pay-expense";

("paid");
const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
    rowClassName: "bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName: "bg-red-200 text-red-500 outline outline-red-600",
    rowClassName: "bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30",
  },
  paid: {
    label: "paid",
    icon: Coins,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
    rowClassName: "bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/30",
  },
  pending_depense: {
    label: "en attente",
    icon: AlertCircle,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600 ",
    rowClassName:
      "bg-yellow-50 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30",
  },
  cancel: {
    label: "ghost",
    icon: Ban,
    badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
    rowClassName: "bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
  },
};

interface Props {
  payments: Array<PaymentRequest>;
  purchases: Array<BonsCommande>;
  type: "pending" | "validated";
  banks: Array<Bank>;
  requestTypes: Array<RequestType>;
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
    default:
      return { label, variant: "outline" };
  }
}


function ExpensesTable({ payments, purchases, type, banks, requestTypes }: Props) {

  function getTypeBadge(
    type: PaymentRequest["type"]
  ): {
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

    const typeData = requestTypes.find(t => t.type === type);
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
      status: false, // Masque la colonne statut par défaut
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPay, setShowPay] = React.useState<boolean>(false);

  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      config || {
        label: status,
        icon: AlertCircle,
        badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
        rowClassName: "bg-gray-50 dark:bg-gray-950/20",
      }
    );
  };

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        console.log(value.type);
        const type = getTypeBadge(value.type);
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
        const purchase = purchases.find((p) => p.id === value.commandId);
        const title = value.title;
        return (
          <div>
            {purchase?.devi.commandRequest.title ?? value.title ?? "--"}
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
        const purchase = purchases.find((p) => p.id === value.commandId);
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
                disabled={item.status !== "validated"}
                onClick={() => {
                  setSelected(item);
                  setShowPay(true);
                }}
              >
                <DollarSign />
                {"Payer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments, // CORRECTION: 'data' au lieu de 'payments'
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
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label>{"Recherche"}</Label>
            <Input
              placeholder="Référence"
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
                "all" // CORRECTION: 'priority' au lieu de 'priorite'
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
                    {column.id === "createdAt" ?
                      "Date de création" :
                      column.id === "updatedAt" ?
                        "Date de modification" :
                        column.id === "reference" ?
                          "Référence" :
                          column.id === "title" ?
                            "Titre" :
                            column.id === "price" ?
                              "Montant" :
                              column.id === "status" ?
                                "Statut" :
                                column.id === "priority" ?
                                  "Priorité" :
                                  column.id === "provider" ?
                                    "Fournisseur" :
                                    column.id === "type" ?
                                      "Type" :
                                      column.id === "createdAt" ?
                                        "Date de création" :
                                        column.id === "updatedAt" ?
                                          "Date de modification" :
                                          column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Tickets ${type === "pending" ? "en attente" : "payés"} (${payments.length
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
                const status = row.original.status;
                const config = getStatusConfig(status);

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
        <PayExpense
          ticket={selected}
          open={showPay}
          onOpenChange={setShowPay}
          banks={banks} />
      )}
    </div>
  );
}

export default ExpensesTable;
