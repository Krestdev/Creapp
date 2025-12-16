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
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Eye,
  LucidePen,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Search,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
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
import { ProjectQueries } from "@/queries/projectModule";
import { ProjectT } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import UpdateProject from "./UpdateProject";

// export type Project = {
//   reference: string;
//   project: string;
//   totalBudget: number;
//   budgetLeft: number;
//   chief: string;
//   state: "planning" | "in-progress" | "on-hold" | "completed" | "cancelled";
// };

interface ProjectTableProps {
  data: ProjectT[];
}

export function ProjectTable({ data }: ProjectTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<ProjectT | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const getStateIcon = (status: string) => {
    switch (status) {
      case "planning":
        return <Clock className="h-3 w-3" />;
      case "in-progress":
        return <PlayCircle className="h-3 w-3" />;
      case "on-hold":
        return <PauseCircle className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStateColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-500 hover:bg-blue-600";
      case "in-progress":
        return "bg-green-500 hover:bg-green-600";
      case "on-hold":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "completed":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getRowColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-50";
      case "in-progress":
        return "bg-green-50";
      case "on-hold":
        return "bg-yellow-50";
      case "completed":
        return "bg-emerald-50";
      case "cancelled":
        return "bg-red-50";
      default:
        return "";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const project = new ProjectQueries();
  const projectMutationData = useMutation({
    mutationKey: ["projectsStatus"],
    mutationFn: (data: { id: number; status: string }) =>
      project.update(data.id, { status: data.status }),
  });
  const columns: ColumnDef<ProjectT>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Référence
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("reference")}</div>
        ),
      },
      {
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Project
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => <div>{row.getValue("label")}</div>,
      },
      {
        accessorKey: "budget",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Total Budget
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">
            {formatCurrency(row.getValue("budget"))}
          </div>
        ),
      },
      // {
      //   accessorKey: "budgetLeft",
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         Budget Left
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => {
      //     const budgetLeft = row.getValue("budgetLeft") as number;
      //     const budget = row.original.budget;
      //     const percentage = (budgetLeft / budget) * 100;
      //     const colorClass =
      //       percentage > 50
      //         ? "text-green-600"
      //         : percentage > 20
      //         ? "text-yellow-600"
      //         : "text-red-600";

      //     return (
      //       <div className={`font-medium ${colorClass}`}>
      //         {formatCurrency(budgetLeft)}
      //       </div>
      //     );
      //   },
      // },
      {
        accessorKey: "chief",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Chief
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const chief = row.getValue("chief") as { id: number; name: string };
          return <div>{chief ? chief.name : "Pas de chef"}</div>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              State
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              className={`${getStateColor(
                status
              )} text-white flex items-center gap-1 w-fit`}
            >
              {getStateIcon(status)}
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace("-", " ")}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const project = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(project);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    projectMutationData.mutate({
                      id: project.id ?? -1,
                      status: "Completed",
                    })
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    projectMutationData.mutate({
                      id: project.id ?? -1,
                      status: "on-hold",
                    })
                  }
                >
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Put on Hold
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    projectMutationData.mutate({
                      id: project.id ?? -1,
                      status: "cancelled",
                    })
                  }
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
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
      const search = filterValue.toLowerCase();
      const reference = row.getValue("reference") as string;
      const project = row.getValue("project") as string;
      const chief = row.getValue("chief") as string;

      return (
        reference.toLowerCase().includes(search) ||
        project.toLowerCase().includes(search) ||
        chief.toLowerCase().includes(search)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference, project, or chief..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              State <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[
              "planning",
              "in-progress",
              "on-hold",
              "completed",
              "cancelled",
            ].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={(
                  table.getColumn("status")?.getFilterValue() as string[]
                )?.includes(status)}
                onCheckedChange={(checked) => {
                  const currentFilter =
                    (table.getColumn("status")?.getFilterValue() as string[]) ||
                    [];
                  table
                    .getColumn("status")
                    ?.setFilterValue(
                      checked
                        ? [...currentFilter, status]
                        : currentFilter.filter((s) => s !== status)
                    );
                }}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace("-", " ")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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

      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} row(s) selected
          </span>
          <Button variant="outline" size="sm">
            Bulk Action
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        index < headerGroup.headers.length - 1 ? "border-r" : ""
                      }
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
                  className={getRowColor(row.original.status)}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={
                        index < row.getVisibleCells().length - 1
                          ? "border-r"
                          : ""
                      }
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UpdateProject
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        projectData={selectedItem}
      />
    </div>
  );
}
