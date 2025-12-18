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
import { ArrowUpDown, Check, ChevronDown, Settings2 } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { groupQuotationsByCommandRequest } from "@/lib/quotation-functions";
import {
  CommandRequestT,
  Provider,
  Quotation,
  QuotationGroupStatus,
  QuotationGroup as QuotationGroupT,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";

interface QuotationGroupTableProps {
  providers: Array<Provider>;
  requests: Array<CommandRequestT>;
  quotations: Array<Quotation>;
}

const getGroupStatusLabel = (
  status: QuotationGroupStatus
): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } => {
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
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const router = useRouter();

  // Filtres spécifiques
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | QuotationGroupStatus>("all");

  const data = React.useMemo(() => {
    return groupQuotationsByCommandRequest(requests, quotations, providers);
  }, [requests, quotations, providers]);

  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtre fournisseur
    if (providerFilter !== "all") {
      const providerId = Number(providerFilter);
      filtered = filtered.filter((g) =>
        g.providers.some((p) => p.id === providerId)
      );
    }

    // Filtre statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((g) => g.status === statusFilter);
    }

    return filtered;
  }, [data, providerFilter, statusFilter]);

  const columns: ColumnDef<QuotationGroupT>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Sélectionner tout"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
            {group.commandRequest.title}
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
              <DropdownMenuItem disabled={group.status === "PROCESSED"}
                onClick={() => router.push(`./valider/${group.commandRequest.id}`)}
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
      const providersText = group.providers.map((p) => p.name).join(" ").toLowerCase();
      
      return ref.includes(search) || 
             title.includes(search) || 
             providersText.includes(search);
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
    setProviderFilter("all");
    setStatusFilter("all");
    setGlobalFilter("");
    table.resetColumnFilters();
  };

  return (
    <div className="w-full space-y-4">
      {/* BARRE DE FILTRES */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2/>
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
                <div className="space-y-3">
                  <Label htmlFor="searchGroup">{"Recherche globale"}</Label>
                  <Input
                    id="searchGroup"
                    type="search"
                    placeholder="Référence, titre, fournisseur..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>{"Fournisseur"}</Label>
                  <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous les fournisseurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous les fournisseurs"}</SelectItem>
                      {providers.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>{"Statut"}</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v: "all" | QuotationGroupStatus) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      <SelectItem value="NOT_PROCESSED">{"Non traité"}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{"En cours"}</SelectItem>
                      <SelectItem value="PROCESSED">{"Traité"}</SelectItem>
                    </SelectContent>
                  </Select>
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
          {(providerFilter !== "all" || statusFilter !== "all" || globalFilter) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtres actifs:</span>
              {providerFilter !== "all" && (
                <Badge variant="outline">
                  Fournisseur: {providers.find(p => p.id.toString() === providerFilter)?.name}
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
                if (column.id === "commandRequest") columnName = "Demande de cotation";
                else if (column.id === "providers") columnName = "Fournisseurs";
                else if (column.id === "status") columnName = "Statut";

                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                  <TableHead key={header.id} className="border-r last:border-r-0">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                    <TableCell key={cell.id} className="border-r last:border-r-0">
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
                  className="h-24 text-center border-r last:border-r-0"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {"Aucun résultat trouvé"}
                    </span>
                    {(providerFilter !== "all" || statusFilter !== "all" || globalFilter) && (
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
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
        </div>
        
        {table.getPageCount() > 1 && (
          <Pagination table={table} pageSize={15} />
        )}
      </div>
    </div>
  );
}