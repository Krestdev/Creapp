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
  Eye,
  LucidePen,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import UpdateUser from "./UpdateUser";

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

  // Récupérer les rôles uniques des utilisateurs pour les options du filtre
  const uniqueRoles = React.useMemo(() => {
    const allRoles: string[] = [];

    data.forEach((user) => {
      if (user.role && Array.isArray(user.role)) {
        user.role.forEach((role) => {
          if (role.label && !allRoles.includes(role.label)) {
            allRoles.push(role.label);
          }
        });
      }
    });

    // Trier les rôles par ordre alphabétique
    return allRoles.sort((a, b) => a.localeCompare(b));
  }, [data]);

  // Récupérer les statuts uniques pour les options du filtre
  const uniqueStatuses = React.useMemo(() => {
    const allStatuses: string[] = [];

    data.forEach((user) => {
      if (user.status && !allStatuses.includes(user.status)) {
        allStatuses.push(user.status);
      }
    });

    return allStatuses.sort((a, b) => a.localeCompare(b));
  }, [data]);

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

  const TranslateStatus = (statut: string) => {
    switch (statut) {
      case "active":
        return "Actif";
      case "inactive":
        return "Inactif";
      case "suspended":
        return "Suspendu";
      default:
        return "Inconnu";
    }
  };

  const queryClient = useQueryClient();
  const user = new UserQueries();
  const userMutationData = useMutation({
    mutationKey: ["usersStatus"],
    mutationFn: (data: { id: number; status: string }) =>
      user.changeStatus(data.id, { status: data.status }),
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["usersList"],
        refetchType: "active",
      });
    }
  });

  const userQueries = new UserQueries();
  const userMutation = useMutation({
    mutationKey: ["userUpdate"],
    mutationFn: async (data: number) => userQueries.delete(Number(data)),

    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["usersList"],
        refetchType: "active",
      });
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const columns = React.useMemo<ColumnDef<UserT>[]>(
    () => [
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
            <div className="flex flex-wrap max-w-[300px] gap-1">
              {role.map((rol) => {
                return(
                <Badge
                  className={`${getRoleBadgeColor(
                    rol.label
                  )} flex items-center gap-1 w-fit`}
                  key={rol.id}
                >
                  {getRoleIcon(rol.label)}
                  {TranslateRole(rol.label.charAt(0).toUpperCase() + rol.label.slice(1))}
                </Badge>
              )})}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;

          const roles = row.getValue(columnId) as Role[];
          return roles.some((role) =>
            role.label.toLowerCase().includes(filterValue.toLowerCase())
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
              {TranslateStatus(status.charAt(0) + status.slice(1))}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;
          const status = row.getValue(columnId) as string;
          return status.toLowerCase().includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "members",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              className="bg-transparent max-w-[200px]"
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
            <div className="flex flex-wrap max-w-[150px] gap-1">
              {data.map((mem) => (
                <Badge key={mem.id} variant="outline">
                  {mem.department?.label}
                </Badge>
              ))}
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
        header: () => <span className="tablehead">Action</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const utilisateur = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  Actions
                  <ChevronDown />
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
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    userMutationData.mutate({
                      id: utilisateur.id ?? -1,
                      status: "active",
                    })
                  }
                  disabled={utilisateur.status === "active"}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {"Activer"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    userMutationData.mutate({
                      id: utilisateur.id ?? -1,
                      status: "inactive",
                    })
                  }
                  disabled={utilisateur.status === "inactive"}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {"Suspendre"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => userMutation.mutate(utilisateur.id ?? -1)}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
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
      if (!filterValue) return true;

      const searchValue = filterValue.toLowerCase();
      const name = row.getValue("name") as string;
      const members = row.getValue("members") as Member[];

      // Recherche dans le nom
      if (name?.toLowerCase().includes(searchValue)) return true;
      // Recherche dans les départements
      if (
        members?.some((member) =>
          member.department?.label?.toLowerCase().includes(searchValue)
        )
      )
        return true;

      return false;
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

  const TranslateRole = (role: string) => {
    switch (role) {
      case "USER":
        return "Emetteur";
      case "MANAGER":
        return "Manager";
      case "SALES":
        return "Responsable d'achat";
      case "SALES_MANAGER":
        return "Donneur d'ordre d'achat";
      case "ADMIN":
        return "Administrateur";
      default:
        return role;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom et département..."
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
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les Rôles</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role.toLowerCase()}>
                {TranslateRole(role.charAt(0).toUpperCase() + role.slice(1))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statutFilter}
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
            <SelectItem value="all">Tous les Statuts</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status.toLowerCase()}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
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
                if (column.id === "name") text = "Nom";
                else if (column.id === "role") text = "Rôle";
                else if (column.id === "status") text = "Statut";
                else if (column.id === "lastConnection")
                  text = "Dernière connexion";
                else if (column.id === "members") text = "Département associé";
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
              {table.getFilteredSelectedRowModel().rows.length} ligne(s)
              sélectionnée(s)
            </span>
            <Button variant="outline" size="sm">
              Actions groupées
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
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
      <UpdateUser
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        userData={selectedItem}
      />
    </div>
  );
}
