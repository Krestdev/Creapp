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
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { FilterButton, FilterSearch } from "@/components/ds/filter-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pagination } from "@/components/base/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TabBar } from "@/components/base/TabBar";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import { formatNumber } from "@/lib/format";
import { cn, getQuotationAmount } from "@/lib/utils";
import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationGroup,
  QuotationGroupStatus,
  QuotationGroup as QuotationGroupT,
} from "@/types/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DevisGroup, getGroupStatusLabel } from "./DevisGroup";

interface QuotationGroupTableProps {
  providers: Array<Provider>;
  requests: Array<CommandRequestT>;
  quotations: Array<Quotation>;
}

type GroupTab = "attente" | "traite";

/** Une cotation non traitée ou en cours reste à approuver ; traitée ou annulée, elle est close. */
const inTab = (item: QuotationGroup, tab: GroupTab) =>
  tab === "attente"
    ? item.status === "NOT_PROCESSED" || item.status === "IN_PROGRESS"
    : item.status === "PROCESSED" || item.status === "CANCELLED";

/** Fourchette de montants des devis d'une demande : « 24 000 - 29 000 » ou un seul montant. */
const amountRange = (group: QuotationGroup, providers: Provider[]) => {
  const totals = group.quotations
    .map((q) => Math.round(getQuotationAmount(q, providers)))
    .filter((n) => n > 0);
  if (!totals.length) return "—";
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  return min === max
    ? formatNumber(min)
    : `${formatNumber(min)} - ${formatNumber(max)}`;
};

/** Largeurs fixes des colonnes secondaires (Figma · Approbation devis). */
const COLUMN_CLASS: Record<string, string> = {
  amount: "w-[180px]",
  createdAt: "w-[170px]",
  status: "w-[120px]",
  actions: "w-[200px]",
};

export function QuotationGroupTable({
  providers,
  requests,
  quotations,
}: QuotationGroupTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // La recherche s'applique au clic sur « Rechercher » (ou Entrée), pas à la frappe.
  const [searchInput, setSearchInput] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const router = useRouter();

  // ─── Tab (drives the status filter) ──────────────────────────────────────
  const [selectedTab, setSelectedTab] = React.useState<GroupTab>("attente");

  // Filtres spécifiques
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | QuotationGroupStatus
  >("all");
  const [commandRequestFilter, setCommandRequestFilter] =
    React.useState<string>("all");
  const [openView, setOpenView] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<QuotationGroup | null>(
    null,
  );
  const [providerSearch, setProviderSearch] = React.useState("");
  const [commandRequestSearch, setCommandRequestSearch] = React.useState("");
  //Unique array with all commandRequests Ids
  const commandRequests = [
    ...new Map(
      quotations
        .filter((q) => q.commandRequest)
        .map((q) => [q.commandRequest.id, q.commandRequest]),
    ).values(),
  ];
  const data = React.useMemo(() => {
    return groupQuotationsByCommandRequest(requests, quotations, providers);
  }, [requests, quotations, providers]);

  const filteredData = React.useMemo(() => {
    return data.filter((q) => {
      //Provider Filter
      const matchProvider =
        providerFilter === "all"
          ? true
          : q.providers.some((p) => p.id === Number(providerFilter));
      //Status Filter
      const matchStatus =
        statusFilter === "all" ? true : q.status === statusFilter;
      //Command Request Filter
      const matchCommandRequest =
        commandRequestFilter === "all"
          ? true
          : q.commandRequest.id === Number(commandRequestFilter);

      return matchProvider && matchStatus && matchCommandRequest;
    });
  }, [data, providerFilter, statusFilter, commandRequestFilter]);

  // ─── Tab-filtered data (table only — statistics ignore the tab) ───────────
  const tabFilteredData = React.useMemo(() => {
    return filteredData.filter((item) => inTab(item, selectedTab));
  }, [filteredData, selectedTab]);

  const columns: ColumnDef<QuotationGroupT>[] = [
    {
      id: "commandRequest",
      accessorFn: (row) => row.commandRequest.reference,
      header: () => "Demande de cotation",
      cell: ({ row }) => {
        const group = row.original;
        const count = group.providers.length;
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-caption text-brand">
              {group.commandRequest.reference}
            </span>
            <span className="text-body-medium text-text-primary">
              {group.commandRequest.title}
            </span>
            <span className="text-caption text-text-tertiary">
              {`${count} Fournisseur${count > 1 ? "s" : ""}`}
            </span>
          </div>
        );
      },
    },
    {
      id: "amount",
      accessorFn: (row) => amountRange(row, providers),
      header: () => "Montant (XAF)",
      cell: ({ row }) => (
        <span className="text-body-medium whitespace-nowrap text-text-primary">
          {amountRange(row.original, providers)}
        </span>
      ),
    },
    {
      id: "createdAt",
      accessorFn: (row) => row.commandRequest.createdAt,
      header: () => "Initié le",
      cell: ({ row }) => (
        <span className="text-body whitespace-nowrap text-text-secondary">
          {format(new Date(row.original.commandRequest.createdAt), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => "Statut",
      cell: ({ row }) => {
        const { label, pill } = getGroupStatusLabel(
          row.getValue("status") as QuotationGroupStatus,
        );
        return (
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-label font-semibold whitespace-nowrap",
              pill,
            )}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="block text-right">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const group = row.original;
        const closed =
          group.status === "PROCESSED" || group.status === "CANCELLED";
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(group);
                setOpenView(true);
              }}
            >
              {"Ouvrir"}
            </Button>
            {!closed && (
              <Button
                size="sm"
                onClick={() =>
                  router.push(`./valider/${group.commandRequest.id}`)
                }
              >
                {"Comparer"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: tabFilteredData || [],
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
      const search = String(filterValue).toLowerCase();
      const group = row.original;

      const ref = group.commandRequest.reference?.toLowerCase() || "";
      const title = group.commandRequest.title?.toLowerCase() || "";
      const providersText = group.providers
        .map((p) => p.name)
        .join(" ")
        .toLowerCase();

      return (
        ref.includes(search) ||
        title.includes(search) ||
        providersText.includes(search)
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

  const applySearch = () => setGlobalFilter(searchInput.trim());

  const resetAllFilters = () => {
    setSearchInput("");
    setGlobalFilter("");
    setProviderFilter("all");
    setCommandRequestFilter("all");
    setStatusFilter("all");
    // Réinitialiser les recherches
    setProviderSearch("");
    setCommandRequestSearch("");
  };

  // Le compteur n'est affiché que sur l'onglet actif (Figma · Tab).
  const tabs = (
    [
      { id: "attente", title: "En attente" },
      { id: "traite", title: "Traités" },
    ] as const
  ).map((t) => ({
    ...t,
    badge:
      t.id === selectedTab
        ? filteredData.filter((d) => inTab(d, t.id)).length
        : undefined,
  }));

  const advancedCount =
    (providerFilter !== "all" ? 1 : 0) +
    (commandRequestFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="flex w-full flex-col gap-5">
      <TabBar
        tabs={tabs}
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSearch
            value={searchInput}
            onChange={(value) => {
              setSearchInput(value);
              // Champ vidé : on retire aussitôt le filtre de recherche.
              if (value === "") setGlobalFilter("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            placeholder="Référence, titre, fournisseur"
          />
          <Button type="button" onClick={applySearch}>
            {"Rechercher"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <FilterButton count={advancedCount} />
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner vos données"}
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-5 px-5">
              {/* Filtre par fournisseur */}
              <div className="grid gap-2">
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
                      <div className="flex items-center gap-2">
                        <span>Tous les fournisseurs</span>
                      </div>
                    </DropdownMenuItem>
                    {providers
                      .filter((provider) =>
                        provider.name
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
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {providers.filter((provider) =>
                      provider.name
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

              {/* Filtre par demande de cotation */}
              <div className="grid gap-2">
                <Label>{"Demande de cotation"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {commandRequestFilter === "all"
                          ? "Toutes les demandes"
                          : commandRequests.find(
                              (q) => q.id.toString() === commandRequestFilter,
                            )?.title || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher une demande..."
                        className="h-8"
                        value={commandRequestSearch}
                        onChange={(e) =>
                          setCommandRequestSearch(e.target.value)
                        }
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setCommandRequestFilter("all");
                        setCommandRequestSearch("");
                      }}
                      className={
                        commandRequestFilter === "all" ? "bg-accent" : ""
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span>Toutes les demandes</span>
                      </div>
                    </DropdownMenuItem>
                    {commandRequests
                      .filter((request) =>
                        request.title
                          .toLowerCase()
                          .includes(commandRequestSearch.toLowerCase()),
                      )
                      .map((request) => (
                        <DropdownMenuItem
                          key={request.id}
                          onClick={() => {
                            setCommandRequestFilter(request.id.toString());
                            setCommandRequestSearch("");
                          }}
                          className={
                            commandRequestFilter === request.id.toString()
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span>{request.title}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {commandRequests.filter((request) =>
                      request.title
                        .toLowerCase()
                        .includes(commandRequestSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucune demande trouvée
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtre par statut */}
              <div className="grid gap-2">
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
                          : statusFilter === "NOT_PROCESSED"
                            ? "Non traité"
                            : statusFilter === "IN_PROGRESS"
                              ? "En cours"
                              : statusFilter === "PROCESSED"
                                ? "Traité"
                                : statusFilter === "CANCELLED"
                                  ? "Annulé"
                                  : "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuItem
                      onClick={() => {
                        setStatusFilter("all");
                      }}
                      className={statusFilter === "all" ? "bg-accent" : ""}
                    >
                      <span>Tous les statuts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("NOT_PROCESSED")}
                      className={
                        statusFilter === "NOT_PROCESSED" ? "bg-accent" : ""
                      }
                    >
                      <span>Non traité</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("IN_PROGRESS")}
                      className={
                        statusFilter === "IN_PROGRESS" ? "bg-accent" : ""
                      }
                    >
                      <span>En cours</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("PROCESSED")}
                      className={
                        statusFilter === "PROCESSED" ? "bg-accent" : ""
                      }
                    >
                      <span>Traité</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("CANCELLED")}
                      className={
                        statusFilter === "CANCELLED" ? "bg-accent" : ""
                      }
                    >
                      <span>Annulé</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                variant="outline"
                onClick={resetAllFilters}
                className="w-full"
              >
                {"Réinitialiser les filtres"}
              </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Menu colonnes */}
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
                if (column.id === "commandRequest")
                  columnName = "Demande de cotation";
                else if (column.id === "amount") columnName = "Montant (XAF)";
                else if (column.id === "status") columnName = "Statut";
                else if (column.id === "createdAt") columnName = "Initié le";

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
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

      {/* TABLEAU */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
        <Table className="min-w-[900px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      COLUMN_CLASS[header.column.id],
                      header.column.id === "commandRequest" && "pl-5",
                      header.column.id === "actions" && "pr-5",
                    )}
                  >
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
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3 whitespace-normal normal-case",
                        cell.column.id === "commandRequest" && "pl-5",
                        cell.column.id === "actions" && "pr-5",
                      )}
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
                  className="h-24 text-center border-r last:border-r-0"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {"Aucun résultat trouvé"}
                    </span>
                    {(providerFilter !== "all" ||
                      statusFilter !== "all" ||
                      globalFilter) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetAllFilters}
                      >
                        {"Réinitialiser les filtres"}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Pagination
          table={table}
          noun="cotations"
          className="border-t border-border-default"
        />
      </div>
      <DevisGroup
        open={openView}
        onOpenChange={setOpenView}
        devis={selectedItem}
      />
    </div>
  );
}
