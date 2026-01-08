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
  LucideEye,
  LucidePen,
  LucideTrash2,
  Users,
} from "lucide-react";
import * as React from "react";

import { badgeVariants } from "@/components/ui/badge";
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
import { DepartmentQueries } from "@/queries/departmentModule";
import { DepartmentT, Member } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import UpdateDepartment from "./UpdateDeprtment";
import { ShowDepartment } from "./show-department";

interface DepartementTableProps {
  data: DepartmentT[];
}

export function DepartementTable({ data }: DepartementTableProps) {
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

  const [selectedItem, setSelectedItem] = React.useState<DepartmentT | null>(
    null
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = React.useState(false);

  const departmentQueries = new DepartmentQueries();
  const departmentMutation = useMutation({
    mutationKey: ["departmentUpdate"],
    mutationFn: async (data: number) => departmentQueries.delete(Number(data)),

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const getBadge = (
    status: string
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    const value = status.toLocaleLowerCase();
    switch (value) {
      case "actif":
        return { label: "Actif", variant: "primary" };
      case "inactive":
        return { label: "Désactivé", variant: "destructive" };
      default:
        return { label: value, variant: "outline" };
    }
  };

  const columns = React.useMemo<ColumnDef<DepartmentT>[]>(
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
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Nom Département"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("label")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Description"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">
            {row.getValue("description")}
          </div>
        ),
      },
      {
        accessorKey: "members",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Chef"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          console.log(row.getValue("members"));
          const members = row.getValue("members") as Member[];
          return (
            <div>
              {members.find((user) => user.chief === true)?.user?.firstName + " " + members.find((user) => user.chief === true)?.user?.lastName || "Non défini"}
            </div>
          );
        },
      },
      {
        accessorKey: "employees",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Nombre d'employés"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {(row.getValue("members") as Member[]).length}
            </span>
          </div>
        ),
      },
      // {
      //   accessorKey: "status",
      //   header: ({ column }) => {
      //     return (
      //       <span
      //         className="tablehead"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         {"Statut"}
      //         <ArrowUpDown />
      //       </span>
      //     );
      //   },
      //   cell: ({ row }) => {
      //     const status = row.getValue("status") as string;
      //     const label = getBadge(status).label;
      //     const variant = getBadge(status).variant;
      //     return (
      //       <Badge
      //         variant={variant}
      //       >
      //         {label}
      //       </Badge>
      //     );
      //   },
      //   filterFn: (row, id, value) => {
      //     return value.includes(row.getValue(id));
      //   },
      // },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const departement = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(departement);
                    setIsShowModalOpen(true);
                  }}
                >
                  <LucideEye className="mr-2 h-4 w-4" />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(departement);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => departmentMutation.mutate(departement.id)}
                >
                  <LucideTrash2 className="mr-2 h-4 w-4 text-red-600" />
                  {"Supprimer"}
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
      const name = row.getValue("name") as string;
      const chef = row.getValue("chef") as string;

      return (
        reference.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search) ||
        chef.toLowerCase().includes(search)
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

  const getRowClassName = (status: string) => {
    switch (status) {
      case "actif":
        return "bg-green-50 hover:bg-green-100";
      case "inactif":
        return "bg-red-50 hover:bg-red-100";
      case "en-reorganisation":
        return "bg-yellow-50 hover:bg-yellow-100";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="rechercher par nom de département..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        {/* <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="en-reorganisation">En réorganisation</SelectItem>
          </SelectContent>
        </Select> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                let text = column.id;
                if (column.id === "label") {
                  text = "Nom Département";
                } else if (column.id === "description") {
                  text = "Description";
                } else if (column.id === "members") {
                  text = "Chef";
                } else if (column.id === "employees") {
                  text = "Nombre d'employés";
                } else if (column.id === "status") {
                  text = "Statut";
                }
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {text}
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
                  className={getRowClassName(row.original.status)}
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
          {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected. */}
          .
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
      <UpdateDepartment
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        departmentData={selectedItem}
      />
      <ShowDepartment
        open={isShowModalOpen}
        onOpenChange={setIsShowModalOpen}
        data={selectedItem}
      />
    </div>
  );
}
