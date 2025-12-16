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
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  LucidePen,
  MoreHorizontal,
  Search,
  Shield,
  User,
  UserCheck,
  UserX,
  Users,
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
import { UserQueries } from "@/queries/baseModule";
import { Member, Role, User as UserT } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import UpdateUser from "./UpdateUser";

// export type Utilisateur = {
//   id: string;
//   nom: string;
//   role: "admin" | "manager" | "user" | "viewer";
//   statut: "active" | "inactive" | "suspended";
//   derniereConnexion: string;
//   serviceAssocie: string;
// };

interface UtilisateursTableProps {
  data: UserT[];
}

export function UtilisateursTable({ data }: UtilisateursTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<UserT | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3" />;
      case "manager":
        return <Users className="h-3 w-3" />;
      case "user":
        return <User className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500 text-white hover:bg-purple-600";
      case "manager":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "user":
        return "bg-green-500 text-white hover:bg-green-600";
      case "viewer":
        return "bg-gray-500 text-white hover:bg-gray-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "active":
        return <CheckCircle className="h-3 w-3" />;
      case "inactive":
        return <XCircle className="h-3 w-3" />;
      case "suspended":
        return <UserX className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "active":
        return "bg-green-500 text-white hover:bg-green-600";
      case "inactive":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "suspended":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };

  const getRowColor = (statut: string) => {
    switch (statut) {
      case "active":
        return "bg-green-50";
      case "inactive":
        return "bg-gray-50";
      case "suspended":
        return "bg-red-50";
      default:
        return "";
    }
  };

  // fonction pour traduire les Roles
  
  const user = new UserQueries();
  const userMutationData = useMutation({
    mutationKey: ["usersStatus"],
    mutationFn: (data: { id: number; status: string }) =>
      user.changeStatus(data.id, { status: data.status }),
  });

  const userQueries = new UserQueries();
  const userMutation = useMutation({
    mutationKey: ["userUpdate"],
    mutationFn: async (data: number) => userQueries.delete(Number(data)),

    onSuccess: () => {
      toast.success("Besoin modifié avec succès !");
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const columns = React.useMemo<ColumnDef<UserT>[]>(
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
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nom
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Rôle
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const role = row.getValue("role") as Role[];
          return (
            <div className="flex flex-col">
              {role.map((rol) => (
                <Badge
                  className={`${getRoleBadgeColor(
                    rol.label
                  )} flex items-center gap-1 w-fit`}
                  key={rol.id}
                >
                  {getRoleIcon(rol.label)}
                  {rol.label.charAt(0).toUpperCase() + rol.label.slice(1)}
                </Badge>
              ))}
            </div>
          );
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
              Statut
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              className={`${getStatutBadgeColor(
                status
              )} flex items-center gap-1 w-fit`}
            >
              {getStatutIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "members",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Département associé
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const data = row.getValue("members") as Member[];
          return (
            <div>
              {data.map((mem) => {
                return <Badge key={mem.id}>{mem.department?.label}</Badge>;
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "lastConnection",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Dernière connexion
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue("lastConnection"));
          return (
            <div>
              {date.toLocaleDateString("fr-FR")}{" "}
              {date.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Service associé
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        enableHiding: false,
        cell: ({ row }) => {
          const utilisateur = row.original;

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
                  Voir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(utilisateur);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    userMutationData.mutate({
                      id: utilisateur.id ?? -1,
                      status: "active",
                    })
                  }
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activer
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    userMutationData.mutate({
                      id: utilisateur.id ?? -1,
                      status: "inactive",
                    })
                  }
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspendre
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => userMutation.mutate(utilisateur.id ?? -1)}
                >
                  Supprimer
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
      const searchableColumns = ["nom", "serviceAssocie"];
      return searchableColumns.some((column) => {
        const value = row.getValue(column);
        return value
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
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

  const roleFilter =
    (table.getColumn("role")?.getFilterValue() as string) ?? "all";
  const statutFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou département..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) =>
            table
              .getColumn("role")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout les Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MANAGER">Validateur</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="SALES">Responsable Achat</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statutFilter}
          onValueChange={(value) =>
            table
              .getColumn("statut")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>
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
                if (column.id === "select") {
                  text = "Selectionner";
                } else if (column.id === "actions") {
                  text = "Actions";
                } else if (column.id === "name") {
                  text = "Nom";
                } else if (column.id === "role") {
                  text = "Rôle";
                } else if (column.id === "status") {
                  text = "Statut";
                } else if (column.id === "lastConnection") {
                  text = "Dernière connexion";
                } else if (column.id === "members") {
                  text = "Département associé";
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
      <div className="flex items-center gap-2 py-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} row(s) selected
            </span>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </div>
        )}
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
                  className={getRowColor(row.original.status)}
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
      <UpdateUser
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        userData={selectedItem}
      />
    </div>
  );
}
