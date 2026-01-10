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
  AlertTriangle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Eye,
  LucidePen,
  Search,
  Trash2,
} from "lucide-react";
import * as React from "react";

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
import { Provider } from "@/types/types";
import { Pagination } from "../base/pagination";
import { Badge } from "../ui/badge";
import UpdateProvider from "./UpdateProvider";
import { ShowProvider } from "./show-provider";
import { providerQ } from "@/queries/providers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalWarning } from "../modals/modal-warning";

interface ProvidersTableProps {
  data: Provider[];
}

export function ProviderTable({ data }: ProvidersTableProps) {
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

  const [selectedItem, setSelectedItem] = React.useState<Provider | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [openWarning, SetOpenWarning] = React.useState(false);

  // États pour les filtres
  const [regimeFilter, setRegimeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const queryClient = useQueryClient();

  const providerMutation = useMutation({
    mutationKey: ["providerUpdate"],
    mutationFn: (id: number) => providerQ.delete(id),
    onSuccess: () => {
      toast.success("Fournisseur supprimé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["providersList"] });
    },
  });

  // Extraire les régimes uniques des fournisseurs
  const uniqueRegimes = React.useMemo(() => {
    const regimes = data
      .map((provider) => provider.regem)
      .filter(
        (regime): regime is string =>
          regime !== undefined && regime !== null && regime.trim() !== ""
      );

    // Supprimer les doublons et trier par ordre alphabétique
    return [...new Set(regimes)].sort();
  }, [data]);

  // Fonction pour vérifier les informations du fournisseur
  const checkProviderInfo = (provider: Provider): "complet" | "incomplet" => {
    const allFields = [
      provider.name,
      provider.email,
      provider.address,
      provider.phone,
      provider.regem,
      provider.RCCM,
      provider.NIU,
      provider.carte_contribuable,
      provider.acf,
      provider.plan_localisation,
      provider.commerce_registre,
      provider.banck_attestation,
    ];

    return allFields.every(
      (field) => typeof field === "string" && field.trim() !== ""
    )
      ? "complet"
      : "incomplet";
  };

  // Données filtrées
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtre par recherche globale
    if (globalFilter) {
      filtered = filtered.filter((provider) => {
        const searchableFields = ["name", "email", "phone", "address", "regem"];
        return searchableFields.some((field) => {
          const value = provider[field as keyof Provider];
          return value
            ?.toString()
            .toLowerCase()
            .includes(globalFilter.toLowerCase());
        });
      });
    }

    // Filtre par régime
    if (regimeFilter !== "all") {
      filtered = filtered.filter((provider) => provider.regem === regimeFilter);
    }

    // Filtre par statut (complet/incomplet)
    if (statusFilter !== "all") {
      filtered = filtered.filter((provider) => {
        const status = checkProviderInfo(provider);
        return status === statusFilter;
      });
    }

    return filtered;
  }, [data, globalFilter, regimeFilter, statusFilter]);

  const translateColumns = (columnId: string) => {
    const translations: { [key: string]: string } = {
      name: "Nom (Entreprise)",
      address: "Adresse",
      phone: "Téléphone",
      email: "Email",
      regem: "Régime",
      completionStatus: "Statut",
      actions: "Actions",
    };
    return translations[columnId] || columnId;
  };

  const columns = React.useMemo<ColumnDef<Provider>[]>(
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
              Nom (Entreprise)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium uppercase">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "regem",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Régime
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const regime = row.getValue("regem") as string;
          return (
            <div className="font-medium">
              {regime || (
                <span className="text-muted-foreground">Non spécifié</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Addresse
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("address")}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Téléphone
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("phone")}</div>
        ),
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
        id: "completionStatus",
        accessorFn: (row) => checkProviderInfo(row),
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Statut"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = checkProviderInfo(row.original);
          return (
            <div className="font-medium">
              <Badge variant={status === "complet" ? "success" : "amber"}>
                {status === "complet" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {status === "complet" ? "Complet" : "Incomplet"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const provider = row.original;

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
                    setSelectedItem(provider);
                    setOpenUpdate(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(provider);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(provider);
                    SetOpenWarning(true);
                  }}
                  className="text-destructive"
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
    data: filteredData,
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
      const searchableColumns = ["name", "email", "phone", "address", "regem"];
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

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setRegimeFilter("all");
    setStatusFilter("all");
    setGlobalFilter("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* Recherche existante */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-8 w-[250px]"
          />
        </div>

        {/* Filtre par régime */}
        <Select value={regimeFilter} onValueChange={setRegimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les régimes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les régimes"}</SelectItem>
            {uniqueRegimes.map((regime) => (
              <SelectItem key={regime} value={regime}>
                {regime}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les statuts"}</SelectItem>
            <SelectItem value="complet">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="h-4 w-4 p-0">
                  <Check className="h-3 w-3" />
                </Badge>
                {"Complet"}
              </div>
            </SelectItem>
            <SelectItem value="incomplet">
              <div className="flex items-center gap-2">
                <Badge variant="amber" className="h-4 w-4 p-0">
                  <AlertTriangle className="h-3 w-3" />
                </Badge>
                {"Incomplet"}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Menu des colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
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
                    {translateColumns(column.id)}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Reste du code inchangé */}
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
                  Aucun résultat trouvé avec les filtres actuels
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      <UpdateProvider
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        providerData={selectedItem}
      />
      <ShowProvider
        open={openUpdate}
        onOpenChange={setOpenUpdate}
        data={selectedItem}
      />
      <ModalWarning
        variant="error"
        title="Supprimer"
        name={selectedItem?.name}
        description="êtes-vous sur de vouloir supprimer ce fournisseur ?"
        open={openWarning}
        onOpenChange={SetOpenWarning}
        onAction={() => providerMutation.mutate(selectedItem?.id!)}
        actionText="Supprimer"
      />
    </div>
  );
}
