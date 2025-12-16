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
  LucidePen,
  MoreHorizontal,
} from "lucide-react";
import * as React from "react";

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
import { UserQueries } from "@/queries/baseModule";
import { Role } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import UpdateRole from "../organisation/UpdateRole";
import { Pagination } from "../base/pagination";

interface RolesTableProps {
  data: Role[];
}

export function RoleTable({ data }: RolesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<Role | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const userQueries = new UserQueries();
  const rolesMutation = useMutation({
    mutationKey: ["rolesUpdate"],
    mutationFn: async (data: number) => userQueries.deleteRole(Number(data)),

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const columns = React.useMemo<ColumnDef<Role>[]>(
    () => [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={
      //         table.getIsAllPageRowsSelected() ||
      //         (table.getIsSomePageRowsSelected() && "indeterminate")
      //       }
      //       onCheckedChange={(value) =>
      //         table.toggleAllPageRowsSelected(!!value)
      //       }
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
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          let text = row.getValue("label") as string;
          if (text === "ADMIN") {
            text = "Administrateur";
          } else if (text === "USER") {
            text = "Emetteur";
          } else if (text === "MANAGER") {
            text = "Validateur";
          } else if (text === "SALES") {
            text = "Responsable Achats";
          } else if (text === "SALES_MANAGER") {
            text = "Donner dordres Achats";
          }
          return <div className="font-medium">{text}</div>;
        },
      },
      // {
      //   accessorKey: "description",
      //   header: "Description",
      //   cell: ({ row }) => (
      //     <div className="max-w-[300px] truncate">
      //       {row.getValue("description")}
      //     </div>
      //   ),
      // },
      // {
      //   accessorKey: "members",
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         Chef
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => {
      //     console.log(row.getValue("members"));
      //     const members = row.getValue("members") as Member[];
      //     return (
      //       <div>{members.find((user) => user.chief === true)?.user?.name}</div>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "employees",
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         {"Nombre d'employés"}
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => (
      //     <div className="flex items-center gap-2">
      //       <Users className="h-4 w-4 text-muted-foreground" />
      //       <span className="font-medium">
      //         {(row.getValue("members") as Member[]).length}
      //       </span>
      //     </div>
      //   ),
      // },
      // {
      //   accessorKey: "status",
      //   header: ({ column }) => {
      //     return (
      //       <Button
      //         variant="ghost"
      //         onClick={() =>
      //           column.toggleSorting(column.getIsSorted() === "asc")
      //         }
      //       >
      //         Statut
      //         <ArrowUpDown className="ml-2 h-4 w-4" />
      //       </Button>
      //     );
      //   },
      //   cell: ({ row }) => {
      //     const status = row.getValue("status") as string;
      //     return (
      //       <Badge
      //         variant="outline"
      //         className={
      //           status === "actif"
      //             ? "bg-green-500 text-white border-green-600"
      //             : status === "inactif"
      //             ? "bg-red-500 text-white border-red-600"
      //             : "bg-yellow-500 text-white border-yellow-600"
      //         }
      //       >
      //         {status === "actif" ? (
      //           <CheckCircle className="mr-1 h-3 w-3" />
      //         ) : status === "inactif" ? (
      //           <XCircle className="mr-1 h-3 w-3" />
      //         ) : (
      //           <Clock className="mr-1 h-3 w-3" />
      //         )}
      //         {status === "actif"
      //           ? "Actif"
      //           : status === "inactif"
      //           ? "Inactif"
      //           : "En réorganisation"}
      //       </Badge>
      //     );
      //   },
      //   filterFn: (row, id, value) => {
      //     return value.includes(row.getValue(id));
      //   },
      // },
      // {
      //   id: "actions",
      //   header: "Actions",
      //   enableHiding: false,
      //   cell: ({ row }) => {
      //     const departement = row.original;

      //     return (
      //       <DropdownMenu>
      //         <DropdownMenuTrigger asChild>
      //           <Button variant="ghost" className="h-8 w-8 p-0">
      //             <span className="sr-only">Open menu</span>
      //             <MoreHorizontal className="h-4 w-4" />
      //           </Button>
      //         </DropdownMenuTrigger>
      //         <DropdownMenuContent align="end">
      //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
      //           <DropdownMenuItem>Voir</DropdownMenuItem>
      //           <DropdownMenuSeparator />
      //           <DropdownMenuItem
      //             onClick={() => {
      //               setSelectedItem(departement);
      //               setIsUpdateModalOpen(true);
      //             }}
      //           >
      //             <LucidePen className="mr-2 h-4 w-4" />
      //             {"Modifier"}
      //           </DropdownMenuItem>
      //           <DropdownMenuItem
      //             className="text-red-600"
      //             onClick={() => rolesMutation.mutate(departement.id)}
      //           >
      //             Supprimer
      //           </DropdownMenuItem>
      //         </DropdownMenuContent>
      //       </DropdownMenu>
      //     );
      //   },
      // },
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
        {/* <Input
          placeholder="rechercher par nom..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        /> */}
        {/* <Select
          value={
            (table.getColumn("label")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("label")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
                  className={getRowClassName("default")}
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
      <Pagination table={table} />
      <UpdateRole
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        departmentData={selectedItem}
      />
    </div>
  );
}
