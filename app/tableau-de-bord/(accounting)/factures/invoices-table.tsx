"use client";

import { SearchableSelect } from "@/components/base/searchableSelect";
import { TabBar } from "@/components/base/TabBar";
import { InfoCallout } from "@/components/ds/info-callout";
import {
  FilterBar,
  FilterButton,
  FilterChip,
  FilterSearch,
  FilterSpacer,
  FilterTag,
} from "@/components/ds/filter-bar";
import { TablePagination } from "@/components/ds/table-pagination";
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
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  BonsCommande,
  DateFilter,
  INVOICE_STATUS,
  Invoice,
  Provider,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import {
  BanIcon,
  ChevronDown,
  EllipsisVertical,
  Eye,
  PlusIcon,
  WalletCardsIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import CancelInvoice from "./cancel-invoice";
import EditInvoice from "./EditInvoice";
import {
  InvoiceQuickFilter,
  QUICK_FILTER_LABELS,
  isDueThisMonth,
  isDueWithin,
  isOverdue,
  matchesQuickFilter,
  paidAmount,
  paymentSummary,
  restAmount,
} from "./invoice-utils";
import ViewInvoice from "./view-invoice";
import ViewInvoicePayment from "./view-invoice-payment";

interface Props {
  invoices: Array<Invoice>;
  providers: Array<Provider>;
  users: Array<User>;
  purchases: Array<BonsCommande>;
  /** Filtre issu d'un indicateur de la page. */
  quickFilter?: InvoiceQuickFilter | null;
  onQuickFilterChange?: (filter: InvoiceQuickFilter | null) => void;
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

type StatusTab = "all" | Invoice["status"];
type DueFilter = "all" | "overdue" | "week" | "month";

const DUE_OPTIONS: Array<{ value: DueFilter; label: string }> = [
  { value: "all", label: "Toutes" },
  { value: "overdue", label: "En retard" },
  { value: "week", label: "Sous 7 jours" },
  { value: "month", label: "Ce mois-ci" },
];

const PERIOD_LABELS: Record<NonNullable<DateFilter>, string> = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  year: "Cette année",
  custom: "Personnalisé",
};

/** Barre de progression du paiement : grise à 0 %, orange en cours, verte à 100 %. */
function PaymentState({ invoice }: { invoice: Invoice }) {
  const paid = paidAmount(invoice);
  const pct =
    invoice.amount > 0 ? Math.min(100, Math.round((paid * 100) / invoice.amount)) : 0;
  return (
    <div className="flex w-[150px] flex-col gap-1.5">
      <div className="flex gap-1.5 text-caption text-text-tertiary">
        <span className="flex-1">{`${formatNumber(paid)} XAF`}</span>
        <span className="shrink-0 font-bold">{`${pct}%`}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="État de paiement"
        className="flex h-1.5 overflow-hidden rounded-[3px] bg-surface-muted"
      >
        <div
          className={cn(
            "h-full",
            pct === 0
              ? "w-1.5 bg-border-strong opacity-60"
              : pct >= 100
                ? "bg-accent-green"
                : "bg-accent-orange",
          )}
          style={pct === 0 ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const LEGEND = [
  { color: "bg-border-strong", label: "Aucun paiement payé" },
  { color: "bg-accent-orange", label: "Payée partiellement" },
  { color: "bg-accent-green", label: "Payée" },
];

export function InvoicesTable({
  invoices,
  users,
  providers,
  purchases,
  quickFilter = null,
  onQuickFilterChange,
}: Props) {
  const [selected, setSelected] = React.useState<Invoice | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPayments, setShowPayments] = React.useState<boolean>(false);
  const [cancel, setCancel] = React.useState<boolean>(false);
  const [edit, setEdit] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState<StatusTab>("all");
  const [providerFilter, setProviderFilter] = React.useState<"all" | string>(
    "all",
  );
  const [dueFilter, setDueFilter] = React.useState<DueFilter>("all");
  const [purchaseFilter, setPurchaseFilter] = React.useState<"all" | string>(
    "all",
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
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const advancedCount =
    (purchaseFilter !== "all" ? 1 : 0) +
    (amountTypeFilter !== "aucun" ? 1 : 0) +
    (dateFilter ? 1 : 0);

  // Réinitialiser les filtres avancés
  const resetAdvanced = () => {
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setPurchaseFilter("all");
    setAmountFilter(0);
    setAmountTypeFilter("aucun");
    setCustomOpen(false);
  };

  // Un indicateur de la page porte sur toutes les factures : l'onglet est levé.
  React.useEffect(() => {
    if (quickFilter) setTab("all");
  }, [quickFilter]);

  // Tout filtre ramène à la première page.
  React.useEffect(() => {
    setPage(1);
  }, [
    search,
    tab,
    providerFilter,
    dueFilter,
    purchaseFilter,
    amountTypeFilter,
    amountFilter,
    dateFilter,
    customDateRange,
    quickFilter,
  ]);

  const data: Array<Invoice> = React.useMemo(() => {
    const text = search.trim().toLowerCase();
    return invoices
      .filter((invoice) => {
        const now = new Date();
        let startDate = new Date();
        let endDate = now;

        const matchTab = tab === "all" ? true : invoice.status === tab;

        const matchSearch =
          text === ""
            ? true
            : [
                invoice.reference,
                invoice.title,
                invoice.command?.provider?.name,
                invoice.command?.reference,
                invoice.command?.devi?.commandRequest?.title,
              ].some((v) => v?.toLowerCase().includes(text));

        const matchQuick = quickFilter
          ? matchesQuickFilter(invoice, quickFilter)
          : true;

        const matchDue =
          dueFilter === "all"
            ? true
            : dueFilter === "overdue"
              ? isOverdue(invoice)
              : dueFilter === "week"
                ? isDueWithin(invoice, 7)
                : isDueThisMonth(invoice);

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
          providerFilter === "all"
            ? true
            : Number(providerFilter) === invoice.command.providerId;

        //Purchase Filter
        const matchPurchaseOrder =
          purchaseFilter === "all"
            ? true
            : Number(purchaseFilter) === invoice.commandId;

        return (
          matchTab &&
          matchSearch &&
          matchQuick &&
          matchDue &&
          matchDate &&
          matchAmount &&
          matchProvider &&
          matchPurchaseOrder
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [
    invoices,
    search,
    tab,
    quickFilter,
    dueFilter,
    customDateRange,
    dateFilter,
    amountFilter,
    amountTypeFilter,
    providerFilter,
    purchaseFilter,
  ]);

  const count = (status?: Invoice["status"]) =>
    status ? invoices.filter((i) => i.status === status).length : invoices.length;
  const tabs = [
    { id: "all", title: "Toutes les factures", badge: count() },
    { id: "UNPAID", title: "À payer", badge: count("UNPAID") },
    { id: "PAID", title: "Payées", badge: count("PAID") },
    { id: "CANCELLED", title: "Annulées", badge: count("CANCELLED") },
  ];

  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const rows = data.slice(
    (Math.min(page, pageCount) - 1) * pageSize,
    Math.min(page, pageCount) * pageSize,
  );

  return (
    <div className="flex flex-col gap-5">
      <TabBar tabs={tabs} selectedTab={tab} setSelectedTab={setTab} />

      <FilterBar>
        <FilterSearch
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une facture, un fournisseur, un bon…"
        />
        <FilterChip
          label="Fournisseur"
          value={providerFilter}
          onChange={setProviderFilter}
          options={[
            { value: "all", label: "Tous" },
            ...providers
              .map((p) => ({ value: String(p.id), label: p.name }))
              .sort((a, b) => a.label.localeCompare(b.label, "fr")),
          ]}
        />
        <FilterChip
          label="Échéance"
          value={dueFilter}
          onChange={(v) => setDueFilter(v as DueFilter)}
          options={DUE_OPTIONS}
        />
        {quickFilter && (
          <FilterTag onRemove={() => onQuickFilterChange?.(null)}>
            {`Indicateur : ${QUICK_FILTER_LABELS[quickFilter]}`}
          </FilterTag>
        )}
        <FilterSpacer />
        <Sheet>
          <SheetTrigger asChild>
            <FilterButton count={advancedCount} />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres avancés"}</SheetTitle>
              <SheetDescription>
                {"Configurer les fitres pour affiner les données"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5 mt-4">
              {/**Purchase Order Filter */}
              <div className="grid gap-1.5">
                <Label>{"Bon de commande"}</Label>
                <SearchableSelect
                  onChange={(v) => setPurchaseFilter(v)}
                  options={purchases?.map((x) => ({
                    label: x.devi?.commandRequest?.title ?? "--",
                    value: x.id.toString(),
                  }))}
                  value={purchaseFilter}
                  width="w-full"
                  allLabel="Tous les bons de commande"
                />
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
                <Label>{"Période de création"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {dateFilter === undefined
                          ? "Toutes les périodes"
                          : PERIOD_LABELS[dateFilter]}
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
                      <span>{"Toutes les périodes"}</span>
                    </DropdownMenuItem>
                    {(Object.keys(PERIOD_LABELS) as Array<NonNullable<DateFilter>>).map(
                      (key) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => {
                            setDateFilter(key);
                            setCustomOpen(key === "custom");
                          }}
                          className={dateFilter === key ? "bg-accent" : ""}
                        >
                          <span>{PERIOD_LABELS[key]}</span>
                        </DropdownMenuItem>
                      ),
                    )}
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
                  onClick={resetAdvanced}
                  className="w-full"
                >
                  {"Réinitialiser"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </FilterBar>

      <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5">{"Facture"}</TableHead>
              <TableHead className="text-right">{"Montant"}</TableHead>
              <TableHead className="pl-8">{"État de paiement"}</TableHead>
              <TableHead className="text-right">{"Reste à payer"}</TableHead>
              <TableHead className="px-5 text-right">{"Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((item) => {
                const rest = restAmount(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-3 whitespace-normal normal-case">
                      <div className="flex flex-col gap-2">
                        <p className="flex flex-wrap gap-x-2 text-caption text-text-tertiary">
                          <span className="text-brand">{item.reference}</span>
                          {item.command?.reference && (
                            <span>{`· ${item.command.reference}`}</span>
                          )}
                          {item.deadline && (
                            <span>{`· échéance ${format(new Date(item.deadline), "dd/MM/yyyy")}`}</span>
                          )}
                        </p>
                        <p className="text-body-medium text-text-primary">
                          {item.command?.provider?.name ?? "Inconnu"}
                        </p>
                        <p className="text-caption text-text-tertiary">
                          {item.status === "CANCELLED"
                            ? "Facture annulée"
                            : paymentSummary(item)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-body-strong whitespace-nowrap text-text-primary normal-case">
                      {formatNumber(item.amount)}
                    </TableCell>
                    <TableCell className="pl-8 normal-case">
                      <PaymentState invoice={item} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right whitespace-nowrap normal-case",
                        rest > 0
                          ? "text-body-strong text-text-primary"
                          : "text-body text-text-tertiary",
                      )}
                    >
                      {formatNumber(rest)}
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions pour ${item.reference}`}
                          className="size-7 h-7 w-7 gap-0 border-0 bg-transparent p-0 text-text-tertiary hover:bg-hover hover:text-text-primary [&_svg]:size-[18px] [&_svg]:text-current data-[state=open]:bg-hover cursor-pointer justify-center size-8 h-8 w-8 text-text-secondary"
                        >
                          <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                          {item.status !== "CANCELLED" && rest > 0 && (
                            <DropdownMenuItem asChild>
                              <Link href="/tableau-de-bord/factures/paiements/creer">
                                <PlusIcon />
                                {"Créer un paiement"}
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {item.payment &&
                            item.payment.filter((x) => x.status !== "rejected")
                              .length === 0 && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelected(item);
                                  setEdit(true);
                                }}
                              >
                                <WalletCardsIcon />
                                {"Modifier la facture"}
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setSelected(item);
                              setCancel(true);
                            }}
                            disabled={
                              item.payment.filter((p) => p.status === "paid")
                                .length > 0
                            }
                          >
                            <BanIcon />
                            {"Annuler"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {"Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          className="border-t border-border-default"
          total={data.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          noun="factures"
          nounSingular="facture"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-1 text-caption text-text-secondary">
        <span>{"État de paiement :"}</span>
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn("h-1.5 w-4 rounded-[3px]", item.color)}
            />
            {item.label}
          </span>
        ))}
      </div>

      <InfoCallout>
        {
          "Règles : « Modifier » et « Annuler » sont actifs tant que la facture n’a aucun paiement approuvé. « Créer un paiement » reste possible tant que le total des paiements est inférieur au montant de la facture."
        }
      </InfoCallout>

      {selected && (
        <>
          <ViewInvoice
            invoice={selected}
            open={showDetail}
            openChange={setShowDetail}
            purchases={purchases}
            users={users}
          />
          <ViewInvoicePayment
            invoice={selected}
            open={showPayments}
            openChange={setShowPayments}
          />
          <CancelInvoice
            invoice={selected}
            open={cancel}
            openChange={setCancel}
          />
          <EditInvoice invoice={selected} open={edit} openChange={setEdit} />
        </>
      )}
    </div>
  );
}
