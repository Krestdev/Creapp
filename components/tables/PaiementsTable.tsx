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
  Trash
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
import { BonsCommande, PAY_STATUS, PaymentRequest, PRIORITIES } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { Pagination } from "../base/pagination";
import DetailPaiement from "../modals/detail-paiement";
import { Label } from "../ui/label";
import EditPayment from "@/app/tableau-de-bord/(sales)/commande/paiements/edit-payment";

interface Props {
  payments: Array<PaymentRequest>;
  purchases: Array<BonsCommande>;
}

const getPriorityBadge = (
  priority: PaymentRequest["priority"]
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
  rowClassName?: string;
} => {
  const label = PRIORITIES.find(c => c.value === priority)?.name ?? "Inconnu"
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

function getStatusBadge(status: PaymentRequest["status"]): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
  const statusData = PAY_STATUS.find(s => s.value === status);
  const label = statusData?.name ?? "Inconnu"

  switch (status) {
    case "pending":
      return { label, variant: "amber" };
    case "accepted":
      return { label, variant: "sky" };
    case "rejected":
      return { label, variant: "destructive" };
    case "validated":
      return { label, variant: "sky" };
    case "signed":
      return { label, variant: "lime" };
    case "paid":
      return { label, variant: "success" };
    default:
      return { label, variant: "outline" };
  }
};

export function PaiementsTable({ payments, purchases }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState<boolean>(false);

  const columns: ColumnDef<PaymentRequest>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
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
      accessorKey: "commandId",
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
        const purchase = purchases.find(p => p.id === value.commandId);
        return <div>{purchase?.devi.commandRequest.title ?? "Non défini"}</div>;
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
        return <div>{purchase?.provider?.name ?? "Inconnu"}</div>;
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
        return (
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowUpdateModal(true);
                }}
              >
                <LucidePen />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Reject", item)}>
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
            <Label>{"Priorité"}</Label>
            <Select
              value={
                (table.getColumn("priority")?.getFilterValue() as string) ?? "all" // CORRECTION: 'priority' au lieu de 'priorite'
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
          <div className="grid gap-1.5">
            <Label>{"Statut"}</Label>
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"} // CORRECTION: 'status' au lieu de 'statut'
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Tous"}</SelectItem>
                {PAY_STATUS.map((status) => <SelectItem key={status.value} value={status.value}>{status.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
                    {column.id}
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(getPriorityBadge(row.original.priority)?.rowClassName || "")}
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
        <DetailPaiement
          payment={selected}
          open={showDetail}
          openChange={setShowDetail}
          purchases={purchases}
        />
      )}
      {
        selected && (
          <EditPayment open={showUpdateModal} openChange={setShowUpdateModal} payment={selected} purchases={purchases} />
        )
      }
    </div>
  );
}