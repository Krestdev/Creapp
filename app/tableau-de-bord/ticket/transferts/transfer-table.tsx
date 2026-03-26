"use client";
import { Pagination } from "@/components/base/pagination";
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
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { transactionQ } from "@/queries/transaction";
import { DateFilter, Transaction } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRightIcon,
  ArrowUpDown,
  CheckCircleIcon,
  ChevronDown,
  EyeIcon,
  Settings2,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import RejectDialog from "./reject-dialog";
import { TabBar } from "@/components/base/TabBar";
import { Badge } from "@/components/ui/badge";
import ViewTransaction from "../../banques/transactions/view-transaction";
import { SoldeDialog } from "./SoldeDialog";

interface Props {
  data: Array<Transaction>;
}

function TransferTable({ data }: Props) {
  const tabs = [
    {
      id: 0,
      title: "Transferts en attente",
    },
    {
      id: 1,
      title: "Historique des transferts",
    },
  ];
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Transaction>();
  const [reject, setReject] = React.useState<boolean>(false);
  const [view, setView] = React.useState<boolean>(false);

  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal"
  >("greater");
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  const [showSolde, setShowSolde] = React.useState<boolean>(false);

  const approve = useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      transactionQ.approve({
        id,
        status: "ACCEPTED",
        validatorId: user?.id ?? 0,
      }),
    onSuccess: () => {
      toast.success("Demande approuvée !");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredData = React.useMemo(() => {
    return data.filter((transaction) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      const search = searchFilter.toLocaleLowerCase();
      // Search Filter
      const matchSearch =
        search.trim() === ""
          ? true
          : transaction.id.toString().toLocaleLowerCase().includes(search) ||
            transaction.label.toLocaleLowerCase().includes(search) ||
            transaction.amount.toString().includes(search) ||
            transaction.to.label.toLocaleLowerCase().includes(search) ||
            transaction.from.label.toLocaleLowerCase().includes(search);
      //Filter Tab
      const matchTab =
        selectedTab === 0
          ? transaction.Type === "TRANSFER" && transaction.status === "PENDING"
          : transaction.Type === "TRANSFER" && transaction.status !== "PENDING";

      // Filter amount
      const matchAmount =
        amountTypeFilter === "greater"
          ? transaction.amount >= amountFilter
          : amountTypeFilter === "equal"
            ? transaction.amount === amountFilter
            : transaction.amount <= amountFilter;

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
            new Date(transaction.createdAt) >= startDate &&
            new Date(transaction.createdAt) <= endDate;
        }
      }
      return matchDate && matchAmount && matchTab && matchSearch;
    });
  }, [
    data,
    dateFilter,
    customDateRange,
    amountFilter,
    amountTypeFilter,
    selectedTab,
    searchFilter,
  ]);

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setAmountFilter(0);
    setAmountTypeFilter("greater");
    setGlobalFilter("");
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
          <span
            className={cn(
              "font-bold",
              type === "CREDIT"
                ? "text-green-600"
                : type === "DEBIT" && "text-red-600",
            )}
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
        const destination = row.original.to;
        return (
          <span className="flex items-center gap-1.5">
            {source.label}
            <ArrowRightIcon size={12} />
            {destination.label}
          </span>
        );
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
        const value = row.original.status;
        return (
          <Badge
            variant={
              value === "PENDING"
                ? "amber"
                : value === "REJECTED"
                  ? "destructive"
                  : "success"
            }
          >
            {value === "PENDING"
              ? "En attente"
              : value === "REJECTED"
                ? "Rejeté"
                : "Approuvé"}
          </Badge>
        );
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
                <EyeIcon />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={approve.isPending || item.status !== "PENDING"}
                onClick={() => approve.mutate({ id: item.id })}
              >
                <CheckCircleIcon />
                {"Valider"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={approve.isPending || item.status !== "PENDING"}
                onClick={() => {
                  setSelected(item);
                  setReject(true);
                }}
              >
                <TrashIcon />
                {"Rejeter"}
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
        <TabBar
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowSolde(true)} variant={"primary"}>
            {"Voir les soldes"}
          </Button>
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
                  {"Configurer les filtres pour affiner les données"}
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
                    value={searchFilter}
                    onChange={(event) => setSearchFilter(event.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Filter by amount */}
                <div className="grid gap-1.5">
                  <Label>{"Comparer le montant"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {amountTypeFilter === "greater"
                            ? "Supérieur"
                            : amountTypeFilter === "equal"
                              ? "Égal"
                              : amountTypeFilter === "inferior"
                                ? "Inférieur"
                                : "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("greater")}
                        className={
                          amountTypeFilter === "greater" ? "bg-accent" : ""
                        }
                      >
                        <span>Supérieur</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("equal")}
                        className={
                          amountTypeFilter === "equal" ? "bg-accent" : ""
                        }
                      >
                        <span>Égal</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAmountTypeFilter("inferior")}
                        className={
                          amountTypeFilter === "inferior" ? "bg-accent" : ""
                        }
                      >
                        <span>Inférieur</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

                {/* Filtre par période */}
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
                                    : dateFilter === "custom"
                                      ? "Personnalisé"
                                      : "Sélectionner une période"}
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
                        ? "Mouvement"
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
      </div>
      <h3>{`Transferts (${filteredData.length})`}</h3>
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
      {selected && (
        <RejectDialog
          transaction={selected}
          open={reject}
          openChange={setReject}
          userId={user?.id ?? 0}
        />
      )}
      {selected && (
        <ViewTransaction
          open={view}
          openChange={setView}
          transaction={selected}
        />
      )}
      <SoldeDialog open={showSolde} onOpenChange={setShowSolde} />
    </div>
  );
}

export default TransferTable;
