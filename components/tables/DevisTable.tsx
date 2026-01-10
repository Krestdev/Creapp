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
  Eye,
  LucidePen,
  Settings2,
  Trash,
} from "lucide-react";
import * as React from "react";

import CancelQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/cancel";
import EditQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/edit";
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
import { XAF } from "@/lib/utils";
import {
  CommandRequestT,
  DateFilter,
  Provider,
  Quotation,
  QuotationElement,
  QuotationStatus,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { Pagination } from "../base/pagination";
import { DevisModal } from "../modals/DevisModal";
import { Badge, badgeVariants } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { SearchableSelect } from "../base/searchableSelect";

interface DevisTableProps {
  data: Quotation[] | undefined;
  providers: Array<Provider>;
  commands: Array<CommandRequestT>;
}

export function DevisTable({ data, providers, commands }: DevisTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ element: false });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [commandRefFilter, setCommandRefFilter] = React.useState<string>("all");

  // États pour les filtres spécifiques
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [commandFilter, setCommandFilter] = React.useState<string>("all");
  const [montantFilter, setMontantFilter] = React.useState<
    "all" | "lt100000" | "100000-500000" | "gt500000"
  >("all");

  // modal specific states
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [toCancel, setToCancel] = React.useState(false);
  const [isDevisModalOpen, setIsDevisModalOpen] = React.useState(false);
  const [selectedDevis, setSelectedDevis] = React.useState<
    Quotation | undefined
  >(undefined);
  const [selectedQuotation, setSelectedQuotation] = React.useState<
    string | undefined
  >(undefined);

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);

  const getProviderName = (providerId: number) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider ? provider.name : "Inconnu";
  };

  const getQuotationTitle = (commandRequestId: number) => {
    const command = commands.find((c) => c.id === commandRequestId);
    return command ? command.title : "Inconnu";
  };

  const getQuotationRef = (commandRequestId: number) => {
    const command = commands.find((c) => c.id === commandRequestId);
    return command ? command.reference : "Inconnu";
  };

  const calculateTotalMontant = (elements: QuotationElement[]) => {
    return (
      elements?.reduce(
        (total, element) => total + (element.priceProposed || 0),
        0
      ) || 0
    );
  };

  const getStatusLabel = (
    status: QuotationStatus
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "PENDING":
        return { label: "En attente", variant: "amber" };
      case "APPROVED":
        return { label: "Traité", variant: "success" };
      case "REJECTED":
        return { label: "Rejeté", variant: "destructive" };
      case "SUBMITTED":
        return { label: "Traité", variant: "primary" };
      default:
        return { label: "Inconnu", variant: "outline" };
    }
  };

  // Gérer le changement de filtre par référence
  const handleCommandRefFilterChange = (value: string) => {
    setCommandRefFilter(value);
    // Si une référence est sélectionnée, réinitialiser le filtre par titre
    if (value !== "all") {
      setCommandFilter("all");
    }
  };

  // Gérer le changement de filtre par titre
  const handleCommandFilterChange = (value: string) => {
    setCommandFilter(value);
    // Si un titre est sélectionné, réinitialiser le filtre par référence
    if (value !== "all") {
      setCommandRefFilter("all");
    }
  };

  // Fonction pour filtrer les données selon tous les filtres
  const getFilteredData = React.useMemo(() => {
    if (!data) {
      return data || [];
    }

    let filtered = [...data];

    // Filtre par date
    if (dateFilter) {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;

      switch (dateFilter) {
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
          if (customDateRange?.from && customDateRange?.to) {
            startDate = customDateRange.from;
            endDate = customDateRange.to;
          }
          break;
      }

      if (
        dateFilter !== "custom" ||
        (customDateRange?.from && customDateRange?.to)
      ) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.createdAt!);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
    }

    // Filtre par fournisseur
    if (providerFilter !== "all") {
      const providerId = parseInt(providerFilter);
      filtered = filtered.filter((item) => item.providerId === providerId);
    }

    // Filtre par commande (titre)
    if (commandFilter !== "all") {
      const commandId = parseInt(commandFilter);
      filtered = filtered.filter((item) => item.commandRequestId === commandId);
    }

    // Filtre par montant
    if (montantFilter !== "all") {
      filtered = filtered.filter((item) => {
        const total = calculateTotalMontant(item.element);
        switch (montantFilter) {
          case "lt100000":
            return total < 100000;
          case "100000-500000":
            return total >= 100000 && total <= 500000;
          case "gt500000":
            return total > 500000;
          default:
            return true;
        }
      });
    }

    // Filtre par référence de commande - CORRECTION ICI
    if (commandRefFilter !== "all") {
      filtered = filtered.filter((item) => {
        const commandRef = getQuotationRef(item.commandRequestId);
        // Comparaison exacte des références
        return commandRef === commandRefFilter;
      });
    }

    return filtered;
  }, [
    data,
    dateFilter,
    customDateRange,
    providerFilter,
    commandFilter,
    montantFilter,
    commandRefFilter, // AJOUTÉ: Inclure commandRefFilter dans les dépendances
  ]);

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setProviderFilter("all");
    setCommandFilter("all");
    setCommandRefFilter("all");
    setMontantFilter("all");
    setGlobalFilter("");
  };

  const filteredData = getFilteredData;

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "ref",
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
        <div className="font-medium">{row.getValue("ref")}</div>
      ),
    },
    {
      accessorKey: "commandRequestId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Demande de cotation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium first-letter:uppercase">
          {`${getQuotationTitle(row.getValue("commandRequestId"))} - `}
          <span className="text-destructive text-[12px]">{`${getQuotationRef(
            row.getValue("commandRequestId")
          )}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "providerId",
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
      cell: ({ row }) => (
        <div className="first-letter:uppercase">
          {getProviderName(row.getValue("providerId"))}
        </div>
      ),
    },
    {
      accessorKey: "montant",
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
        const elements = row.getValue("element") as QuotationElement[];
        const total = calculateTotalMontant(elements);
        return <div>{XAF.format(total)}</div>;
      },
    },
    {
      accessorKey: "element",
      header: () => {
        return <span className="tablehead">{"Éléments"}</span>;
      },
      cell: ({ row }) => {
        const value = row.getValue("element") as QuotationElement[];
        return <span>{value.length}</span>;
      },
    },
    {
      accessorKey: "status",
      header: () => {
        return <span className="tablehead">{"Statut"}</span>;
      },
      cell: ({ row }) => {
        const value = row.getValue("status") as QuotationStatus;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
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
        <div>
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm")}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost" size={"sm"}>
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setSelectedQuotation(
                    getQuotationTitle(item.commandRequestId)
                  );
                  setIsDevisModalOpen(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setIsUpdateModalOpen(true);
                }}
                disabled={
                  item.status === "APPROVED" || item.status === "REJECTED"
                }
              >
                <LucidePen />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSelectedDevis(item);
                  setToCancel(true);
                }}
                disabled={
                  item.status === "APPROVED" || item.status === "REJECTED"
                }
              >
                <Trash />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData?.reverse() || [],
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
      const searchValue = filterValue.toLowerCase();

      // Recherche par titre de commande
      const commandRequestId = row.getValue("commandRequestId") as number;
      const commandTitle = getQuotationTitle(commandRequestId).toLowerCase();
      if (commandTitle.includes(searchValue)) return true;

      // Recherche par nom de fournisseur
      const providerId = row.getValue("providerId") as number;
      const providerName = getProviderName(providerId).toLowerCase();
      if (providerName.includes(searchValue)) return true;

      // Recherche par référence
      const ref = row.getValue("ref") as string;
      if (ref?.toLowerCase().includes(searchValue)) return true;

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

  return (
    <div className="content">
      <div className="flex flex-wrap items-end gap-4">
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
                  placeholder="Référence, titre, fournisseur..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Filtre par fournisseur */}
              <div className="grid gap-1.5">
                <Label>{"Fournisseur"}</Label>
                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Tous les fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les fournisseurs</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id.toString()}
                      >
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par référence de commande */}
              <div className="grid gap-1.5">
                <Label>{"Référence de commande"}</Label>
                <SearchableSelect
                  value={commandRefFilter}
                  onChange={handleCommandRefFilterChange}
                  options={commands.map((command) => ({
                    value: command.reference,
                    label: command.reference,
                  }))}
                  width="w-full"
                />
              </div>

              {/* Filtre par demande de cotation */}
              <div className="grid gap-1.5">
                <Label>{"Demande de cotation"}</Label>
                <Select
                  value={commandFilter}
                  onValueChange={handleCommandFilterChange}
                  disabled={commandRefFilter !== "all"}
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Toutes les demandes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes les demandes"}</SelectItem>
                    {commands.map((command) => (
                      <SelectItem
                        key={command.id}
                        value={command.id.toString()}
                      >
                        {command.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par montant */}
              <div className="grid gap-1.5">
                <Label>{"Montant"}</Label>
                <Select
                  value={montantFilter}
                  onValueChange={(
                    value: "all" | "lt100000" | "100000-500000" | "gt500000"
                  ) => setMontantFilter(value)}
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Tous les montants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous les montants"}</SelectItem>
                    <SelectItem value="lt100000">{`< 100 000 XAF`}</SelectItem>
                    <SelectItem value="100000-500000">
                      {" 0 0000 - 500 000 XAF"}
                    </SelectItem>
                    <SelectItem value="gt500000">{`> 500 000 XAF`}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par période */}
              <div className="grid gap-1.5">
                <Label>{"Période"}</Label>
                <Select
                  onValueChange={(v) => {
                    if (v !== "custom") {
                      setCustomDateRange(undefined);
                      setCustomOpen(false);
                    }
                    if (v === "all") return setDateFilter(undefined);
                    setDateFilter(v as Exclude<DateFilter, undefined>);
                    setCustomOpen(v === "custom");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes les périodes"}</SelectItem>
                    <SelectItem value="today">{"Aujourd'hui"}</SelectItem>
                    <SelectItem value="week">{"Cette semaine"}</SelectItem>
                    <SelectItem value="month">{"Ce mois"}</SelectItem>
                    <SelectItem value="year">{"Cette année"}</SelectItem>
                    <SelectItem value="custom">{"Personnalisé"}</SelectItem>
                  </SelectContent>
                </Select>
                <Collapsible
                  open={customOpen}
                  onOpenChange={setCustomOpen}
                  disabled={dateFilter !== "custom"}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {"Plage personnalisée"}
                      <span className="text-muted-foreground text-xs">
                        {customDateRange?.from && customDateRange.to
                          ? `${format(
                            customDateRange.from,
                            "dd/MM/yyyy"
                          )} → ${format(customDateRange.to, "dd/MM/yyyy")}`
                          : "Choisir"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 pt-4">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) =>
                        setCustomDateRange(range as { from: Date; to: Date })
                      }
                      numberOfMonths={1}
                      className="rounded-md border w-full"
                    />
                    <div className="space-y-1">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setCustomDateRange(undefined);
                          setDateFilter(undefined);
                          setCustomOpen(false);
                        }}
                      >
                        {"Annuler"}
                      </Button>
                      <Button
                        className="w-full"
                        variant={"outline"}
                        onClick={() => {
                          setCustomOpen(false);
                        }}
                      >
                        {"Réduire"}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {"Colonnes"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  let columnName = column.id;
                  if (column.id === "ref") columnName = "Référence";
                  else if (column.id === "commandRequestId")
                    columnName = "Demande de cotation";
                  else if (column.id === "providerId")
                    columnName = "Fournisseur";
                  else if (column.id === "montant") columnName = "Montant";
                  else if (column.id === "status") columnName = "Statuts";
                  else if (column.id === "createdAt")
                    columnName = "Date de création";

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnName}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
                  {"Aucun résultat"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <div className="mt-4">
          <Pagination table={table} pageSize={15} />
        </div>
      )}

      <DevisModal
        open={isDevisModalOpen}
        onOpenChange={setIsDevisModalOpen}
        data={selectedDevis}
        quotation={selectedQuotation}
      />

      {/* Modal pour la plage de dates personnalisée */}
      {selectedDevis && (
        <EditQuotation
          open={isUpdateModalOpen}
          openChange={setIsUpdateModalOpen}
          quotation={selectedDevis}
        />
      )}
      {selectedDevis && (
        <CancelQuotation
          open={toCancel}
          openChange={setToCancel}
          quotation={selectedDevis}
        />
      )}
    </div>
  );
}