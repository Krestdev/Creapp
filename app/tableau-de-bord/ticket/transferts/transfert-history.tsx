"use client";
import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { DateFilter, Transaction, TRANSACTION_STATUS } from "@/types/types";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    ArrowUpDown,
    ChevronDown,
    Settings2
} from "lucide-react";
import React from "react";
import RejectDialog from "./reject-dialog";

interface Props {
  data: Array<Transaction>;
}

function TransferHistory({ data }: Props) {
    const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Transaction>();
  const [reject, setReject] = React.useState<boolean>(false);

  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [amountMinFilter, setAmountMinFilter] = React.useState<number>();
  const [amountMaxFilter, setAmountMaxFilter] = React.useState<number>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [statusFilter, setStatusFilter] = React.useState<"all" | Transaction["status"]>("all");
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  const getBadge = (status:Transaction["status"]):{label: string; variant: VariantProps<typeof badgeVariants>["variant"]} =>{
    const label = TRANSACTION_STATUS.find(t=> t.value === status)?.name ?? "Inconnu";
    switch(status){
        case "APPROVED":
            return {label, variant:"success" };
        case "REJECTED":
            return {label, variant: "destructive"};
        case "PENDING":
            return {label, variant: "amber"};
        default: return {label, variant: "outline"}
    }
  };

  const filteredData = React.useMemo(()=>{
    return data.filter((transaction)=>{
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      //Status Filter
      const matchStatus =
      statusFilter === "all" ? true : transaction.status === statusFilter;
      // Filter amount minimum
        const matchMinAmount = 
        !amountMinFilter ? true : transaction.amount >= amountMinFilter;
        
        // Filter amount maximum
        const matchMaxAmount =
        !amountMaxFilter ? true : transaction.amount <= amountMaxFilter;

        // Filtre par date
        let matchDate = true;
            if (dateFilter) {
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
        matchDate = transaction.createdAt >= startDate && transaction.createdAt <= endDate;
        ;
      }
    }
    return matchStatus && matchDate && matchMaxAmount && matchMinAmount;
    })
  },[data, dateFilter, customDateRange, amountMaxFilter, amountMinFilter, statusFilter]);

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setAmountMaxFilter(undefined);
    setAmountMinFilter(undefined);
    setGlobalFilter("");
    setStatusFilter("all");
  };

  const columns: ColumnDef<Transaction>[] = [
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
        const value = row.original.id;
        return <span>{`TR-${value}`}</span>;
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
            {"Libellé"}
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
      accessorKey: "amount",
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
        const value = row.original.amount;
        const type = row.original.Type;
        return (
          <span className={"font-bold"}>{XAF.format(value)}</span>
        );
      },
    },
    {
      id: "from",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Source"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const source = row.original.from;
        return <span>{source.label}</span>;
      },
    },
    {
      id: "to",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Destination"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const target = row.original.to;
        return <span>{target.label}</span>;
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
            {"Date"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.createdAt;
        return (
          <span>
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </span>
        );
      },
    },
    {
      id: "statut",
      header: () => <span className="tablehead">{"Statut"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const {label, variant} = getBadge(item.status);
        return (
          <Badge variant={variant}>{label}</Badge>
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
      const searchableColumns = ["id", "label", "amount", "from", "to"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        if (column === "from" || column === "to") {
          const source = row.original[column];
          const label = source.label;
          return label?.toLowerCase().includes(searchValue);
        }
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
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, libellé"
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Statut"}</Label>
                <Select value={statusFilter} onValueChange={(v)=>setStatusFilter(v as "all" | Transaction["status"])}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={"all"}>{"Tous"}</SelectItem>
                        {
                            TRANSACTION_STATUS.filter((t)=> t.value !== "PENDING").map((t, id)=>(
                                <SelectItem key={id} value={t.value}>{t.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
              </div>

              {/* Filtre par montant */}
              <div className="grid gap-1.5">
            <Label>{"Montant min"}</Label>
            <div className="relative">
                <Input
                type="number"
                placeholder="Montant minimim"
                value={amountMinFilter}
                onChange={(e)=>setAmountMinFilter(Number(e.target.value))}
                className="w-full"
                />
                <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                    {"FCFA"}
                  </span>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>{"Montant maximum"}</Label>
            <div className="relative">
                <Input
                type="number"
                placeholder="Montant max"
                value={amountMaxFilter}
                onChange={(e)=>setAmountMaxFilter(Number(e.target.value))}
                className="w-full"
                />
                <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                    {"FCFA"}
                  </span>
            </div>
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
                    {column.id === "from"
                      ? "Source"
                      : column.id === "to"
                      ? "Destination"
                      : column.id === "proof"
                      ? "Preuve"
                      : column.id === "createdAt"
                      ? "Date"
                      : column.id === "amount"
                      ? "Montant"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Historique des transferts (${data.length})`}</h3>
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
                  {"Aucune transaction trouvée."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {selected && <RejectDialog transaction={selected} open={reject} openChange={setReject} userId={user?.id ?? 0} />}
    </div>
  );
}

export default TransferHistory;
