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
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Hourglass,
  LucideDownload,
  LucideIcon,
  LucidePen,
  Trash,
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
import { VariantProps } from "class-variance-authority";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pagination } from "../base/pagination";
import { badgeVariants } from "../ui/badge";
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
import { ProviderQueries } from "@/queries/providers";
import { useFetchQuery } from "@/hooks/useData";
import { CommandQueries } from "@/queries/commandModule";
import { useQuery } from "@tanstack/react-query";
import { DevisModal } from "../modals/DevisModal";
import { CommandRequestT, Quotation, QuotationElement } from "@/types/types";

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
}

export function DevisTable({
  data,
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: DevisTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // modal specific states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isDevisModalOpen, setIsDevisModalOpen] = React.useState(false);
  const [selectedDevis, setSelectedDevis] = React.useState<
    Quotation | undefined
  >(undefined);
  const [selectedQuotation, setSelectedQuotation] = React.useState<
    String | undefined
  >(undefined);

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(customDateRange || { from: addDays(new Date(), -7), to: new Date() });

  const providerQuery = new ProviderQueries();
  const providersData = useFetchQuery(
    ["providers"],
    providerQuery.getAll,
    500000
  );

  const command = new CommandQueries();
  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => command.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 500000,
  });

  const getProviderName = (providerId: number) => {
    if (providersData.isSuccess) {
      const provider = providersData.data.data.find((p) => p.id === providerId);
      return provider ? provider.name : "Inconnu";
    }
    return "Inconnu";
  };

  const getQuotationTitle = (quotationId: number) => {
    if (commandData.isSuccess) {
      const command = commandData.data.data.find((c) => c.id === quotationId);
      return command ? command.title : "Inconnu";
    }
    return "Inconnu";
  };

  const getStatusConfig = (
    status: string
  ): {
    label: string;
    icon?: LucideIcon;
    variant: VariantProps<typeof badgeVariants>["variant"];
    rowClassName?: string;
  } => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          icon: Hourglass,
          variant: "amber",
          rowClassName: "bg-amber-50/50 hover:bg-amber-50",
        };
        return {
          label: "En attente",
          icon: Hourglass,
          variant: "amber",
          rowClassName: "bg-amber-50/50 hover:bg-amber-50",
        };
      case "validated":
        return {
          label: "Validé",
          icon: CheckCircle,
          variant: "success",
          rowClassName: "bg-green-50/50 hover:bg-green-50",
        };
        return {
          label: "Validé",
          icon: CheckCircle,
          variant: "success",
          rowClassName: "bg-green-50/50 hover:bg-green-50",
        };
      case "rejected":
        return {
          label: "Rejeté",
          variant: "destructive",
          rowClassName: "bg-red-50/50 hover:bg-red-50",
        };
        return {
          label: "Rejeté",
          variant: "destructive",
          rowClassName: "bg-red-50/50 hover:bg-red-50",
        };
      case "in-review":
        return {
          label: "En révision",
          variant: "sky",
          rowClassName: "bg-sky-50/50 hover:bg-sky-50",
        };
        return {
          label: "En révision",
          variant: "sky",
          rowClassName: "bg-sky-50/50 hover:bg-sky-50",
        };
      case "cancel":
        return { label: "Annulé", variant: "default" };
        return { label: "Annulé", variant: "default" };
      default:
        return { label: "Inconnu", variant: "default" };
        return { label: "Inconnu", variant: "default" };
    }
  };

  // Fonction pour filtrer les données selon la période sélectionnée
  const getFilteredData = React.useMemo(() => {
    if (!data) {
      return data || [];
    }

    // Si pas de filtre, retourner toutes les données
    if (!dateFilter) {
      return data;
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    switch (dateFilter) {
      case "today":
        // Début de la journée
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        // Début de la semaine (lundi)
        startDate.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        // Début du mois
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        // Début de l'année
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "custom":
        // Utiliser la plage personnalisée
        if (customDateRange?.from && customDateRange?.to) {
          startDate = customDateRange.from;
          endDate = customDateRange.to;
        } else {
          return data;
        }
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt!);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [data, dateFilter, customDateRange]);

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
    // Initialiser avec la plage actuelle ou une plage par défaut
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

  // Réinitialiser le filtre personnalisé
  const clearCustomDateRange = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
  };

  const filteredData = getFilteredData;

  const getTranslatedLabel = (label: string) => {
    const translations: Record<string, string> = {
      pending: "En attente",
      validated: "Validé",
      rejected: "Refusé",
      "in-review": "En révision",
      Cancel: "Annulé",
    };
    return translations[label] || label;
  };

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
      accessorKey: "quotationId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Demande de quotation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium first-letter:uppercase">
          {getQuotationTitle(row.getValue("quotationId"))}
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
      cell: ({ row }) => (
        <div>
          {XAF.format(
            (row.getValue("element") as QuotationElement[]).reduce(
              (total, element) => total + element.priceProposed,
              0
            )
          )}
        </div>
      ),
    },
    {
      accessorKey: "element",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Nombre d'articles"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div>{(row.getValue("element") as QuotationElement[]).length}</div>
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
              <Button variant="ghost">
                {"Actions"}
                <ChevronDown />
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
              <DropdownMenuItem onClick={() => console.log("Reject", item)}>
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
      const searchableColumns = ["reference", "title"];
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
        <div className="grid gap-1.5">
          <Label htmlFor="searchCommand">{"Rechercher"}</Label>
          <Input
            name="search"
            type="search"
            id="searchCommand"
            placeholder="Reference, titre..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Filtre par période avec dropdown style */}
        <div className="grid gap-1.5">
          <Label>{"Période"}</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className="min-w-52">
              {getDateFilterText()}
              <CalendarIcon />
              {getDateFilterText()}
              <CalendarIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => clearCustomDateRange()}
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
                {dateFilter === "custom" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                      : column.id === "title"
                      ? "Titre"
                      : column.id === "dueDate"
                      ? "Date limite"
                      : column.id === "state"
                      ? "Statut"
                      : column.id === "createdAt"
                      ? "Date de création"
                      : null}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
              table.getRowModel().rows.map((row) => {
                const config = getStatusConfig(status!);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(config.rowClassName ?? "")}
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
                );
              })
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
        <Pagination table={table} pageSize={15} />
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
    </div>
  );
}
