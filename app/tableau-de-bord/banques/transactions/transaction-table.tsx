"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationOptions,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Ellipsis,
  Eye,
  Settings2,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
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
import { cn, getTransactionTypeBadge, subText, XAF } from "@/lib/utils";
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

export interface TransactionFilters {
  search: string;
  status: string;
  type: string;
  bankId: string;
  date: DateFilter;
  from: string;
  to: string;
  amountMin: number | undefined;
  amountMax: number | undefined;
}

interface Props {
  data: Array<Transaction>;
  canEdit?: boolean;
  filterByType?: boolean;
  banks: Array<Bank>;
  users: Array<User>;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  pagination: PaginationState;
  customFilters: TransactionFilters;
  setCustomFilters: (filters: TransactionFilters) => void;
  resetAllFilters: () => void;
}

function TransactionTable({
  data,
  // canEdit,
  banks,
  filterByType = false,
  users,
  paginationOptions,
  pagination,
  customFilters,
  setCustomFilters,
  resetAllFilters,
}: Props) {
  // const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selected, setSelected] = React.useState<Transaction>();
  const [view, setView] = React.useState<boolean>(false);
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  // States pour les recherches dans les dropdowns
  const [typeSearch, setTypeSearch] = React.useState("");
  const [bankSearch, setBankSearch] = React.useState("");

  // Saisies locales, appliquées au backend sur Entrée / clic / blur
  const [searchText, setSearchText] = React.useState(customFilters.search);
  const [amountMinText, setAmountMinText] = React.useState(
    customFilters.amountMin?.toString() ?? "",
  );
  const [amountMaxText, setAmountMaxText] = React.useState(
    customFilters.amountMax?.toString() ?? "",
  );
  React.useEffect(() => {
    setSearchText(customFilters.search);
  }, [customFilters.search]);
  React.useEffect(() => {
    setAmountMinText(customFilters.amountMin?.toString() ?? "");
    setAmountMaxText(customFilters.amountMax?.toString() ?? "");
  }, [customFilters.amountMin, customFilters.amountMax]);

  const applyAmounts = () => {
    const min = amountMinText.trim() === "" ? undefined : Number(amountMinText);
    const max = amountMaxText.trim() === "" ? undefined : Number(amountMaxText);
    if (min === customFilters.amountMin && max === customFilters.amountMax)
      return;
    setCustomFilters({ ...customFilters, amountMin: min, amountMax: max });
  };

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

  const entreeTrans = data.filter((t) => t.Type === "CREDIT");
  const montantEntree = entreeTrans.reduce((sum, t) => sum + t.amount, 0);
  const sortieTrans = data.filter((t) => t.Type === "DEBIT");
  const montantSotie = sortieTrans.reduce((sum, t) => sum + t.amount, 0);
  const total = data.filter((x) => x.Type !== "TRANSFER");

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
        return <p className="normal-case">{`TR-${value}`}</p>;
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
        return subText({ text: value, length: 21 });
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
          <p
            className={cn(
              "font-bold normal-case",
              type === "CREDIT"
                ? "text-green-600"
                : type === "DEBIT" && "text-red-600",
            )}
          >
            {XAF.format(value)}
          </p>
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
        return (
          <p className="normal-case">
            {source?.label ?? row.original?.fromBankName ?? "--"}
          </p>
        );
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
        const bankName = row.original?.toBankName;
        return (
          <p className="normal-case">{target?.label ?? bankName ?? "--"}</p>
        );
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
            {"Effectué le"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.updatedAt;
        return (
          <p className="normal-case">
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </p>
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
          <p className="normal-case">
            {user
              ? subText({
                  text: user.firstName.concat(" ", user.lastName),
                  length: 21,
                })
              : "N/A"}
          </p>
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
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    ...paginationOptions,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            name="search"
            type="search"
            id="searchCommand"
            placeholder="Recherche par référence, libellé, source, destination..."
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              if (event.target.value === "") {
                setCustomFilters({ ...customFilters, search: "" });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setCustomFilters({ ...customFilters, search: searchText });
              }
            }}
            className="max-w-md h-10 bg-background"
          />
          <Button
            className="h-10"
            onClick={() =>
              setCustomFilters({ ...customFilters, search: searchText })
            }
          >
            {"Rechercher"}
          </Button>
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
                            {customFilters.type === "all"
                              ? "Tous les types"
                              : TRANSACTION_TYPES.find(
                                  (t) => t.value === customFilters.type,
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
                            setCustomFilters({ ...customFilters, type: "all" });
                            setTypeSearch("");
                          }}
                          className={
                            customFilters.type === "all" ? "bg-accent" : ""
                          }
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
                                setCustomFilters({
                                  ...customFilters,
                                  type: t.value,
                                });
                                setTypeSearch("");
                              }}
                              className={
                                customFilters.type === t.value
                                  ? "bg-accent"
                                  : ""
                              }
                            >
                              <span>{t.name}</span>
                            </DropdownMenuItem>
                          ))}
                        {TRANSACTION_TYPES.filter(
                          (t) => t.value !== "TRANSFER",
                        ).filter((t) =>
                          t.name
                            .toLowerCase()
                            .includes(typeSearch.toLowerCase()),
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
                          {customFilters.bankId === "all"
                            ? "Tous les comptes"
                            : banks.find(
                                (b) => String(b.id) === customFilters.bankId,
                              )?.label || "Sélectionner"}
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
                          setCustomFilters({ ...customFilters, bankId: "all" });
                          setBankSearch("");
                        }}
                        className={
                          customFilters.bankId === "all" ? "bg-accent" : ""
                        }
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
                              setCustomFilters({
                                ...customFilters,
                                bankId: String(bank.id),
                              });
                              setBankSearch("");
                            }}
                            className={
                              customFilters.bankId === String(bank.id)
                                ? "bg-accent"
                                : ""
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

                {/* Montant */}
                <div className="grid gap-1.5">
                  <Label>{"Montant minimum"}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Ex. 250 000"
                      value={amountMinText}
                      onChange={(e) => setAmountMinText(e.target.value)}
                      onBlur={applyAmounts}
                      onKeyDown={(e) => e.key === "Enter" && applyAmounts()}
                      className="w-full pr-12"
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
                      placeholder="Ex. 1 000 000"
                      value={amountMaxText}
                      onChange={(e) => setAmountMaxText(e.target.value)}
                      onBlur={applyAmounts}
                      onKeyDown={(e) => e.key === "Enter" && applyAmounts()}
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
                          {customFilters.date === undefined
                            ? "Toutes les périodes"
                            : customFilters.date === "today"
                              ? "Aujourd'hui"
                              : customFilters.date === "week"
                                ? "Cette semaine"
                                : customFilters.date === "month"
                                  ? "Ce mois"
                                  : customFilters.date === "year"
                                    ? "Cette année"
                                    : customFilters.date === "custom"
                                      ? "Personnalisé"
                                      : "Sélectionner"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuItem
                        onClick={() => {
                          setCustomFilters({
                            ...customFilters,
                            date: undefined,
                            from: "",
                            to: "",
                          });
                          setCustomOpen(false);
                        }}
                        className={
                          customFilters.date === undefined ? "bg-accent" : ""
                        }
                      >
                        <span>Toutes les périodes</span>
                      </DropdownMenuItem>
                      {(
                        [
                          ["today", "Aujourd'hui"],
                          ["week", "Cette semaine"],
                          ["month", "Ce mois"],
                          ["year", "Cette année"],
                        ] as const
                      ).map(([value, label]) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => {
                            setCustomFilters({
                              ...customFilters,
                              date: value,
                              from: "",
                              to: "",
                            });
                            setCustomOpen(false);
                          }}
                          className={
                            customFilters.date === value ? "bg-accent" : ""
                          }
                        >
                          <span>{label}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => {
                          setCustomFilters({
                            ...customFilters,
                            date: "custom",
                          });
                          setCustomOpen(true);
                        }}
                        className={
                          customFilters.date === "custom" ? "bg-accent" : ""
                        }
                      >
                        <span>Personnalisé</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Collapsible
                    open={customOpen}
                    onOpenChange={setCustomOpen}
                    disabled={customFilters.date !== "custom"}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {"Plage personnalisée"}
                        <span className="text-muted-foreground text-xs">
                          {customFilters.from && customFilters.to
                            ? `${format(
                                new Date(customFilters.from),
                                "dd/MM/yyyy",
                              )} → ${format(new Date(customFilters.to), "dd/MM/yyyy")}`
                            : "Choisir"}
                        </span>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4 pt-4">
                      <Calendar
                        mode="range"
                        selected={{
                          from: customFilters.from
                            ? new Date(customFilters.from)
                            : undefined,
                          to: customFilters.to
                            ? new Date(customFilters.to)
                            : undefined,
                        }}
                        onSelect={(range) => {
                          if (!range?.from || !range?.to) return;
                          const from = new Date(range.from);
                          const to = new Date(range.to);
                          to.setHours(23, 59, 59, 999);
                          setCustomFilters({
                            ...customFilters,
                            from: from.toISOString(),
                            to: to.toISOString(),
                          });
                        }}
                        numberOfMonths={1}
                        className="rounded-md border w-full"
                      />
                      <div className="space-y-1">
                        <Button
                          className="w-full"
                          onClick={() => {
                            setCustomFilters({
                              ...customFilters,
                              date: undefined,
                              from: "",
                              to: "",
                            });
                            setCustomOpen(false);
                          }}
                        >
                          {"Annuler"}
                        </Button>
                        <Button
                          className="w-full"
                          variant={"outline"}
                          onClick={() => setCustomOpen(false)}
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
                    onClick={() => {
                      setCustomOpen(false);
                      resetAllFilters();
                    }}
                    className="w-full"
                  >
                    {"Réinitialiser"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
      <h3>{`Transactions (${paginationOptions.rowCount ?? data.length})`}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
