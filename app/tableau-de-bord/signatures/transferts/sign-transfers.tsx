"use client";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from "@tanstack/react-table";
import {
    ArrowRightIcon,
    ArrowUpDown,
    ChevronDown,
    Eye,
    Pencil,
    Settings2
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { TabBar } from "@/components/base/TabBar";
import { Badge } from "@/components/ui/badge";
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
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {
    Bank,
    DateFilter,
    PayType,
    TransferTransaction
} from "@/types/types";
import { format } from "date-fns";
import ViewTransaction from "../../banques/transactions/view-transaction";
import SignTransfer from "./signTransfer";

interface Props {
  data: Array<TransferTransaction>;
  banks: Array<Bank>;
  paymentMethods: Array<PayType>;
}

function SignTransfers({ data, banks, paymentMethods }: Props) {
  const { user } = useStore();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [selected, setSelected] = React.useState<TransferTransaction>();
  const [view, setView] = React.useState<boolean>(false);
  const [toSign, setToSign] = React.useState<boolean>(false);

  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [bankFilter, setBankFilter] = React.useState<string>("all");
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal"
  >("greater");
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  const [selectedTab, setSelectedTab] = React.useState<number>(0);
    const tabs = [
      {
        id: 0,
        title: "En attente",
        badge: data.filter(t=> t.signers?.find(s=> s.userId === user?.id)?.signed === false ).length,
      },
      {
        id: 1,
        title: "Signés",
      },
    ];

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setAmountFilter(0);
    setAmountTypeFilter("greater");
    setGlobalFilter("");
    setSearchFilter("");
    setBankFilter("all");
  };

  const filteredData = React.useMemo(() => {
    return data
      .filter((transaction) => {
        const now = new Date();
        let startDate = new Date();
        let endDate = now;
        const search = searchFilter.toLowerCase();
        //Tab Filter
        const matchTab =
          selectedTab === 0 ? transaction.isSigned === false && !transaction.signers.find(s=> s.userId === user?.id) :
          !!transaction.signers.find(u=>u.userId === user?.id)
        // Bank Filter - selon le type de transaction
        let matchBank =
          bankFilter === "all"
            ? true
            : transaction.from.id.toString() === bankFilter ||
              transaction.to.id.toString() === bankFilter;
        // Search Filter
        const matchSearch =
          search.trim() === ""
            ? true
            : transaction.id.toString().toLocaleLowerCase().includes(search) ||
              transaction.label.toLocaleLowerCase().includes(search) ||
              transaction.amount.toString().includes(search) ||
              transaction.to.label.toLocaleLowerCase().includes(search) ||
              transaction.from.label.toLocaleLowerCase().includes(search);

        // Filter amount
        const matchAmount =
          amountTypeFilter === "greater"
            ? transaction.amount > amountFilter
            : amountTypeFilter === "equal"
              ? transaction.amount === amountFilter
              : transaction.amount < amountFilter;

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
              transaction.createdAt >= startDate &&
              transaction.createdAt <= endDate;
          }
        }
        return (
          matchTab && matchDate && matchAmount && matchBank && matchSearch
        );
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [
    data,
    dateFilter,
    customDateRange,
    amountFilter,
    amountTypeFilter,
    bankFilter,
    searchFilter,
    user?.id,
    selectedTab
  ]);

  const columns: ColumnDef<TransferTransaction>[] = [
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
        return (
          <span
          >
            {XAF.format(value)}
          </span>
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
            {"Mouvement"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const source = row.original.from;
        const destination = row.original.to
        return <span className="flex items-center gap-1.5">{source.label}<ArrowRightIcon size={12} />{destination.label}</span>;
      },
    },
    {
      id: "documentType",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type de document"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const method = row.original.method;
        return <span>{method?.label ?? "Non défini"}</span>;
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
        const value = !!row.original.signers?.some(x=> x.userId === user?.id && x.signed === true);
        return <Badge variant={value === true ? "success" : "destructive"}>{value === true ? "Signé" : "Non signé"}</Badge>;
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
                disabled={item.isSigned === true}
                onClick={() => {
                  setSelected(item);
                  setToSign(true);
                }}
              >
                <Pencil />
                {"Signer"}
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
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableColumns = ["id", "label", "amount", "type", "from", "to"];
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
              {/**Global Filter (Search) */}
              <div className="grid gap-1.5">
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, libellé"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  className="max-w-sm"
                />
              </div>
              {/* Filter par Compte(Bank) */}
              <div className="grid gap-1.5">
                <Label>{"Compte"}</Label>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un Compte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {banks.filter(b=> !!b.type).map((bank) => (
                      <SelectItem key={bank.id} value={String(bank.id)}>
                        {bank.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filter by amount */}
              <div className="grid gap-1.5">
                <Label>{"Montant"}</Label>
                <Select
                  value={amountTypeFilter}
                  onValueChange={(v) =>
                    setAmountTypeFilter(v as "greater" | "inferior" | "equal")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greater">{"Supérieur"}</SelectItem>
                    <SelectItem value="equal">{"Égal"}</SelectItem>
                    <SelectItem value="inferior">{"Inférieur"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{"Montant"}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Ex. 250 000"
                    value={amountFilter ?? 0}
                    onChange={(e) => setAmountFilter(Number(e.target.value))}
                    className="w-full pr-12"
                  />
                  <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                    {"FCFA"}
                  </span>
                </div>
              </div>

              {/* Filter by Date */}
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
                              : column.id === "amount"
                                ? "Montant"
                                : column.id === "label"
                                  ? "Libellé"
                                  : column.id === "status"
                                    ? "Statut"
                                    : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TabBar tabs={tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <h3>{`Demandes (${filteredData.length})`}</h3>
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
                  {"Aucune transaction trouvée."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {
        selected && 
        <>
        <ViewTransaction open={view} openChange={setView} transaction={selected} />
        <SignTransfer open={toSign} onOpenChange={setToSign} transfer={selected} />
        </>
      }
    </div>
  );
}

export default SignTransfers;
