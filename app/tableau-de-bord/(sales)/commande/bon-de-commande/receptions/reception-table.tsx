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
import { VariantProps } from "class-variance-authority";
import { ArrowUpDown, ChevronDown, Eye, Pencil, Settings2 } from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

import { useFetchQuery } from "@/hooks/useData";
import { UserQueries } from "@/queries/baseModule";
import { PURCHASE_ORDER_STATUS, Reception, RECEPTION_STATUS } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ViewReception from "./view-reception";
import UpdateReception from "./update-reception";

interface Props {
  data: Array<Reception>;
}

const getStatusBadge = (
  status: Reception["Status"]
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  const statusData = RECEPTION_STATUS.find((s) => s.value === status);
  const label = statusData?.name ?? "Inconnu";
  switch (status) {
    case "PENDING":
      return { label, variant: "amber" };
    case "PARTIAL":
      return { label, variant: "primary" };
    case "COMPLETED":
      return { label, variant: "success" };
    default:
      return { label: "Inconnu", variant: "outline" };
  }
};

export function ReceptionTable({ data }: Props) {
  const usersQuery = new UserQueries();
  const getUsers = useFetchQuery(["users"], usersQuery.getAll);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // filtres spécifiques
  const [statusFilter, setStatusFilter] = React.useState<"all" | Reception["Status"]>("all");

  //ViewModal
  const [view, setView] = React.useState<boolean>(false);
  //EditModal
  const [edit, setEdit] = React.useState<boolean>(false);
  //Selected
  const [selectedValue, setSelectedValue] = React.useState<Reception>();

  const filteredData = React.useMemo(() => {
    let filtered = [...(data ?? [])];

    if (statusFilter !== "all") {
      filtered = filtered.filter((po) => po.Status === statusFilter);
    }

    return filtered;
  }, [data, statusFilter]);

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
      accessorKey: "Reference",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Référence"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <div className="font-medium uppercase">{row.getValue("Reference")}</div>
      ),
    },

    {
      accessorKey: "Command",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Bon de commande"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const name: Reception["Command"] = row.getValue("Command");
        return (
          <div className="font-medium">
            {name ? name.reference : "Pas de Command"}
          </div>
        );
      },
    },

    {
      accessorKey: "Provider",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Fournisseur"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const provider: Reception["Provider"] = row.getValue("Provider");
        return <div className="font-medium">{provider.name}</div>;
      },
    },

    {
      accessorKey: "Deadline",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Date limite"}
          <ArrowUpDown className="h-4 w-4" />
        </span>
      ),
      cell: ({ row }) => {
        const base = row.getValue("Deadline") as string;
        return (
          <div className="font-medium">
            {format(new Date(base), "dd MMMM yyyy", { locale: fr })}
          </div>
        );
      },
    },

    {
      accessorKey: "Deliverables",
      header: () => <span className="tablehead">{"Éléments"}</span>,
      cell: ({ row }) => {
        const value = row.original.Deliverables;
        const amount = value.filter((el) => el.isDelivered === true).length;
        const length = value.length;
        return (
          `${amount}/${length} livré${amount > 1 ? "s" : ""}`
        );
      },
    },

    {
      accessorKey: "status",
      header: () => <span className="tablehead">{"Statut"}</span>,
      cell: ({ row }) => {
        const value = row.original;
        const status = getStatusBadge(value.Status);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setSelectedValue(item);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  setSelectedValue(item);
                  setEdit(true);
                }}
              >
                <Pencil />
                {"Modifier"}
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
    globalFilterFn: (row, _columnId, filterValue) => {
      const s = String(filterValue).toLowerCase();
      const po = row.original;

      const created = new Date(po.createdAt as any);
      const createdText = isNaN(created.getTime())
        ? ""
        : format(created, "dd/MM/yyyy HH:mm").toLowerCase();

      const statusText = (po.Status ?? "").toLowerCase();

      return (
        String(po.id).includes(s) ||
        String(po.providerId).includes(s) ||
        statusText.includes(s) ||
        createdText.includes(s)
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
                <Settings2 className="mr-2 h-4 w-4" />
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
                  <Label htmlFor="searchPO">{"Recherche globale"}</Label>
                  <Input
                    id="searchPO"
                    type="search"
                    placeholder="ID, devis, fournisseur, statut..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>{"Statut"}</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v: "all" | Reception["Status"]) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {PURCHASE_ORDER_STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.name}
                        </SelectItem>
                      ))}
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

          {/* Filtres actifs */}
          {(statusFilter !== "all" || globalFilter) && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Filtres actifs:</span>

              {statusFilter !== "all" && (
                <Badge variant="default" className="font-normal">
                  {`Statut: ${getStatusBadge(statusFilter).label}`}
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
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                let columnName = column.id;
                if (column.id === "id") columnName = "#";
                else if (column.id === "commandId")
                  columnName = "Bon de commande";
                else if (column.id === "providerId") columnName = "Fournisseur";
                else if (column.id === "deliverables") columnName = "Éléments";
                else if (column.id === "status") columnName = "Statut";

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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-muted-foreground">
                      {"Aucun résultat trouvé"}
                    </span>
                    {(statusFilter !== "all" || globalFilter) && (
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

      {/* PAGINATION + INFOS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
        </div>

        {table.getPageCount() > 1 && <Pagination table={table} pageSize={15} />}
      </div>
      {selectedValue && <ViewReception open={view} onOpenChange={setView} reception={selectedValue} />}
      {selectedValue && <UpdateReception open={edit} onOpenChange={setEdit} reception={selectedValue} />}
    </div>
  );
}
