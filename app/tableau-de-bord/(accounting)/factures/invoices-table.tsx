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
import {
  ArrowUpDown,
  BanIcon,
  ChevronDown,
  Eye,
  Settings2,
  WalletCardsIcon,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components//base/pagination";
import { badgeVariants } from "@/components/ui/badge";
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
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
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
import {
  BonsCommande,
  DateFilter,
  INVOICE_STATUS,
  Invoice,
  PaymentRequest,
  Provider,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import Link from "next/link";
import CancelInvoice from "./cancel-invoice";
import ViewInvoice from "./view-invoice";
import ViewInvoicePayment from "./view-invoice-payment";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface Props {
  invoices: Array<Invoice>;
  purchases: Array<BonsCommande>;
  payments: Array<PaymentRequest>;
  providers: Array<Provider>;
  users: Array<User>;
}

export function getInvoiceStatusBadge(status: Invoice["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const label = INVOICE_STATUS.find((x) => x.value === status)?.name ?? status;
  switch (status) {
    case "UNPAID":
      return { label, variant: "destructive" };
    case "PAID":
      return { label, variant: "success" };
    case "CANCELLED":
      return { label, variant: "default" };
    default:
      return { label, variant: "outline" };
  }
}

function getProgress(invoice: Invoice): { progress: number; value: number } {
  if (invoice.payment.length === 0) return { progress: 0, value: 0 };
  const values = invoice.payment.map((p) => {
    if (p.status !== "paid") return 0;
    return p.price;
  });
  const value = values.reduce((acc, i) => acc + i, 0);
  return {
    value,
    progress: (value * 100) / invoice.amount,
  };
}

export function InvoicesTable({
  invoices,
  purchases,
  payments,
  users,
  providers,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Invoice | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPayments, setShowPayments] = React.useState<boolean>(false);
  const [cancel, setCancel] = React.useState<boolean>(false);
  const [statusSearch, setStatusSearch] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | Invoice["status"]
  >("all");
  const [providerFilter, setProviderFilter] = React.useState<"all" | string>(
    "",
  );
  const [purchaseFilter, setPurchaseFilter] = React.useState<"all" | string>(
    "",
  );
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal" | "aucun"
  >("aucun");
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setGlobalFilter("");
    setStatusFilter("all");
    setProviderFilter("all");
    setPurchaseFilter("");
    setAmountFilter(0);
    setAmountTypeFilter("aucun");
  };

  const providersData = ["Tous", ...providers.map((p) => p.name)];

  const data: Array<Invoice> = React.useMemo(() => {
    return invoices.filter((invoice) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      //Status Filter
      let matchStatus =
        statusFilter === "all" ? true : invoice.status === statusFilter;

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
              endDate.setHours(23);
            }
            break;
        }

        if (
          dateFilter !== "custom" ||
          (customDateRange?.from && customDateRange?.to)
        ) {
          matchDate =
            new Date(invoice.createdAt) >= startDate &&
            new Date(invoice.createdAt) <= endDate;
        }
      }
      //Amount Filter
      const matchAmount =
        amountTypeFilter === "aucun"
          ? true
          : amountTypeFilter === "greater"
            ? invoice.amount > amountFilter
            : amountTypeFilter === "equal"
              ? invoice.amount === amountFilter
              : invoice.amount < amountFilter;
      //Provider Filter
      const matchProvider =
        providerFilter === ""
          ? true
          : Number(providerFilter) === invoice.command.providerId;

      //Purchase Filter
      const matchPurchaseOrder =
        purchaseFilter === ""
          ? true
          : Number(purchaseFilter) === invoice.commandId;

      return (
        matchDate &&
        matchStatus &&
        matchAmount &&
        matchProvider &&
        matchPurchaseOrder
      );
    });
  }, [
    statusFilter,
    customDateRange,
    dateFilter,
    amountFilter,
    amountTypeFilter,
    providerFilter,
    purchaseFilter,
  ]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "reference",
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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titre"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      id: "provider",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const purchase = purchases.find((p) => p.id === value.commandId);
        return <div>{purchase?.provider?.name ?? "Inconnu"}</div>;
      },
    },
    {
      id: "purchaseOrder",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bon de commande"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const purchase = purchases.find((p) => p.id === value.commandId);
        return <div>{purchase?.devi.commandRequest.title ?? "--"}</div>;
      },
    },
    {
      accessorKey: "price",
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
        return <div className="font-medium">{XAF.format(Number(value))}</div>;
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
        const status = getInvoiceStatusBadge(value.status);
        const i = getProgress(value);
        //return <Badge variant={status.variant}>{status.label}</Badge>;
        return (
          <Progress value={i.progress} className={"w-full"}>
            <ProgressLabel>{XAF.format(i.value)}</ProgressLabel>
            <ProgressValue />
          </Progress>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "proof",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Documents"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const proofField = row.original.proof;
        const elements =
          typeof proofField === "string" && proofField.length > 0
            ? proofField.split(";").filter(Boolean)
            : Array.isArray(proofField)
              ? proofField.map(String).filter(Boolean)
              : [];
        return (
          <div className="font-medium flex flex-wrap gap-1.5">
            {elements.map((proof, index) => (
              <Link
                key={index}
                href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
                target="_blank"
                className="flex gap-0.5 items-center px-2 py-1 rounded border"
              >
                <img
                  src="/images/pdf.png"
                  alt="preuve"
                  className="h-4 w-auto aspect-square"
                />
                <p className="text-foreground font-medium">{`Facture`}</p>
              </Link>
            ))}
          </div>
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
            {"Date de création"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {format(row.getValue("createdAt"), "dd/MM/yyyy")}
          </div>
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
                  setShowDetail(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowPayments(true);
                }}
              >
                <WalletCardsIcon />
                {"Voir les paiements"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setSelected(item);
                  setCancel(true);
                }}
                disabled={
                  item.payment.filter((p) => p.status === "paid").length > 0
                }
              >
                <BanIcon />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data, // CORRECTION: 'data' au lieu de 'payments'
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
      const searchableColumns = ["reference", "provider", "title"];
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
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full"
                />
              </div>
              {/**Status Filter */}
              <div className="grid gap-1.5">
                <Label>{"Statut"}</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | Invoice["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {INVOICE_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/**Provider Filter */}
              <div className="grid gap-1.5">
                <Label>{"Fournisseur"}</Label>
                {/* <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Combobox
                  items={providersData}
                  value={providerFilter}
                  onValueChange={(v) => setProviderFilter(v ?? "Tous")}
                >
                  <ComboboxInput placeholder="Sélectionner" />
                  <ComboboxContent>
                    <ComboboxEmpty>
                      {"Aucun bon de commande correspondant"}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              {/**Purchase Order Filter */}
              <div className="grid gap-1.5">
                <Label>{"Bon de commande"}</Label>
                {/* <Select
                  value={purchaseFilter}
                  onValueChange={setPurchaseFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un Bon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {purchases.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.devi.commandRequest.title ?? p.reference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Combobox
                  items={purchases}
                  value={
                    purchases.find((p) => p.id === Number(purchaseFilter)) ??
                    null
                  }
                  onValueChange={(v) =>
                    setPurchaseFilter(v?.id.toString() ?? "")
                  }
                  itemToStringLabel={(v) => v.devi.commandRequest.title}
                >
                  <ComboboxInput placeholder="Sélectionner" />
                  <ComboboxContent>
                    <ComboboxEmpty>
                      {"Aucun bon de commande correspondant"}
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item: BonsCommande) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.devi.commandRequest.title}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              {/* Filter by amount */}
              <div className="grid gap-1.5">
                <Label>{"Comparer le montant"}</Label>
                <Select
                  value={amountTypeFilter}
                  onValueChange={(v) =>
                    setAmountTypeFilter(
                      v as "greater" | "inferior" | "equal" | "aucun",
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aucun">{"Aucun"}</SelectItem>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-transparent">
              {"Colonnes"}
              <ChevronDown className="ml-2 h-4 w-4" />
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
                    {column.id === "status"
                      ? "Statut"
                      : column.id === "price"
                        ? "Montant"
                        : column.id === "proof"
                          ? "Documents"
                          : column.id === "provider"
                            ? "Fournisseur"
                            : column.id === "reference"
                              ? "Référence"
                              : column.id === "createdAt"
                                ? "Date de création"
                                : column.id === "updatedAt"
                                  ? "Date de modification"
                                  : column.id === "title"
                                    ? "Titre"
                                    : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                  {"Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} />
      {selected && (
        <ViewInvoice
          invoice={selected}
          open={showDetail}
          openChange={setShowDetail}
          purchases={purchases}
          users={users}
        />
      )}
      {selected && (
        <ViewInvoicePayment
          invoice={selected}
          open={showPayments}
          openChange={setShowPayments}
          purchases={purchases}
          payments={payments}
        />
      )}
      {selected && (
        <CancelInvoice
          invoice={selected}
          open={cancel}
          openChange={setCancel}
          purchases={purchases}
        />
      )}
    </div>
  );
}
