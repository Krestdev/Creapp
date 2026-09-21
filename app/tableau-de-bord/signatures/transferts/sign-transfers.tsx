"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationOptions,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowRightIcon,
  ArrowUpDown,
  ChevronDown,
  Ellipsis,
  Eye,
  Pencil,
  Settings2,
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
import { TransactionApprovalParams } from "@/queries/transaction";
import {
  Bank,
  DateFilter,
  PayType,
  TransferTransaction,
  User,
} from "@/types/types";
import { format } from "date-fns";
import ViewTransaction from "../../banques/transactions/view-transaction";
import SignTransfer from "./signTransfer";

export interface SignatureFilters {
  search: string;
  tab: TransactionApprovalParams["tab"];
  bankId: string;
  date: DateFilter;
  from: string;
  to: string;
  amountMin: number | undefined;
  amountMax: number | undefined;
}

interface Props {
  data: Array<TransferTransaction>;
  banks: Array<Bank>;
  paymentMethods: Array<PayType>;
  users: Array<User>;
  pendingCount?: number;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  pagination: PaginationState;
  customFilters: SignatureFilters;
  setCustomFilters: (filters: SignatureFilters) => void;
  resetAllFilters: () => void;
}

function SignTransfers({
  data,
  banks,
  users,
  pendingCount,
  paginationOptions,
  pagination,
  customFilters,
  setCustomFilters,
  resetAllFilters,
}: Props) {
  const { user } = useStore();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selected, setSelected] = React.useState<TransferTransaction>();
  const [view, setView] = React.useState<boolean>(false);
  const [toSign, setToSign] = React.useState<boolean>(false);
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

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

  const tabs: Array<{
    id: SignatureFilters["tab"];
    title: string;
    badge?: number;
  }> = [
    {
      id: "PENDING",
      title: "En attente",
      badge: pendingCount,
    },
    {
      id: "COMPLETED",
      title: "Signés",
    },
  ];

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
        return value;
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
        return <p className="normal-case">{XAF.format(value)}</p>;
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
            {source?.label ?? row.original?.fromBankName ?? "--"}
            <ArrowRightIcon size={12} />
            {destination?.label ?? row.original?.toBankName ?? "--"}
          </span>
        );
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
        return <p className="normal-case">{method?.label ?? "Non défini"}</p>;
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
        const value = !!row.original.signers?.some(
          (x) => x.userId === user?.id && x.signed === true,
        );
        return (
          <Badge variant={value === true ? "success" : "destructive"}>
            {value === true ? "Signé" : "Non signé"}
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    ...paginationOptions,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
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
                {/* Filter par Compte(Bank) */}
                <div className="grid gap-1.5">
                  <Label>{"Compte"}</Label>
                  <Select
                    value={customFilters.bankId}
                    onValueChange={(bankId) =>
                      setCustomFilters({ ...customFilters, bankId })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un Compte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {banks
                        .filter((b) => !!b.type)
                        .map((bank) => (
                          <SelectItem key={bank.id} value={String(bank.id)}>
                            {bank.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

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

                {/* Filter by Date */}
                <div className="grid gap-1.5">
                  <Label>{"Période"}</Label>
                  <Select
                    value={customFilters.date ?? "all"}
                    onValueChange={(v) => {
                      setCustomOpen(v === "custom");
                      setCustomFilters({
                        ...customFilters,
                        date:
                          v === "all"
                            ? undefined
                            : (v as Exclude<DateFilter, undefined>),
                        ...(v !== "custom" ? { from: "", to: "" } : {}),
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {"Toutes les périodes"}
                      </SelectItem>
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
      <TabBar
        tabs={tabs}
        selectedTab={customFilters.tab}
        setSelectedTab={(tab: SignatureFilters["tab"]) =>
          setCustomFilters({ ...customFilters, tab })
        }
      />
      <h3>{`Demandes (${paginationOptions.rowCount ?? data.length})`}</h3>
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
        <>
          <ViewTransaction
            open={view}
            openChange={setView}
            transaction={selected}
            users={users}
          />
          <SignTransfer
            open={toSign}
            onOpenChange={setToSign}
            transfer={selected}
          />
        </>
      )}
    </div>
  );
}

export default SignTransfers;
