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
  CalendarDays,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Eye,
  LucidePen,
  Settings2,
  Trash
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
import { cn, XAF } from "@/lib/utils";
import { CommandRequestT, Provider, Quotation, QuotationElement, QuotationStatus } from "@/types/types";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pagination } from "../base/pagination";
import { DevisModal } from "../modals/DevisModal";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditQuotation from "@/app/tableau-de-bord/commande/devis/edit";
import CancelQuotation from "@/app/tableau-de-bord/commande/devis/cancel";
import { VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "../ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

interface DevisTableProps {
  data: Quotation[] | undefined;
  dateFilter: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange?: { from: Date; to: Date } | undefined;
  setCustomDateRange?: React.Dispatch<
    React.SetStateAction<{ from: Date; to: Date } | undefined>
  >;
  providers: Array<Provider>;
  commands: Array<CommandRequestT>;
}

export function DevisTable({
  data,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  providers,
  commands
}: DevisTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({"element":false});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // États pour les filtres spécifiques
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [commandFilter, setCommandFilter] = React.useState<string>("all");
  const [montantFilter, setMontantFilter] = React.useState<"all" | "lt100000" | "100000-500000" | "gt500000">("all");

  // modal specific states
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
  const [tempCustomDateRange, setTempCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(customDateRange || { from: addDays(new Date(), -7), to: new Date() });

  const getProviderName = (providerId: number) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider ? provider.name : "Inconnu";
  };

  const getQuotationTitle = (commandRequestId: number) => {
    const command = commands.find((c) => c.id === commandRequestId);
    return command ? command.title : "Inconnu";
  };

  const calculateTotalMontant = (elements: QuotationElement[]) => {
    return elements?.reduce(
      (total, element) => total + (element.priceProposed || 0),
      0
    ) || 0;
  };

  const getStatusLabel = (status: QuotationStatus):{label:string; variant:VariantProps<typeof badgeVariants>["variant"]} => {
    switch(status){
      case "PENDING":
        return {label:"En attente", variant: "amber"};
      case "APPROVED":
        return {label:"Approuvé", variant: "success"};
      case "REJECTED":
        return {label:"Rejeté", variant: "destructive"};
      case "SUBMITTED":
        return {label:"Approuvé", variant: "primary"};
        default: return {label: "Inconnu", variant: "outline"};
    }
  }

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

      if (dateFilter !== "custom" || (customDateRange?.from && customDateRange?.to)) {
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

    // Filtre par commande
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

    return filtered;
  }, [data, dateFilter, customDateRange, providerFilter, commandFilter, montantFilter]);

  // Fonction pour obtenir le texte d'affichage du filtre de date
  const getDateFilterText = () => {
    switch (dateFilter) {
      case "today":
        return "Aujourd'hui";
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      case "custom":
        if (customDateRange?.from && customDateRange?.to) {
          return `${format(customDateRange.from, "dd/MM/yyyy")} - ${format(
            customDateRange.to,
            "dd/MM/yyyy"
          )}`;
        }
        return "Personnaliser";
      default:
        return "Toutes les périodes";
    }
  };

  // Gérer l'ouverture du modal personnalisé
  const handleCustomDateClick = () => {
    setTempCustomDateRange(
      customDateRange || { from: addDays(new Date(), -7), to: new Date() }
    );
    setIsCustomDateModalOpen(true);
  };

  // Appliquer la plage personnalisée
  const applyCustomDateRange = () => {
    if (tempCustomDateRange?.from && tempCustomDateRange?.to) {
      setDateFilter("custom");
      if (setCustomDateRange) {
        setCustomDateRange(tempCustomDateRange);
      }
      setIsCustomDateModalOpen(false);
    }
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setProviderFilter("all");
    setCommandFilter("all");
    setMontantFilter("all");
    setGlobalFilter("");
  };

  const filteredData = getFilteredData;

  const columns: ColumnDef<Quotation>[] = [
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
          {getQuotationTitle(row.getValue("commandRequestId"))}
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
        return (
          <span
            className="tablehead"
          >
            {"Éléments"}
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("element") as QuotationElement[];
        return <span>{value.length}</span>;
      },
      
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <span
            className="tablehead"
          >
            {"Statut"}
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("status") as QuotationStatus;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>; //here!
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
                  setSelectedQuotation(getQuotationTitle(item.commandRequestId));
                  setIsDevisModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setIsUpdateModalOpen(true);
                }}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() =>{
                setSelectedDevis(item);
                setToCancel(true);
              }}>
                <Trash color="red" className="mr-2 h-4 w-4" />
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
    <div className="w-full">
      <div className="flex flex-wrap items-end gap-4 py-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"}><Settings2/>{"Filtres"}</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>{"Configurer les fitres pour affiner les données"}</SheetDescription>
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
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="min-w-40 w-full">
                <SelectValue placeholder="Tous les fournisseurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les fournisseurs</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par demande de cotation */}
          <div className="grid gap-1.5">
            <Label>{"Demande de cotation"}</Label>
            <Select value={commandFilter} onValueChange={setCommandFilter}>
              <SelectTrigger className="min-w-40 w-full">
                <SelectValue placeholder="Toutes les demandes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Toutes les demandes"}</SelectItem>
                {commands.map((command) => (
                  <SelectItem key={command.id} value={command.id.toString()}>
                    {command.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par montant */}
          <div className="grid gap-1.5">
            <Label>{"Montant"}</Label>
            <Select value={montantFilter} onValueChange={(value: "all" | "lt100000" | "100000-500000" | "gt500000") => setMontantFilter(value)}>
              <SelectTrigger className="min-w-40 w-full">
                <SelectValue placeholder="Tous les montants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Tous les montants"}</SelectItem>
                <SelectItem value="lt100000">{`< 100 000 XAF`}</SelectItem>
                <SelectItem value="100000-500000">{" 0 0000 - 500 000 XAF"}</SelectItem>
                <SelectItem value="gt500000">{`> 500 000 XAF`}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par période */}
          <div className="grid gap-1.5">
            <Label>{"Période"}</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-52 w-full justify-between font-normal font-sans text-base">
                  <span>{getDateFilterText()}</span>
                  <CalendarIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setDateFilter(undefined);
                    if (setCustomDateRange) {
                      setCustomDateRange(undefined);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between",
                    !dateFilter && "bg-accent"
                  )}
                >
                  <span>{"Toutes les périodes"}</span>
                  {!dateFilter && <ChevronRight className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDateFilter("today")}
                  className={cn(
                    "flex items-center justify-between",
                    dateFilter === "today" && "bg-accent"
                  )}
                >
                  <span>{"Aujourd'hui"}</span>
                  {dateFilter === "today" && <ChevronRight className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateFilter("week")}
                  className={cn(
                    "flex items-center justify-between",
                    dateFilter === "week" && "bg-accent"
                  )}
                >
                  <span>{"Cette semaine"}</span>
                  {dateFilter === "week" && <ChevronRight className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateFilter("month")}
                  className={cn(
                    "flex items-center justify-between",
                    dateFilter === "month" && "bg-accent"
                  )}
                >
                  <span>{"Ce mois"}</span>
                  {dateFilter === "month" && <ChevronRight className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDateFilter("year")}
                  className={cn(
                    "flex items-center justify-between",
                    dateFilter === "year" && "bg-accent"
                  )}
                >
                  <span>{"Cette année"}</span>
                  {dateFilter === "year" && <ChevronRight className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleCustomDateClick}
                  className={cn(
                    "flex items-center justify-between",
                    dateFilter === "custom" && "bg-accent"
                  )}
                >
                  <span className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {"Personnaliser"}
                  </span>
                  {dateFilter === "custom" && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                  else if (column.id === "commandRequestId") columnName = "Demande de cotation";
                  else if (column.id === "providerId") columnName = "Fournisseur";
                  else if (column.id === "montant") columnName = "Montant";
                  else if (column.id === "status") columnName = "Statuts";
                  else if (column.id === "createdAt") columnName = "Date de création";
                  
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
      { selectedDevis && <EditQuotation open={isUpdateModalOpen} openChange={setIsUpdateModalOpen} quotation={selectedDevis}/>}
      { selectedDevis && <CancelQuotation open={toCancel} openChange={setToCancel} quotation={selectedDevis}/>}
    </div>
  );
}