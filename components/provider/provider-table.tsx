"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
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
  Settings2,
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
import { providerQ } from "@/queries/providers";
import { Provider } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { ModalWarning } from "../modals/modal-warning";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import UpdateProvider from "./UpdateProvider";
import { ShowProvider } from "./show-provider";
import { AxiosError } from "axios";

interface ProvidersTableProps {
  data: Provider[];
}

export function ProviderTable({ data }: ProvidersTableProps) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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

  const providerMutation = useMutation({
    mutationFn: (id: number) => providerQ.delete(id),
    onSuccess: () => {
      toast.success("Fournisseur supprimé avec succès !");
    },
    onError: (error: Error) => {
      toast.error(error.message === "Cannot Delete Provider with active processes" ? "Impossible de supprimer le fournisseur car il est lié à un ou plusieurs bons de commande" : error.message);
    },
  });

  // Extraire les régimes uniques des fournisseurs
  const uniqueRegimes = React.useMemo(() => {
    const regimes = data
      .map((provider) => provider.regem)
      .filter(
        (regime): regime is string =>
          regime !== undefined && regime !== null && regime.trim() !== "",
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
      (field) => typeof field === "string" && field.trim() !== "",
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
              {"Nom (Entreprise)"}
              <ArrowUpDown />
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
              {"Régime"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const regime = row.getValue("regem") as string;
          return (
            <div className="font-medium">
              {regime || (
                <span className="text-muted-foreground">{"Non spécifié"}</span>
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
              {"Addresse"}
              <ArrowUpDown />
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
              {"Téléphone"}
              <ArrowUpDown />
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
              {"Adresse mail"}
              <ArrowUpDown />
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
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const status = checkProviderInfo(row.original);
          return (
            <div className="font-medium">
              <Badge variant={status === "complet" ? "success" : "amber"}>
                {status === "complet" ? <Check /> : <AlertTriangle />}
                {status === "complet" ? "Complet" : "Incomplet"}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="tablehead">{"Actions"}</span>,
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
                  <Eye />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(provider);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(provider);
                    SetOpenWarning(true);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="text-destructive" />
                  {"Supprimer"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
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
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"}>
              <Settings2 />
              {"Filtres"}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Configurer les fitres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, libellé"
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full"
                />
              </div>
              {/**Type Filter */}
              <div className="grid gap-1.5">
                <Label>{"Régime"}</Label>
                <Select value={regimeFilter} onValueChange={setRegimeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {uniqueRegimes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/**Status Filter */}
              <div className="grid gap-1.5">
                <Label>{"Priorité"}</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    <SelectItem value="complet">{"Complet"}</SelectItem>
                    <SelectItem value="incomplet">{"Incomplet"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Bouton pour réinitialiser les filtres */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetAllFilters}
                  className="w-full"
                >
                  {"Réinitialiser"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Menu des colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
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
                  {"Aucun résultat trouvé avec les filtres actuels"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {selectedItem && (
        <UpdateProvider
          open={isUpdateModalOpen}
          setOpen={setIsUpdateModalOpen}
          providerData={selectedItem}
        />
      )}
      {selectedItem && (
        <ShowProvider
          open={openUpdate}
          onOpenChange={setOpenUpdate}
          data={selectedItem}
        />
      )}
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
