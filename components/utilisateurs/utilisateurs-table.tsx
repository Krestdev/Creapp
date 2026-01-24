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
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  LucidePen,
  LucideX,
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
import { userQ } from "@/queries/baseModule";
import { Role, User as UserT } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import UpdateUser from "./UpdateUser";
import { ShowUser } from "./show-user";
import { TranslateRole } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { ModalWarning } from "../modals/modal-warning";
import { format } from "date-fns";
import UpdatePassword from "./updatePassword";
import { signatairQ } from "@/queries/signatair";

interface UtilisateursTableProps {
  data: UserT[];
}

export function UtilisateursTable({ data }: UtilisateursTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ createdAt: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<UserT | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const signataireData = useQuery({
    queryKey: ["signatairs"],
    queryFn: () => signatairQ.getAll(),
  });

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

  const getStatutIcon = (statut: boolean) => {
    switch (statut) {
      case true:
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatutBadgeColor = (statut: boolean) => {
    switch (statut) {
      case true:
        return "bg-green-500 text-white hover:bg-green-600";
      default:
        return "bg-yellow-500 text-white hover:bg-yellow-600";
    }
  };

  const getRowColor = (statut: boolean) => {
    switch (statut) {
      case true:
        return "bg-green-50";
      default:
        return "bg-yellow-50";
    }
  };

  const TranslateStatus = (statut: boolean) => {
    switch (statut) {
      case true:
        return "Vérifié";
      default:
        return "Non vérifié";
    }
  };

  const { user } = useStore();

  const userMutationData = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      userQ.changeStatus(data.id, { status: data.status }),
    onSuccess: () => {
      toast.success("Statut mis à jour avec succès !");
    },
  });

  const userMutation = useMutation({
    mutationFn: async (data: number) => userQ.delete(Number(data)),

    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès !");
    },

    onError: (e) => {
      console.error(e);
      toast.error("Une erreur est survenue lors de la suppression.");
    },
  });

  const capitalizeFirstName = (value: string) =>
    value
      .toLocaleLowerCase("fr-FR")
      .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr-FR"));

  const formatFullName = (lastName: string, firstName: string) =>
    `${lastName.toLocaleUpperCase("fr-FR")} ${capitalizeFirstName(firstName)}`;

  const columns = React.useMemo<ColumnDef<UserT>[]>(
    () => [
      // Colonne unique pour Nom & Prénom
      {
        id: "fullName",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer select-none flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Utilisateur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        ),

        accessorFn: (row) => formatFullName(row.lastName, row.firstName),

        cell: ({ row }) => {
          const fullName = row.getValue("fullName") as string;
          return <div className="font-medium">{fullName}</div>;
        },

        sortingFn: (rowA, rowB) => {
          const nameA = formatFullName(
            rowA.original.lastName,
            rowA.original.firstName,
          );
          const nameB = formatFullName(
            rowB.original.lastName,
            rowB.original.firstName,
          );

          return nameA.localeCompare(nameB, "fr", {
            sensitivity: "base",
          });
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("email")}</div>
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
              Rôles
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const role = row.getValue("role") as Role[];
          return (
            <div className="flex flex-wrap max-w-[350px] gap-1">
              {role?.map((rol) => {
                return (
                  <Badge
                    className={`${getRoleBadgeColor(
                      rol.label,
                    )} flex items-center gap-1 w-fit`}
                    key={rol.id}
                  >
                    {getRoleIcon(rol.label)}
                    {TranslateRole(
                      rol.label.charAt(0).toUpperCase() + rol.label.slice(1),
                    )}
                  </Badge>
                );
              })}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;

          const roles = row.getValue(columnId) as Role[];
          return roles?.some((role) =>
            role.label.toLowerCase().includes(filterValue.toLowerCase()),
          );
        },
      },
      {
        accessorKey: "verified",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Vérification"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("verified") as boolean;
          return (
            <Badge
              className={`${getStatutBadgeColor(
                status,
              )} flex items-center gap-1 w-fit`}
            >
              {getStatutIcon(status)}
              {TranslateStatus(status)}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (
            filterValue === undefined ||
            filterValue === "" ||
            filterValue === "all"
          ) {
            return true;
          }

          // Convertir la valeur de filtre en booléen
          const filterBool =
            typeof filterValue === "string"
              ? filterValue === "true"
              : Boolean(filterValue);

          return row.getValue(columnId) === filterBool;
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
              Statut compte
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={status === "active" ? "success" : "destructive"}>
              {status === "active" ? <Check /> : <LucideX />}
              {status === "active" ? "Actif" : "Suspendu"}
            </Badge>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true;
          return row.getValue(columnId) === filterValue;
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
          const dateValue = row.getValue("lastConnection");
          if (!dateValue)
            return <div className="text-muted-foreground">Jamais</div>;

          const date = new Date(dateValue as string);
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
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Date d'ajout"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const dateValue = row.getValue("createdAt");
          if (!dateValue) return <div className="text-muted-foreground">-</div>;

          const date = new Date(dateValue as string);
          return <div>{format(date, "dd/MM/yyyy")}</div>;
        },
      },
      {
        id: "actions",
        header: () => <span className="tablehead">Action</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const utilisateur = row.original;

          const isSignataire = signataireData.data?.data
            ?.flatMap((x) => x.user)
            .some((u) => u?.id === utilisateur.id);

          // si l'utilisateur est signataire, on ne peut pas le supprimer ou suspendre

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(utilisateur);
                    setIsDetailModalOpen(true);
                  }}
                >
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
                  onClick={() => {
                    setSelectedItem(utilisateur);
                    setIsUpdatePasswordModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  Modifier le mot de passe
                </DropdownMenuItem>
                {utilisateur.status === "inactive" ? (
                  <DropdownMenuItem
                    onClick={() =>
                      userMutationData.mutate({
                        id: utilisateur.id ?? -1,
                        status: "active",
                      })
                    }
                    disabled={utilisateur.status !== "inactive"}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activer
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      if (isSignataire) {
                        toast.error(
                          "Vous ne pouvez pas suspendre un signataire.",
                        );
                        return;
                      }
                      userMutationData.mutate({
                        id: utilisateur.id ?? -1,
                        status: "inactive",
                      });
                    }}
                    disabled={
                      utilisateur.status === "inactive" ||
                      utilisateur.id === user?.id
                    }
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Suspendre
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    if (isSignataire) {
                      toast.error(
                        "Vous ne pouvez pas supprimer un signataire.",
                      );
                      return;
                    }
                    setSelectedItem(utilisateur);
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={utilisateur.id === user?.id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [user?.id, userMutation, userMutationData],
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
    globalFilterFn: (row, _, filterValue) => {
      if (!filterValue) return true;

      const searchValue = filterValue.toLowerCase();
      const user = row.original;

      // Recherche dans le nom complet
      const fullName = `${user.lastName} ${user.firstName}`.toLowerCase();

      // Recherche dans les autres champs
      const searchFields = [fullName, user.email.toLowerCase()];

      // Recherche dans les rôles
      const roleNames =
        user.role?.map((r) => TranslateRole(r.label?.toLowerCase() || "")) ||
        [];

      // Vérifier si le terme de recherche correspond à n'importe quel champ
      return [...searchFields, ...roleNames].some((field) =>
        field.includes(searchValue),
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

  // Récupérer la valeur du filtre de statut
  const statusFilter =
    (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  // Récupérer la valeur du filtre de vérification
  const verifiedFilterValue = table.getColumn("verified")?.getFilterValue();

  // Déterminer la valeur pour le Select
  const verifiedSelectValue = React.useMemo(() => {
    if (
      verifiedFilterValue === undefined ||
      verifiedFilterValue === "" ||
      verifiedFilterValue === "all"
    ) {
      return "all";
    }

    // Si c'est un booléen, convertir en string
    if (typeof verifiedFilterValue === "boolean") {
      return verifiedFilterValue ? "true" : "false";
    }

    // Si c'est une string, vérifier son contenu
    if (typeof verifiedFilterValue === "string") {
      return verifiedFilterValue === "true" ? "true" : "false";
    }

    return "all";
  }, [verifiedFilterValue]);

  // Gestion des succès
  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou rôle..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-full md:max-w-sm"
          />
        </div>
        <Select
          value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table
              .getColumn("role")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les Rôles"}</SelectItem>
            {uniqueRoles.map((role) => (
              <SelectItem key={role} value={role.toLowerCase()}>
                {TranslateRole(role.charAt(0).toUpperCase() + role.slice(1))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Statut compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les statuts"}</SelectItem>
            <SelectItem value="active">{"Actif"}</SelectItem>
            <SelectItem value="inactive">{"Suspendu"}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={verifiedSelectValue}
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("verified")?.setFilterValue(undefined);
            } else {
              // Toujours passer un booléen au filtre
              table.getColumn("verified")?.setFilterValue(value === "true");
            }
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Vérification email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les états"}</SelectItem>
            <SelectItem value="true">{"Vérifié"}</SelectItem>
            <SelectItem value="false">{"Non vérifié"}</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              {"Colonnes"} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                let text = column.id;
                if (column.id === "fullName") text = "Nom & Prénom";
                else if (column.id === "email") text = "Email";
                else if (column.id === "role") text = "Rôles";
                else if (column.id === "verified") text = "Vérification";
                else if (column.id === "status") text = "Statut compte";
                else if (column.id === "createdAt") text = "Date d'ajout";
                else if (column.id === "lastConnection")
                  text = "Dernière connexion";

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

      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between gap-2 py-2">
          <span className="text-sm text-muted-foreground">
            {`${table.getFilteredSelectedRowModel().rows.length} utilisateur(s)
            sélectionné(s)`}
          </span>
          <Button variant="outline" size="sm">
            {"Actions groupées"}
          </Button>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-r last:border-r-0 bg-muted/50"
                    >
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
                  className={getRowColor(row.original.verified!)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r last:border-r-0"
                    >
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
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination table={table} />
      </div>

      {selectedItem && (
        <>
          <UpdateUser
            open={isUpdateModalOpen}
            setOpen={setIsUpdateModalOpen}
            userData={selectedItem}
            onSuccess={handleUpdateSuccess}
          />
          <UpdatePassword
            open={isUpdatePasswordModalOpen}
            setOpen={setIsUpdatePasswordModalOpen}
            userData={selectedItem}
            onSuccess={handleUpdateSuccess}
          />
          <ShowUser
            open={isDetailModalOpen}
            onOpenChange={setIsDetailModalOpen}
            user={selectedItem}
          />
          <ModalWarning
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            title="Supprimer l'utilisateur"
            description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            message="Supprimer cet utilisateur entrainera la perte de ses roles dans le processus de l'application. Cette action est irréversible."
            variant="error"
            onAction={() => userMutation.mutate(selectedItem?.id ?? -1)}
          />
        </>
      )}
    </div>
  );
}
