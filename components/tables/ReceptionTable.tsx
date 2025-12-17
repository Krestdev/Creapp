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
  Building,
  CalendarDays,
  CalendarIcon,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Flag,
  XCircle
} from "lucide-react";
import * as React from "react";

import { Reception } from "@/app/tableau-de-bord/commande/receptions/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pagination } from "../base/pagination";
import CompleteReception from "../modals/complete-reception";
import DetailReception from "../modals/detail-reception";

export type ReceptionData = {
  id: string;
  reference: string;
  fournisseur: string;
  titre: string;
  montant: number;
  priorite: "low" | "medium" | "high" | "urgent";
  statut: "pending" | "paid" | "rejected" | "processing";
};

interface ReceptionTableProps {
  data: Reception[];
  dateFilter?: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter?: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange?: { from: Date; to: Date } | undefined;
  setCustomDateRange?: React.Dispatch<
    React.SetStateAction<{ from: Date; to: Date } | undefined>
  >;
}

const priorityConfig = {
  low: {
    label: "Basse",
    badgeClassName: "bg-gray-500 text-white hover:bg-gray-600",
    icon: Flag,
  },
  medium: {
    label: "Moyenne",
    badgeClassName: "bg-blue-500 text-white hover:bg-blue-600",
    icon: Flag,
  },
  high: {
    label: "Haute",
    badgeClassName: "bg-orange-500 text-white hover:bg-orange-600",
    icon: Flag,
  },
  urgent: {
    label: "Urgente",
    badgeClassName: "bg-red-500 text-white hover:bg-red-600",
    icon: Flag,
  },
};

const statusConfig = {
  pending: {
    label: "En attente",
    badgeClassName: "bg-yellow-500 text-white hover:bg-yellow-600",
    icon: Clock,
  },
  processing: {
    label: "En cours",
    badgeClassName: "bg-blue-500 text-white hover:bg-blue-600",
    icon: Clock,
  },
  paid: {
    label: "Payé",
    badgeClassName: "bg-green-500 text-white hover:bg-green-600",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejeté",
    badgeClassName: "bg-red-500 text-white hover:bg-red-600",
    icon: XCircle,
  },
};

export function ReceptionTable({
  data,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: ReceptionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Reception | undefined>(
    undefined
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = React.useState<boolean>(false);

  // États pour le filtre de période
  const [localDateFilter, setLocalDateFilter] = React.useState<
    "today" | "week" | "month" | "year" | "custom" | undefined
  >(undefined);
  const [localCustomDateRange, setLocalCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(customDateRange || { from: addDays(new Date(), -7), to: new Date() });

  // Utiliser les props si fournies, sinon les états locaux
  const currentDateFilter = setDateFilter ? dateFilter : localDateFilter;
  const currentSetDateFilter = setDateFilter || setLocalDateFilter;
  const currentCustomDateRange = setCustomDateRange
    ? customDateRange
    : localCustomDateRange;
  const currentSetCustomDateRange =
    setCustomDateRange || setLocalCustomDateRange;

  // Fonction pour filtrer les données selon la période sélectionnée
  const getFilteredData = React.useMemo(() => {
    if (!data) {
      return data || [];
    }

    let filteredByDate = data;

    // Appliquer le filtre par date si sélectionné
    if (currentDateFilter) {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;

      switch (currentDateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(
            now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
          );
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "custom":
          if (currentCustomDateRange?.from && currentCustomDateRange?.to) {
            startDate = currentCustomDateRange.from;
            endDate = currentCustomDateRange.to;
          } else {
            filteredByDate = data;
            break;
          }
          break;
        default:
          filteredByDate = data;
          break;
      }

      if (
        currentDateFilter !== "custom" ||
        (currentCustomDateRange?.from && currentCustomDateRange?.to)
      ) {
        filteredByDate = data.filter((item) => {
          const itemDate = new Date(item.receptionDate);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
    }

    return filteredByDate;
  }, [data, currentDateFilter, currentCustomDateRange]);

  // Fonction pour obtenir le texte d'affichage du filtre de date
  const getDateFilterText = () => {
    switch (currentDateFilter) {
      case "today":
        return "Aujourd'hui";
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      case "custom":
        if (currentCustomDateRange?.from && currentCustomDateRange?.to) {
          return `${format(
            currentCustomDateRange.from,
            "dd/MM/yyyy"
          )} - ${format(currentCustomDateRange.to, "dd/MM/yyyy")}`;
        }
        return "Personnaliser";
      default:
        return "Toutes les périodes";
    }
  };

  // Gérer l'ouverture du modal personnalisé
  const handleCustomDateClick = () => {
    setTempCustomDateRange(
      currentCustomDateRange || {
        from: addDays(new Date(), -7),
        to: new Date(),
      }
    );
    setIsCustomDateModalOpen(true);
  };

  // Appliquer la plage personnalisée
  const applyCustomDateRange = () => {
    if (tempCustomDateRange?.from && tempCustomDateRange?.to) {
      currentSetDateFilter("custom");
      currentSetCustomDateRange(tempCustomDateRange);
      setIsCustomDateModalOpen(false);
    }
  };

  // Réinitialiser le filtre personnalisé
  const clearCustomDateRange = () => {
    currentSetDateFilter(undefined);
    currentSetCustomDateRange(undefined);
  };

  const filteredData = getFilteredData;

  // Obtenir les statuts uniques parmi les données filtrées
  const availableStatuses = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    const uniqueStatuses = new Set<string>();
    filteredData.forEach((item) => {
      if (item.statut) {
        uniqueStatuses.add(item.statut);
      }
    });

    const allStatuses = Object.keys(statusConfig);
    return allStatuses.filter((status) => uniqueStatuses.has(status));
  }, [filteredData]);

  // Obtenir les fournisseurs uniques parmi les données filtrées
  const availableProviders = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return [];
    }

    const uniqueProviders = new Set<string>();
    const providerMap = new Map<string, string>(); // Pour stocker les noms complets

    filteredData.forEach((item) => {
      if (item.provider) {
        uniqueProviders.add(item.provider);
      }
    });

    // Convertir en tableau trié alphabétiquement
    return Array.from(uniqueProviders).sort((a, b) => a.localeCompare(b));
  }, [filteredData]);

  // Réinitialiser les filtres si les options ne sont plus disponibles
  React.useEffect(() => {
    const currentStatusFilter = table
      .getColumn("statut")
      ?.getFilterValue() as string;

    if (currentStatusFilter && currentStatusFilter !== "all") {
      if (!availableStatuses.includes(currentStatusFilter)) {
        table.getColumn("statut")?.setFilterValue("all");
      }
    }

    const currentProviderFilter = table
      .getColumn("provider")
      ?.getFilterValue() as string;

    if (currentProviderFilter && currentProviderFilter !== "all") {
      if (!availableProviders.includes(currentProviderFilter)) {
        table.getColumn("provider")?.setFilterValue("all");
      }
    }
  }, [availableStatuses, availableProviders]);

  const columns: ColumnDef<Reception>[] = [
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
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
    },
    {
      accessorKey: "bonDeCommande",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bon de commande"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("bonDeCommande")}</div>,
    },
    {
      accessorKey: "provider",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("provider")}</div>,
      filterFn: (row, id, value) => {
        if (!value || value === "all") return true;
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "receptionDate",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Reçu le"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {format(row.getValue("receptionDate"), "PPP", { locale: fr })}
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date limite"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {format(row.getValue("dueDate"), "PPP", { locale: fr })}
          </div>
        );
      },
    },
    {
      accessorKey: "statut",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const statut = row.getValue("statut") as keyof typeof statusConfig;
        const config = statusConfig[statut] || statusConfig.pending;
        const Icon = config.icon;

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value || value === "all") return true;
        return row.getValue(id) === value;
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
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowDetail(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowCompleteModal(true);
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                {"Compléter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      const searchableColumns = ["reference", "bonDeCommande", "provider"];
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
      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* Recherche globale */}
        <div className="grid gap-1.5">
          <Label htmlFor="searchReception">{"Rechercher"}</Label>
          <Input
            name="search"
            type="search"
            id="searchReception"
            placeholder="Référence, bon de commande, fournisseur..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Filtre par statut */}
        <div className="grid gap-1.5">
          <Label>{"Statut"}</Label>
          <Select
            value={
              (table.getColumn("statut")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("statut")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            disabled={
              availableStatuses.length === 0 && filteredData.length === 0
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={
                  availableStatuses.length === 0 && filteredData.length === 0
                    ? "Aucun statut"
                    : "Tous les statuts"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredData.length > 0 ? (
                <>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusConfig[status as keyof typeof statusConfig]
                        ?.label || status}
                    </SelectItem>
                  ))}
                </>
              ) : (
                <SelectItem value="none" disabled>
                  Aucun statut disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre par fournisseur */}
        <div className="grid gap-1.5">
          <Label>{"Fournisseur"}</Label>
          <Select
            value={
              (table.getColumn("provider")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("provider")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            disabled={
              availableProviders.length === 0 && filteredData.length === 0
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={
                  availableProviders.length === 0 && filteredData.length === 0
                    ? "Aucun fournisseur"
                    : "Tous les fournisseurs"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredData.length > 0 ? (
                <>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {availableProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        {provider}
                      </div>
                    </SelectItem>
                  ))}
                </>
              ) : (
                <SelectItem value="none" disabled>
                  Aucun fournisseur disponible
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Filtre par période */}
        <div className="grid gap-1.5">
          <Label>{"Période"}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="min-w-52">
              <Button variant="outline" className="justify-between">
                {getDateFilterText()}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => clearCustomDateRange()}
                className={cn(
                  "flex items-center justify-between",
                  !currentDateFilter && "bg-accent"
                )}
              >
                <span>{"Toutes les périodes"}</span>
                {!currentDateFilter && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => currentSetDateFilter("today")}
                className={cn(
                  "flex items-center justify-between",
                  currentDateFilter === "today" && "bg-accent"
                )}
              >
                <span>{"Aujourd'hui"}</span>
                {currentDateFilter === "today" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentSetDateFilter("week")}
                className={cn(
                  "flex items-center justify-between",
                  currentDateFilter === "week" && "bg-accent"
                )}
              >
                <span>{"Cette semaine"}</span>
                {currentDateFilter === "week" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentSetDateFilter("month")}
                className={cn(
                  "flex items-center justify-between",
                  currentDateFilter === "month" && "bg-accent"
                )}
              >
                <span>{"Ce mois"}</span>
                {currentDateFilter === "month" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => currentSetDateFilter("year")}
                className={cn(
                  "flex items-center justify-between",
                  currentDateFilter === "year" && "bg-accent"
                )}
              >
                <span>{"Cette année"}</span>
                {currentDateFilter === "year" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCustomDateClick}
                className={cn(
                  "flex items-center justify-between",
                  currentDateFilter === "custom" && "bg-accent"
                )}
              >
                <span className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {"Personnaliser"}
                </span>
                {currentDateFilter === "custom" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sélection des colonnes */}
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
                      : column.id === "bonDeCommande"
                      ? "Bon de commande"
                      : column.id === "provider"
                      ? "Fournisseur"
                      : column.id === "receptionDate"
                      ? "Reçu le"
                      : column.id === "dueDate"
                      ? "Date limite"
                      : column.id === "statut"
                      ? "Statut"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Boutons de réinitialisation des filtres */}
      {(table.getColumn("statut")?.getFilterValue() ||
        table.getColumn("provider")?.getFilterValue() ||
        currentDateFilter) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Filtres actifs :
          </span>

          {/* Boutons de réinitialisation des filtres */}
          {(table.getColumn("statut")?.getFilterValue() as string) &&
            (table.getColumn("statut")?.getFilterValue() as string) !==
              "all" && (
              <Badge variant="secondary" className="gap-1">
                Statut:{" "}
                {
                  statusConfig[
                    table
                      .getColumn("statut")
                      ?.getFilterValue() as keyof typeof statusConfig
                  ]?.label
                }
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() =>
                    table.getColumn("statut")?.setFilterValue("all")
                  }
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            )}

          {(table.getColumn("provider")?.getFilterValue() as string) &&
            (table.getColumn("provider")?.getFilterValue() as string) !==
              "all" && (
              <Badge variant="secondary" className="gap-1">
                Fournisseur:{" "}
                {table.getColumn("provider")?.getFilterValue() as string}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() =>
                    table.getColumn("provider")?.setFilterValue("all")
                  }
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Badge>
            )}

          {currentDateFilter && (
            <Badge variant="secondary" className="gap-1">
              Période: {getDateFilterText()}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearCustomDateRange}
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              table.getColumn("statut")?.setFilterValue("all");
              table.getColumn("provider")?.setFilterValue("all");
              clearCustomDateRange();
              setGlobalFilter("");
            }}
            className="ml-2 text-sm"
          >
            Réinitialiser tous les filtres
          </Button>
        </div>
      )}

      {/* Table */}
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
                  Aucune donnée trouvée avec les filtres actuels
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

      {/* Modal pour la plage de dates personnalisée */}
      <Dialog
        open={isCustomDateModalOpen}
        onOpenChange={setIsCustomDateModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{"Sélectionner une plage de dates"}</DialogTitle>
            <DialogDescription>
              {"Choisissez la période que vous souhaitez filtrer"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">{"Date de début"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.from ? (
                        format(tempCustomDateRange.from, "PPP", { locale: fr })
                      ) : (
                        <span>{"Sélectionner une date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.from}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: date || prev?.from || new Date(),
                          to: prev?.to || new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">{"Date de fin"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.to ? (
                        format(tempCustomDateRange.to, "PPP", { locale: fr })
                      ) : (
                        <span>{"Sélectionner une date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.to}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: prev?.from || new Date(),
                          to: date || prev?.to || new Date(),
                        }))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <Calendar
                mode="range"
                selected={tempCustomDateRange}
                onSelect={(range) =>
                  setTempCustomDateRange(range as { from: Date; to: Date })
                }
                numberOfMonths={1}
                className="rounded-md border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomDateModalOpen(false)}
            >
              {"Annuler"}
            </Button>
            <Button onClick={applyCustomDateRange}>{"Appliquer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modales existantes */}
      {selected && (
        <DetailReception
          data={selected}
          open={showDetail}
          onOpenChange={setShowDetail}
          action={() => {
            setShowDetail(false);
            setShowCompleteModal(true);
          }}
        />
      )}
      {selected && (
        <CompleteReception
          data={selected}
          open={showCompleteModal}
          onOpenChange={setShowCompleteModal}
        />
      )}
    </div>
  );
}
