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
  Ellipsis,
  Eye,
  LucidePen,
  Settings2,
  Trash,
} from "lucide-react";
import * as React from "react";

import CancelQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/cancel";
import EditQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/edit";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuotationAmount, subText, XAF } from "@/lib/utils";
import {
  CommandRequestT,
  DateFilter,
  Provider,
  Quotation,
  QuotationElement,
  QUOTATION_STATUS,
  QuotationStatus,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { Pagination } from "../base/pagination";
import { DevisModal } from "../modals/DevisModal";
import { Badge, badgeVariants } from "../ui/badge";
import EditApprovedQuotation from "@/app/tableau-de-bord/(sales)/commande/devis/edit-approved-quotation";

interface DevisTableProps {
  data: Quotation[];
  providers: Array<Provider>;
  commands: Array<CommandRequestT>;
  users: Array<User>;
}

export function DevisTable({
  data,
  providers,
  commands,
  users,
}: DevisTableProps) {
  // ─── Search ───────────────────────────────────────────────────────────────
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [quotationFilter, setQuotationFilter] = React.useState<"all" | string>(
    "all",
  );
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | QuotationStatus
  >("all");
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal"
  >("greater");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false);

  // ─── Dropdown search states ───────────────────────────────────────────────
  const [providerSearch, setProviderSearch] = React.useState("");
  const [statusSearch, setStatusSearch] = React.useState("");
  const [quotationSearch, setQuotationSearch] = React.useState("");

  // ─── Table UI state ───────────────────────────────────────────────────────
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ element: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [toCancel, setToCancel] = React.useState(false);
  const [modifyDialog, setModifyDialog] = React.useState(false);
  const [isDevisModalOpen, setIsDevisModalOpen] = React.useState(false);
  const [selectedDevis, setSelectedDevis] = React.useState<
    Quotation | undefined
  >(undefined);
  const [selectedQuotation, setSelectedQuotation] = React.useState<
    string | undefined
  >(undefined);

  // ─── Reset filters ────────────────────────────────────────────────────────
  const resetAllFilters = () => {
    setProviderFilter("all");
    setStatusFilter("all");
    setQuotationFilter("all");
    setAmountTypeFilter("greater");
    setAmountFilter(0);
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setCustomOpen(false);
    setProviderSearch("");
    setStatusSearch("");
    setQuotationSearch("");
    setGlobalFilter("");
  };

  // ─── Lookup helpers (stable references) ──────────────────────────────────
  const getProviderName = React.useCallback(
    (providerId: number) => {
      const provider = providers.find((p) => p.id === providerId);
      return provider ? provider.name : "Inconnu";
    },
    [providers],
  );

  const getQuotationTitle = React.useCallback(
    (commandRequestId: number) => {
      const command = commands.find((c) => c.id === commandRequestId);
      return command ? command.title : "Inconnu";
    },
    [commands],
  );

  const getQuotationRef = React.useCallback(
    (commandRequestId: number) => {
      const command = commands.find((c) => c.id === commandRequestId);
      return command ? command.reference : "Inconnu";
    },
    [commands],
  );

  const getStatusLabel = (
    status: QuotationStatus,
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "PENDING":
        return { label: "En attente", variant: "amber" };
      case "APPROVED":
        return { label: "Approuvé", variant: "success" };
      case "REJECTED":
        return { label: "Rejeté", variant: "destructive" };
      case "SUBMITTED":
        return { label: "Soumis", variant: "primary" };
      default:
        return { label: "Inconnu", variant: "outline" };
    }
  };

  // ─── Filtered data (search + all filters combined) ────────────────────────
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    const now = new Date();
    let startDate = new Date();
    let endDate = now;
    const search = globalFilter.toLowerCase();

    return data.filter((item) => {
      // Search
      const matchSearch =
        search === ""
          ? true
          : item.ref.toLowerCase().includes(search) ||
            getProviderName(item.providerId).toLowerCase().includes(search) ||
            getQuotationTitle(item.commandRequestId)
              .toLowerCase()
              .includes(search) ||
            getQuotationRef(item.commandRequestId)
              .toLowerCase()
              .includes(search);

      // Provider
      const matchProvider =
        providerFilter === "all"
          ? true
          : item.providerId === Number(providerFilter);

      // Quotation (command request)
      const matchQuotation =
        quotationFilter === "all"
          ? true
          : item.commandRequestId === Number(quotationFilter);

      // Status
      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      // Amount
      const itemAmount = getQuotationAmount(item, providers);
      const matchAmount =
        amountFilter === 0
          ? true
          : amountTypeFilter === "greater"
            ? itemAmount > amountFilter
            : amountTypeFilter === "equal"
              ? itemAmount === amountFilter
              : itemAmount < amountFilter;

      // Date
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
              endDate.setHours(23);
            }
            break;
        }
        if (
          dateFilter !== "custom" ||
          (customDateRange?.from && customDateRange?.to)
        ) {
          matchDate =
            new Date(item.createdAt) >= startDate &&
            new Date(item.createdAt) <= endDate;
        }
      }

      return (
        matchSearch &&
        matchProvider &&
        matchQuotation &&
        matchStatus &&
        matchAmount &&
        matchDate
      );
    });
  }, [
    data,
    globalFilter,
    getProviderName,
    getQuotationTitle,
    getQuotationRef,
    providerFilter,
    quotationFilter,
    statusFilter,
    amountFilter,
    amountTypeFilter,
    dateFilter,
    customDateRange,
    providers,
  ]);

  // ─── Statistics ───────────────────────────────────────────────────────────
  const validated = filteredData.filter((d) => d.status === "APPROVED").length;
  const pending = filteredData.filter((d) => d.status === "PENDING").length;
  const rejected = filteredData.filter((d) => d.status === "REJECTED").length;

  const statistics: Array<StatisticProps> = [
    {
      title: "Devis validés",
      value: validated,
      variant: "success",
      more: { title: "Devis rejetés", value: rejected },
    },
    {
      title: "En attente de validation",
      value: pending,
      variant: "default",
      more: { title: "Total de devis", value: filteredData.length },
    },
  ];

  // ─── Columns ──────────────────────────────────────────────────────────────
  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: "ref",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Référence"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <p className="normal-case">{row.getValue("ref")}</p>,
    },
    {
      accessorKey: "commandRequestId",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Demande de cotation"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <div>
          {`${subText({ text: getQuotationTitle(row.getValue("commandRequestId")), length: 21 })} - `}
          <span className="text-destructive text-[12px]">{`${getQuotationRef(
            row.getValue("commandRequestId"),
          )}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "providerId",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Fournisseur"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => getProviderName(row.getValue("providerId")),
    },
    {
      accessorKey: "montant",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Montant"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const value = row.original;
        const total = getQuotationAmount(value, providers);
        return <p className="normal-case">{XAF.format(total)}</p>;
      },
    },
    {
      accessorKey: "element",
      header: () => <span className="tablehead">{"Éléments"}</span>,
      cell: ({ row }) => {
        const value = row.getValue("element") as QuotationElement[];
        return value.length;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Statut"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const value = row.getValue("status") as QuotationStatus;
        const { label, variant } = getStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Date de création"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <p className="normal-case">
          {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm")}
        </p>
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
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setSelectedQuotation(
                    getQuotationTitle(item.commandRequestId),
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
              {/* <DropdownMenuItem
                onClick={() => {
                  setSelectedDevis(item);
                  setModifyDialog(true);
                }}
                variant="primary"
                disabled={item.status !== "APPROVED"}
              >
                <LucidePen />
                {"Demande de modification"}
              </DropdownMenuItem> */}
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Statistics */}
      <div className="grid-stats-4">
        {statistics.map((stat, index) => (
          <StatisticCard key={index} {...stat} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Référence, titre, fournisseur..."
            className="w-64 h-9"
          />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 grid gap-5">
                {/* Fournisseur */}
                <div className="grid gap-1.5">
                  <Label>{"Fournisseur"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {providerFilter === "all"
                            ? "Tous les fournisseurs"
                            : providers.find(
                                (p) => p.id.toString() === providerFilter,
                              )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un fournisseur..."
                          className="h-8"
                          value={providerSearch}
                          onChange={(e) => setProviderSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setProviderFilter("all");
                          setProviderSearch("");
                        }}
                        className={providerFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les fournisseurs</span>
                      </DropdownMenuItem>
                      {providers
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(providerSearch.toLowerCase()),
                        )
                        .map((provider) => (
                          <DropdownMenuItem
                            key={provider.id}
                            onClick={() => {
                              setProviderFilter(provider.id.toString());
                              setProviderSearch("");
                            }}
                            className={
                              providerFilter === provider.id.toString()
                                ? "bg-accent"
                                : ""
                            }
                          >
                            <span>{provider.name}</span>
                          </DropdownMenuItem>
                        ))}
                      {providers.filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(providerSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun fournisseur trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Statut */}
                <div className="grid gap-1.5">
                  <Label>{"Statut"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {statusFilter === "all"
                            ? "Tous les statuts"
                            : QUOTATION_STATUS.find(
                                (s) => s.value === statusFilter,
                              )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un statut..."
                          className="h-8"
                          value={statusSearch}
                          onChange={(e) => setStatusSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setStatusFilter("all");
                          setStatusSearch("");
                        }}
                        className={statusFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les statuts</span>
                      </DropdownMenuItem>
                      {QUOTATION_STATUS.filter((s) =>
                        data.some((d) => d.status === s.value),
                      )
                        .filter((s) =>
                          s.name
                            .toLowerCase()
                            .includes(statusSearch.toLowerCase()),
                        )
                        .map((s) => (
                          <DropdownMenuItem
                            key={s.value}
                            onClick={() => {
                              setStatusFilter(s.value);
                              setStatusSearch("");
                            }}
                            className={
                              statusFilter === s.value ? "bg-accent" : ""
                            }
                          >
                            <span>{s.name}</span>
                          </DropdownMenuItem>
                        ))}
                      {QUOTATION_STATUS.filter((s) =>
                        data.some((d) => d.status === s.value),
                      ).filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun statut trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Demande de cotation */}
                <div className="grid gap-1.5">
                  <Label>{"Demande de cotation"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {quotationFilter === "all"
                            ? "Toutes les demandes"
                            : commands.find(
                                (c) => c.id.toString() === quotationFilter,
                              )?.title || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-w-[360px] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher une demande..."
                          className="h-8"
                          value={quotationSearch}
                          onChange={(e) => setQuotationSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setQuotationFilter("all");
                          setQuotationSearch("");
                        }}
                        className={quotationFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Toutes les demandes</span>
                      </DropdownMenuItem>
                      {commands
                        .filter((c) =>
                          `${c.title} - ${c.reference}`
                            .toLowerCase()
                            .includes(quotationSearch.toLowerCase()),
                        )
                        .map((command) => (
                          <DropdownMenuItem
                            key={command.id}
                            onClick={() => {
                              setQuotationFilter(command.id.toString());
                              setQuotationSearch("");
                            }}
                            className={
                              quotationFilter === command.id.toString()
                                ? "bg-accent"
                                : ""
                            }
                          >
                            <span className="truncate">{`${command.title} - ${command.reference}`}</span>
                          </DropdownMenuItem>
                        ))}
                      {commands.filter((c) =>
                        `${c.title} - ${c.reference}`
                          .toLowerCase()
                          .includes(quotationSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucune demande trouvée
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Montant */}
                <div className="grid gap-1.5">
                  <Label>{"Montant"}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={amountTypeFilter}
                      onValueChange={(v) =>
                        setAmountTypeFilter(
                          v as "greater" | "inferior" | "equal",
                        )
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater">{"Supérieur"}</SelectItem>
                        <SelectItem value="equal">{"Égal"}</SelectItem>
                        <SelectItem value="inferior">{"Inférieur"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Ex. 250 000"
                        value={amountFilter ?? 0}
                        onChange={(e) =>
                          setAmountFilter(Number(e.target.value))
                        }
                        className="w-full pr-12"
                      />
                      <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                        {"FCFA"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Période */}
                <div className="grid gap-1.5">
                  <Label>{"Période"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {dateFilter === undefined
                            ? "Toutes les périodes"
                            : dateFilter === "today"
                              ? "Aujourd'hui"
                              : dateFilter === "week"
                                ? "Cette semaine"
                                : dateFilter === "month"
                                  ? "Ce mois"
                                  : dateFilter === "year"
                                    ? "Cette année"
                                    : "Personnalisé"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter(undefined);
                          setCustomDateRange(undefined);
                          setCustomOpen(false);
                        }}
                        className={dateFilter === undefined ? "bg-accent" : ""}
                      >
                        <span>Toutes les périodes</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("today");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "today" ? "bg-accent" : ""}
                      >
                        <span>Aujourd'hui</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("week");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "week" ? "bg-accent" : ""}
                      >
                        <span>Cette semaine</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("month");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "month" ? "bg-accent" : ""}
                      >
                        <span>Ce mois</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("year");
                          setCustomOpen(false);
                        }}
                        className={dateFilter === "year" ? "bg-accent" : ""}
                      >
                        <span>Cette année</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDateFilter("custom");
                          setCustomOpen(true);
                        }}
                        className={dateFilter === "custom" ? "bg-accent" : ""}
                      >
                        <span>Personnalisé</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                            ? `${format(customDateRange.from, "dd/MM/yyyy")} → ${format(customDateRange.to, "dd/MM/yyyy")}`
                            : "Choisir"}
                        </span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <Calendar
                        mode="range"
                        selected={customDateRange}
                        onSelect={(range) => {
                          if (!range?.from || !range?.to) return;
                          const from = new Date(range.from);
                          const to = new Date(range.to);
                          to.setHours(23, 59, 59, 999);
                          setCustomDateRange({ from, to });
                        }}
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
                          variant="outline"
                          onClick={() => setCustomOpen(false)}
                        >
                          {"Réduire"}
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Reset */}
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
        </div>

        {/* Column visibility */}
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
                else if (column.id === "providerId") columnName = "Fournisseur";
                else if (column.id === "montant") columnName = "Montant";
                else if (column.id === "status") columnName = "Statut";
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

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                    <TableCell key={cell.id}>
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
          <Pagination table={table} />
        </div>
      )}

      {/* Modals */}
      {selectedDevis && (
        <DevisModal
          open={isDevisModalOpen}
          onOpenChange={setIsDevisModalOpen}
          data={selectedDevis}
          title={selectedQuotation}
          users={users}
          providers={providers}
        />
      )}
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
      {selectedDevis && (
        <EditApprovedQuotation
          open={modifyDialog}
          openChange={setModifyDialog}
          quotation={selectedDevis}
        />
      )}
    </div>
  );
}
