"use client";

import * as React from "react";
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
  Eye,
  Trash,
  LucideDownload,
  LucidePen,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailOrder } from "../modals/detail-order";
import { CommandRequestT } from "@/types/types";
import { format } from "date-fns";
import { Pagination } from "../base/pagination";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { fr } from "date-fns/locale";

interface CommandeTableProps {
  data: CommandRequestT[] | undefined;
}

export function CommandeTable({ data }: CommandeTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedOrder, setSelectedOrder] =
    React.useState<CommandRequestT | null>(null);
  const [showOrder, setShowOrder] = React.useState(false);

  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      badgeClassName:
        "bg-yellow-200 text-yellow-500 outline outline-yellow-600",
      rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
    },
    validated: {
      label: "Validated",
      icon: CheckCircle,
      badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
      rowClassName:
        "bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/30",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      badgeClassName: "bg-red-200 text-red-500 outline outline-red-600",
      rowClassName: "bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30",
    },
    "in-review": {
      label: "In Review",
      icon: AlertCircle,
      badgeClassName: "bg-blue-200 text-blue-500 outline outline-blue-600 ",
      rowClassName: "bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
    },
    cancel: {
      // Ajout du statut cancel manquant
      label: "Cancel",
      icon: Ban,
      badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
      rowClassName: "bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
    },
  };

  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    // Retourne une configuration par défaut si le statut n'est pas trouvé
    return (
      config || {
        label: status,
        icon: AlertCircle,
        badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
        rowClassName: "bg-gray-50 dark:bg-gray-950/20",
      }
    );
  };

  const columns: ColumnDef<CommandRequestT>[] = [
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium first-letter:uppercase">{row.getValue("reference")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titre"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="first-letter:uppercase">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date limite"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>{format(row.getValue("dueDate"), "PPP", { locale: fr })}</div>
      ),
    },
    {
      accessorKey: "state",
      filterFn: (row, columnId, filterValue) => {
        return String(row.getValue(columnId)) === String(filterValue);
      },
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statuts"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("state") as string;
        const config = getStatusConfig(status);
        const Icon = config.icon;

        const getTranslatedLabel = (label: string) => {
          const translations: Record<string, string> = {
            Pending: "En attente",
            Validated: "Validé",
            Rejected: "Refusé",
            "In Review": "En révision",
            Cancel: "Annulé",
          };
          return translations[label] || label;
        };

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Icon className="h-3 w-3" />
            {getTranslatedLabel(config.label)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost">
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(item);
                  setShowOrder(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Validate", item)}>
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Reject", item)}>
                <LucideDownload className="mr-2 h-4 w-4" />
                {"Télécharger"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Reject", item)}>
                <Trash color="red" className="mr-2 h-4 w-4" />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.reverse() || [],
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
      const searchableColumns = ["reference", "titre"];
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
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Reference, titre..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              {"Colonnes"}
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
                    {column.id === "reference"
                      ? "Référence"
                      : column.id === "title"
                      ? "Titre"
                      : column.id === "dueDate"
                      ? "Date limite"
                      : column.id === "state"
                      ? "Statut"
                      : null}
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
                  {"Aucun résultat"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}
      <DetailOrder
        open={showOrder}
        onOpenChange={setShowOrder}
        data={selectedOrder}
      />
    </div>
  );
}
