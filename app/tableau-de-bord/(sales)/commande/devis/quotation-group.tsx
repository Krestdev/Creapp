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
import { ArrowUpDown, Check, ChevronDown, Eye, Settings2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
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

import { Pagination } from "@/components/base/pagination";
import { badgeVariants } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationGroup,
  QuotationGroupStatus,
  QuotationGroup as QuotationGroupT,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DevisGroup } from "./DevisGroup";
import { subText } from "@/lib/utils";
import { fr } from "date-fns/locale";

interface QuotationGroupTableProps {
  providers: Array<Provider>;
  requests: Array<CommandRequestT>;
  quotations: Array<Quotation>;
}

const getGroupStatusLabel = (
  status: QuotationGroupStatus,
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  switch (status) {
    case "NOT_PROCESSED":
      return { label: "Non traité", variant: "destructive" };
    case "IN_PROGRESS":
      return { label: "En cours", variant: "amber" };
    case "PROCESSED":
      return { label: "Traité", variant: "success" };
    default:
      return { label: "Inconnu", variant: "outline" };
  }
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
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const router = useRouter();

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

  const columns: ColumnDef<QuotationGroupT>[] = [
    {
      id: "commandRequest",
      accessorFn: (row) => row.commandRequest.reference,
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Demande de cotation"}
          <ArrowUpDown className="h-4 w-4" />
        </span>
      ),
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div className="font-medium">
            {subText({ text: group.commandRequest.title, length: 21 })} -{" "}
            <span className="text-red-500">
              {group.commandRequest.reference}
            </span>
          </div>
        );
      },
    },
    {
      id: "providers",
      accessorFn: (row) => row.providers.map((p) => p.name).join(", "),
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Fournisseurs"}
          <ArrowUpDown className="h-4 w-4" />
        </span>
      ),
      cell: ({ row }) => {
        const group = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            {group.providers.map((provider) => (
              <Badge key={provider.id} variant="outline" className="text-xs">
                {provider.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <span className="tablehead">{"Statut"}</span>,
      cell: ({ row }) => {
        const value = row.getValue("status") as QuotationGroupStatus;
        const { label, variant } = getGroupStatusLabel(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <span className="tablehead">{"Mis à jour le"}</span>,
      cell: ({ row }) => {
        return (
          <div>
            {format(row.getValue("createdAt"), "dd/MM/yyyy, p", { locale: fr })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const group = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {"Actions"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions du groupe"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(group);
                  setOpenView(true);
                }}
                className="cursor-pointer"
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={group.status === "PROCESSED"}
                onClick={() =>
                  router.push(`./valider/${group.commandRequest.id}`)
                }
                className="cursor-pointer"
              >
                <Check />
                {"Traiter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData || [],
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

  const resetAllFilters = () => {
    setGlobalFilter("");
    setProviderFilter("all");
    setCommandRequestFilter("all");
    setStatusFilter("all");
    // Réinitialiser les recherches
    setProviderSearch("");
    setCommandRequestSearch("");
  };

  return (
    <div className="w-full space-y-4">
      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner vos données"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-5">
                <div className="grid gap-2">
                  <Label htmlFor="searchGroup">{"Recherche globale"}</Label>
                  <Input
                    id="searchGroup"
                    type="search"
                    placeholder="Référence, titre, fournisseur..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>

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

          {/* Afficher les filtres actifs */}
          {(providerFilter !== "all" ||
            statusFilter !== "all" ||
            globalFilter) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{"Filtres actifs:"}</span>
              {providerFilter !== "all" && (
                <Badge variant="outline">
                  {`Fournisseur: ${providers.find((p) => p.id.toString() === providerFilter)?.name}`}
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="default" className="font-normal">
                  {`Statut: ${getGroupStatusLabel(statusFilter).label}`}
                </Badge>
              )}
              {globalFilter && (
                <Badge variant="outline" className="font-normal">
                  {`Recherche: "${globalFilter}"`}
                </Badge>
              )}
            </div>
          )}
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
                else if (column.id === "providers") columnName = "Fournisseurs";
                else if (column.id === "status") columnName = "Statut";
                else if (column.id === "createdAt")
                  columnName = "Date de création";

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  className="hover:bg-muted/50"
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
      </div>

      {/* PAGINATION ET INFORMATIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
        </div> */}

        {table.getPageCount() > 1 && <Pagination table={table} pageSize={15} />}
      </div>

      <DevisGroup
        open={openView}
        onOpenChange={setOpenView}
        devis={selectedItem}
      />
    </div>
  );
}
