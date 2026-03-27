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
import { ArrowUpDown, ChevronDown, Eye, Settings2 } from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import { cn, getTransactionTypeBadge, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {
  Bank,
  DateFilter,
  Transaction,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ViewTransaction from "./view-transaction";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";

interface Props {
  data: Array<Transaction>;
  canEdit: boolean;
  filterByType?: boolean;
  banks: Array<Bank>;
  users: Array<User>;
}

function TransactionTable({
  data,
  canEdit,
  banks,
  filterByType = false,
  users,
}: Props) {
  const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      type: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Transaction>();
  const [view, setView] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState<boolean>(false);

  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [bankFilter, setBankFilter] = React.useState<string>("all");
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal" | "aucun"
  >("aucun");
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | Transaction["status"]
  >("all");
  const [typeFilter, setTypeFilter] = React.useState<
    "all" | Transaction["Type"]
  >("all");
  // States pour les recherches dans les dropdowns
  const [typeSearch, setTypeSearch] = React.useState("");
  const [bankSearch, setBankSearch] = React.useState("");

  const getBadge = (
    transaction: Transaction,
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    const status = transaction.status;
    const label =
      TRANSACTION_STATUS.find((t) => t.value === status)?.name ?? "Inconnu";
    if (transaction.Type !== "TRANSFER") {
      switch (status) {
        case "APPROVED":
          return { label, variant: "success" };
        case "REJECTED":
          return { label, variant: "destructive" };
        case "PENDING":
          return { label, variant: "amber" };
        default:
          return { label, variant: "outline" };
      }
    }
    const isSigned = transaction.isSigned;
    if (isSigned === true) {
      switch (status) {
        case "APPROVED":
          return { label, variant: "success" };
        case "ACCEPTED":
          return { label: "Signé", variant: "teal" };
        default:
          return { label, variant: "outline" };
      }
    }
    switch (status) {
      case "REJECTED":
        return { label, variant: "destructive" };
      case "PENDING":
        return { label, variant: "amber" };
      case "ACCEPTED":
        return { label: "À signer", variant: "primary" };
      case "APPROVED":
        return { label, variant: "success" };
      default:
        return { label, variant: "outline" };
    }
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setAmountFilter(0);
    setAmountTypeFilter("greater");
    setGlobalFilter("");
    setStatusFilter("all");
    setTypeFilter("all");
    setBankFilter("all");
    setSearchFilter("");
  };

  const filteredData = React.useMemo(() => {
    return data.filter((transaction) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      const search = searchFilter.toLocaleLowerCase();

      // Search Filter - amélioré pour inclure les comptes source et destination
      const matchSearch =
        search.trim() === ""
          ? true
          : (() => {
              // Vérifier si la recherche correspond à un ID
              const isIdMatch = transaction.id.toString().includes(search);
              if (isIdMatch) return true;

              // Vérifier si la recherche correspond au libellé
              const isLabelMatch = transaction.label
                .toLocaleLowerCase()
                .includes(search);
              if (isLabelMatch) return true;

              // Vérifier si la recherche correspond au montant
              const isAmountMatch = transaction.amount
                .toString()
                .includes(search);
              if (isAmountMatch) return true;

              // Vérifier si la recherche correspond au compte source
              const sourceLabel = transaction.from.label.toLocaleLowerCase();
              const isSourceMatch = sourceLabel.includes(search);
              if (isSourceMatch) return true;

              // Vérifier si la recherche correspond au compte destination
              const destinationLabel = transaction.to.label.toLocaleLowerCase();
              const isDestinationMatch = destinationLabel.includes(search);
              if (isDestinationMatch) return true;

              return false;
            })();

      // Status Filter
      const matchStatus =
        statusFilter === "all" ? true : transaction.status === statusFilter;

      // Bank Filter - selon le type de transaction
      let matchBank = bankFilter === "all" ? true : false;

      if (bankFilter !== "all") {
        switch (transaction.Type) {
          case "DEBIT":
            matchBank = transaction.from.id.toString() === bankFilter;
            break;
          case "CREDIT":
            matchBank = transaction.to.id.toString() === bankFilter;
            break;
          case "TRANSFER":
            matchBank =
              transaction.from.id.toString() === bankFilter ||
              transaction.to.id.toString() === bankFilter;
            break;
          default:
            matchBank = false;
        }
      }

      // Type Filter
      const matchType =
        typeFilter === "all" ? true : transaction.Type === typeFilter;

      // Filter amount
      const matchAmount =
        amountTypeFilter === "aucun"
          ? true
          : amountTypeFilter === "greater"
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
            new Date(transaction.createdAt) >= startDate &&
            new Date(transaction.createdAt) <= endDate;
        }
      }

      return (
        matchStatus &&
        matchType &&
        matchDate &&
        matchAmount &&
        matchBank &&
        matchSearch
      );
    });
  }, [
    data,
    dateFilter,
    customDateRange,
    amountFilter,
    amountTypeFilter,
    statusFilter,
    typeFilter,
    bankFilter,
    searchFilter,
  ]);

  const entreeTrans = filteredData.filter((t) => t.Type === "CREDIT");
  const montantEntree = entreeTrans.reduce((sum, t) => sum + t.amount, 0);
  const sortieTrans = filteredData.filter((t) => t.Type === "DEBIT");
  const montantSotie = sortieTrans.reduce((sum, t) => sum + t.amount, 0);
  const total = filteredData.filter((x) => x.Type !== "TRANSFER");

  const Statistics: Array<StatisticProps> = [
    {
      title: "Entrée",
      value: entreeTrans.length,
      variant: "secondary",
      more: {
        title: "Montant Total",
        value: XAF.format(montantEntree),
      },
    },
    {
      title: "Sortie",
      value: sortieTrans.length,
      variant: "default",
      more: {
        title: "Montant Total",
        value: XAF.format(montantSotie),
      },
    },
    {
      title: "Total",
      value: total.length,
      variant: "default",
    },
  ];

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
      id: "type",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.Type;
        const { variant, label } = getTransactionTypeBadge(value);
        return <Badge variant={variant}>{label}</Badge>;
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
        const value = row.original;
        const { variant, label } = getBadge(value);
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Crée par"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.userId;
        const user = users.find((u) => u.id === value);
        return (
          <span>
            {user ? user.firstName.concat(" ", user.lastName) : "N/A"}
          </span>
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
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              {/* {canEdit && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(item);
                    setEdit(true);
                  }}
                >
                  <Pencil />
                  {"Modifier"}
                </DropdownMenuItem>
              )} */}
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
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Sheet>
          <SheetTrigger asChild className="w-fit">
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
            <div className="px-5 grid gap-5 mt-4">
              {/* Recherche globale */}
              <div className="grid gap-1.5">
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, libellé, source, destination"
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  className="w-full"
                />
              </div>

              {/* Type de Transaction */}
              {!!filterByType && (
                <div className="grid gap-1.5">
                  <Label>{"Type de Transaction"}</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {typeFilter === "all"
                            ? "Tous les types"
                            : TRANSACTION_TYPES.find(
                                (t) => t.value === typeFilter,
                              )?.name || "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                      <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                        <Input
                          placeholder="Rechercher un type..."
                          className="h-8"
                          value={typeSearch}
                          onChange={(e) => setTypeSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setTypeFilter("all");
                          setTypeSearch("");
                        }}
                        className={typeFilter === "all" ? "bg-accent" : ""}
                      >
                        <span>Tous les types</span>
                      </DropdownMenuItem>
                      {TRANSACTION_TYPES.filter((t) => t.value !== "TRANSFER")
                        .filter((t) =>
                          t.name
                            .toLowerCase()
                            .includes(typeSearch.toLowerCase()),
                        )
                        .map((t) => (
                          <DropdownMenuItem
                            key={t.value}
                            onClick={() => {
                              setTypeFilter(t.value);
                              setTypeSearch("");
                            }}
                            className={
                              typeFilter === t.value ? "bg-accent" : ""
                            }
                          >
                            <span>{t.name}</span>
                          </DropdownMenuItem>
                        ))}
                      {TRANSACTION_TYPES.filter(
                        (t) => t.value !== "TRANSFER",
                      ).filter((t) =>
                        t.name.toLowerCase().includes(typeSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          Aucun type trouvé
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Compte (Bank) */}
              <div className="grid gap-1.5">
                <Label>{"Compte"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {bankFilter === "all"
                          ? "Tous les comptes"
                          : banks.find((b) => String(b.id) === bankFilter)
                              ?.label || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un compte..."
                        className="h-8"
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setBankFilter("all");
                        setBankSearch("");
                      }}
                      className={bankFilter === "all" ? "bg-accent" : ""}
                    >
                      <span>Tous les comptes</span>
                    </DropdownMenuItem>
                    {banks
                      .filter((b) => !!b.type && b.type !== "null")
                      .filter((b) =>
                        b.label
                          .toLowerCase()
                          .includes(bankSearch.toLowerCase()),
                      )
                      .map((bank) => (
                        <DropdownMenuItem
                          key={bank.id}
                          onClick={() => {
                            setBankFilter(String(bank.id));
                            setBankSearch("");
                          }}
                          className={
                            bankFilter === String(bank.id) ? "bg-accent" : ""
                          }
                        >
                          <span className="truncate">{bank.label}</span>
                        </DropdownMenuItem>
                      ))}
                    {banks
                      .filter((b) => !!b.type && b.type !== "null")
                      .filter((b) =>
                        b.label
                          .toLowerCase()
                          .includes(bankSearch.toLowerCase()),
                      ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun compte trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Comparer le montant */}
              <div className="grid gap-1.5">
                <Label>{"Comparer le montant"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {amountTypeFilter === "aucun"
                          ? "Aucun"
                          : amountTypeFilter === "greater"
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
                      onClick={() => setAmountTypeFilter("aucun")}
                      className={
                        amountTypeFilter === "aucun" ? "bg-accent" : ""
                      }
                    >
                      <span>Aucun</span>
                    </DropdownMenuItem>
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

              {/* Montant */}
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
                                  : dateFilter === "custom"
                                    ? "Personnalisé"
                                    : "Sélectionner"}
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
        <div className="grid-stats-4">
          {Statistics.map((statistic, id) => (
            <StatisticCard key={id} {...statistic} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-end gap-4">
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
                              : column.id === "type"
                                ? "Type"
                                : // : column.id === "status"
                                  //   ? "Statut"
                                  column.id === "bank"
                                  ? "Banque"
                                  : column.id === "ref"
                                    ? "Référence"
                                    : column.id === "label"
                                      ? "Libellé"
                                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Transactions (${data.length})`}</h3>
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
        <ViewTransaction
          transaction={selected}
          open={view}
          openChange={setView}
          users={users}
        />
      )}
      {/* {selected && <EditTransaction transaction={selected} open={edit} openChange={setEdit} />} */}
    </div>
  );
}

export default TransactionTable;
