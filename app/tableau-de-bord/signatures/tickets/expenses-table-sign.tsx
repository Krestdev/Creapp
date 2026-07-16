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
import { ArrowUpDown, ChevronDown, Ellipsis, Eye, PenTool } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getPaymentTypeBadge, XAF } from "@/lib/utils";
import {
  PAY_STATUS,
  PaymentRequest,
  PayType,
  PRIORITIES,
  ProjectT,
  RequestType,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import ViewExpense from "../../(volt)/depenses/view-expense";
import SignExpense from "./sign-expense";

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

interface Props {
  payments: Array<PaymentRequest>;
  requestTypes: Array<RequestType>;
  payType: Array<PayType>;
  users: Array<User>;
  projects: Array<ProjectT>;
  pagination: { pageIndex: number; pageSize: number };
  paginationOptions: {
    onPaginationChange: (updater: any) => void;
    rowCount: number;
  };
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
  requestTypes,
  payType,
  users,
  projects,
  pagination,
  paginationOptions,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      type: false,
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPay, setShowPay] = React.useState<boolean>(false);

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
        const type = getPaymentTypeBadge({
          type: value.type,
          typeList: requestTypes,
        });
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
          <p className="normal-case">
            {payType.find((t) => t.id === value.methodId)?.label ?? "--"}
          </p>
        );
      },
    },
    {
      accessorKey: "bank",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Banque"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        return <p className="normal-case">{value.bank?.label ?? "--"}</p>;
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
        return (
          <p className="normal-case">{value.transaction?.docNumber ?? "--"}</p>
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
        return value.facture?.command.provider?.name ?? "Creaconsult";
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
            className="tablehead cursor-pointer"
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
        <p className="normal-case">{row.getValue("createdAt")}</p>
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
              <DropdownMenuItem
                disabled={item.status !== "unsigned"}
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
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: payments,
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
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
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
                          : column.id === "bank"
                            ? "Banque"
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
                      <TableCell key={cell.id}>
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
          projects={projects}
          users={users}
          payTypes={payType}
          requestTypes={requestTypes}
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
