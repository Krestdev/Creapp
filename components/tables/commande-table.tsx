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
  LucideIcon,
  LucidePen,
  Settings2,
  Trash,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { quotationQ } from "@/queries/quotation";
import { CommandRequestT, DateFilter } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { DownloadButton } from "../bdcommande/TéléchargeButton";
import { UpdateCotationModal } from "../bdcommande/UpdateCotationModal";
import { DetailOrder } from "../modals/detail-order";
import { ModalWarning } from "../modals/modal-warning";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CommandeTableProps {
  data: CommandRequestT[];
}

export function CommandeTable({ data }: CommandeTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedOrder, setSelectedOrder] =
    React.useState<CommandRequestT | null>(null);
  const [showOrder, setShowOrder] = React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  const commandData = useQuery({
    queryKey: ["commands"],
    queryFn: async () => commandRqstQ.getAll(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: devis } = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });

  const cancelDevis = useMutation({
    mutationFn: (id: number) => commandRqstQ.delete(id),
    onSuccess: () => {
      toast.success("Demande de cotation annulée avec succès.");
    },
  });

  // modal specific states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [selectedCommand, setSelectedCommand] = React.useState<
    CommandRequestT | undefined
  >(undefined);
  const [isDevisModalCancelOpen, setIsDevisModalCancelOpen] =
    React.useState(false);

  const getStatusConfig = (
    status: string,
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
      case "validated":
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
      case "in-review":
        return {
          label: "En révision",
          variant: "sky",
          rowClassName: "bg-sky-50/50 hover:bg-sky-50",
        };
      case "cancel":
        return { label: "Annulé", variant: "default" };
      default:
        return { label: "Inconnu", variant: "default" };
    }
  };

  const resetAllFilters = () => {
    setGlobalFilter("");
    setDateFilter(undefined);
    setCustomDateRange(undefined);
  };

  // Fonction pour filtrer les données selon la période sélectionnée
  const filteredData = React.useMemo(() => {
    return data.filter((c) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      // Filtre par date
      let matchDate = true;
      if (dateFilter) {
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
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
          matchDate =
            new Date(c.createdAt) >= startDate &&
            new Date(c.createdAt) <= endDate;
        }
      }
      return matchDate;
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
            "dd/MM/yyyy",
          )}`;
        }
        return "Personnaliser";
      default:
        return "Toutes les périodes";
    }
  };

  const columns: ColumnDef<CommandRequestT>[] = [
    {
      accessorKey: "reference",
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
        <div className="font-medium first-letter:uppercase">
          {row.getValue("reference")}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titre"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="uppercase truncate max-w-60">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date de creation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div>{format(row.getValue("createdAt"), "PPP", { locale: fr })}</div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date limite de soumission"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div>{format(row.getValue("dueDate"), "PPP", { locale: fr })}</div>
      ),
    },
    {
      accessorKey: "devis",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Devis associés"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const devisAssocies = devis?.data.filter(
          (x) => x.commandRequestId === row.original.id,
        );
        return <div>{devisAssocies?.length}</div>;
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const devisAssocies = devis?.data.filter(
          (x) => x.commandRequestId === row.original.id,
        );

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(item);
                  setShowOrder(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <DownloadButton
                  data={item}
                  className="bg-transparent text-black hover:bg-transparent hover:text-black h-8 py-0 px-0 font-normal!"
                />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCommand(item);
                  setIsUpdateModalOpen(true);
                }}
                disabled={devisAssocies?.length! > 0}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={devisAssocies?.length! > 0}
                onClick={() => {
                  setSelectedCommand(item);
                  setIsDevisModalCancelOpen(true);
                }}
              >
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
    <div className="content">
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                              "dd/MM/yyyy",
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
                          ? "Date limite de soumission"
                          : column.id === "state"
                            ? "Statut"
                            : column.id === "createdAt"
                              ? "Date de création"
                              : column.id === "devis"
                                ? "Devis"
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
                          cell.getContext(),
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
      {/* Modale pour modifier le besoin */}

      <UpdateCotationModal
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        commandId={selectedCommand?.id || 0}
        commandData={selectedCommand}
        allCommands={data}
        onSuccess={() => {
          commandData.refetch();
        }}
      />

      <DetailOrder
        open={showOrder}
        onOpenChange={setShowOrder}
        data={selectedOrder}
      />
      <ModalWarning
        open={isDevisModalCancelOpen}
        onOpenChange={setIsDevisModalCancelOpen}
        actionText="Annuler"
        description="Vous êtes sur le point de supprimer la demande de cotation"
        title={selectedCommand?.title || ""}
        onAction={() => cancelDevis.mutate(selectedCommand?.id || 0)}
        variant="error"
      />
    </div>
  );
}
