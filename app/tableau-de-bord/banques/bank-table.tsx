'use client'
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
  Pencil,
  Settings2
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn, XAF } from "@/lib/utils";
import { Bank, BANK_TYPES } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ViewBank from "./viewBank";
import EditBank from "./editBank";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Props {
  data: Array<Bank>;
  canEdit: boolean;
}


function getTypeBadge(type: Bank["type"]): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
  const typeData = BANK_TYPES.find(t => t.value === type);
  const label = typeData?.name ?? "Inconnu"
  switch (type) {
    case "BANK":
      return { label, variant: "blue" };
    case "CASH_REGISTER":
      return { label, variant: "primary"}
    case "CASH":
      return { label, variant: "lime" };
    case "MOBILE_WALLET":
      return { label, variant: "purple" };
    default:
      return { label: type, variant: "outline" };
  }
};

function BankTable({ data, canEdit }: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    status: false, // Masque la colonne statut par défaut
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "true" | "false">("all");
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | Bank["type"]>("all");
  const [selected, setSelected] = React.useState<Bank>();
  const [view, setView] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);

  const resetAllFilters = ():void =>{
    setSearchFilter("");
    setStatusFilter("all");
    setTypeFilter("all");
  }

  const filteredData:Array<Bank> = React.useMemo(()=>{
    return data.filter(bank=>{
      const search = searchFilter.toLocaleLowerCase();
      //search Filter
      const matchSearch =
      search.trim() === "" ? true : bank.accountNumber?.toLocaleLowerCase().includes(search)
      || bank.balance.toString().includes(search)
      || bank.label.toLocaleLowerCase().includes(search)
      || bank.phoneNum?.includes(search)
      //statusFilter
      const matchStatus =
      statusFilter === "all" ? true : statusFilter === String(bank.Status);
      //typeFilter
      const matchType =
      typeFilter === "all" ? true : typeFilter === bank.type;

      return matchStatus && matchType && matchSearch
    })
  },[data, statusFilter, typeFilter, searchFilter]);

  const columns: ColumnDef<Bank>[] = [
    {
      accessorKey: "id",
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
      cell: ({ row }) => {
        const value = row.original.id
        return <span>{`BA-${value}`}</span>
      },
    },
    {
      accessorKey: "label",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Intitulé du Compte"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.label;
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      accessorKey: "balance",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Soldes"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.balance;
        return <span>{XAF.format(value)}</span>;
      },
    },
    {
      id: "type",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type de compte"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.type;
        const { variant, label } = getTypeBadge(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statut"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.Status
        return <Badge variant={value ? "success" : "destructive"}>{value ? "Actif" : "Désactivé"}</Badge>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Dernière mise à jour"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.updatedAt;
        return <span>{value ? format(new Date(value), "dd MMMM yyyy, p", { locale: fr }) : "--"}</span>;
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
                  setSelected(item);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canEdit}
                onClick={() => {
                  setSelected(item);
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
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableColumns = ["id", "label", "balance"];
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
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
            <Label>{"Recherche"}</Label>
            <Input
              placeholder="Référence"
              value={searchFilter}
              onChange={(v)=>setSearchFilter(v.target.value)}
              className="w-full"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>{"Type de compte"}</Label>
            <Select
              value={typeFilter}
              onValueChange={(value) =>setTypeFilter(value as "all" | Bank["type"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Tous"}</SelectItem>
                {BANK_TYPES.filter(b=> b.value !== "null").map((p) => (
                  <SelectItem key={p.name} value={p.value}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>{"Statut"}</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) =>setStatusFilter(value as "all" | "true" | "false")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Toutes"}</SelectItem>
                <SelectItem value={"true"}>
                  {"Actif"}
                </SelectItem>
                <SelectItem value={"false"}>
                  {"Désactivé"}
                </SelectItem>
              </SelectContent>
            </Select>
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
            <Button variant="outline" className="bg-transparent">
              {"Colonnes"}
              <ChevronDown />
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
                    {column.id === "label" ? "Intitulé du compte"
                      : column.id === "type" ? "Type"
                        : column.id === "balance" ? "Solde"
                          : column.id === "status" ? "Statut"
                            : column.id === "updatedAt" ? "Dernière mise à jour"
                              : column.id === "actions" ? "Actions"
                                : column.id === "id" ? "Référence"
                                  : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Comptes (${data.length})`}</h3>
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
                  className={cn(row.original.Status === false && "bg-red-50")}
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
                  {"Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {selected && <ViewBank bank={selected} open={view} openChange={setView} />}
      {selected && <EditBank bank={selected} open={edit} openChange={setEdit} />}
    </div>
  )
}

export default BankTable