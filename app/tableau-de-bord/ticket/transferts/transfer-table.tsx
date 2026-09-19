"use client";
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
import { transactionQ, TransactionApprovalParams } from "@/queries/transaction";
import { DateFilter, Transaction, User } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowRightIcon,
  ArrowUpDown,
  CheckCircleIcon,
  ChevronDown,
  Ellipsis,
  EyeIcon,
  Settings2,
  TrashIcon,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import ViewTransaction from "../../banques/transactions/view-transaction";
import RejectDialog from "./reject-dialog";
import { SoldeDialog } from "./SoldeDialog";

export interface ApprovalFilters {
  search: string;
  tab: TransactionApprovalParams["tab"];
  date: DateFilter;
  from: string;
  to: string;
  amountMin: number | undefined;
  amountMax: number | undefined;
}

interface Props {
  data: Array<Transaction>;
  users: Array<User>;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  pagination: PaginationState;
  customFilters: ApprovalFilters;
  setCustomFilters: (filters: ApprovalFilters) => void;
  resetAllFilters: () => void;
}

function TransferTable({
  data,
  users,
  paginationOptions,
  pagination,
  customFilters,
  setCustomFilters,
  resetAllFilters,
}: Props) {
  const tabs: Array<{ id: ApprovalFilters["tab"]; title: string }> = [
    {
      id: "PENDING",
      title: "Transferts en attente",
    },
    {
      id: "COMPLETED",
      title: "Historique des transferts",
    },
  ];
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selected, setSelected] = React.useState<Transaction>();
  const [reject, setReject] = React.useState<boolean>(false);
  const [view, setView] = React.useState<boolean>(false);

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

  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  const [showSolde, setShowSolde] = React.useState<boolean>(false);

  const applyAmounts = () => {
    const min = amountMinText.trim() === "" ? undefined : Number(amountMinText);
    const max = amountMaxText.trim() === "" ? undefined : Number(amountMaxText);
    if (min === customFilters.amountMin && max === customFilters.amountMax)
      return;
    setCustomFilters({ ...customFilters, amountMin: min, amountMax: max });
  };

  const approve = useMutation({
    mutationFn: async ({ id }: { id: number }) =>
      transactionQ.approve({
        id,
        status: "ACCEPTED",
        validatorId: user?.id ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Demande approuvée !");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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
        return <p className="normal-case">{value}</p>;
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
          <span className="normal-case flex items-center gap-1.5">
            {source?.label ?? "--"}
            <ArrowRightIcon size={12} />
            {destination?.label ?? "--"}
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <TabBar
          tabs={tabs}
          selectedTab={customFilters.tab}
          setSelectedTab={(tab: ApprovalFilters["tab"]) =>
            setCustomFilters({ ...customFilters, tab })
          }
        />
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Référence, libellé, compte"
            name="search"
            type="search"
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
            className="w-full sm:w-[250px] h-9"
          />
          <Button
            className="h-9"
            onClick={() =>
              setCustomFilters({ ...customFilters, search: searchText })
            }
          >
            {"Rechercher"}
          </Button>
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
                                      : "Sélectionner une période"}
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
      <h3>{`Transferts (${paginationOptions.rowCount ?? data.length})`}</h3>
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
          users={users}
        />
      )}
      <SoldeDialog open={showSolde} onOpenChange={setShowSolde} />
    </div>
  );
}

export default TransferTable;
