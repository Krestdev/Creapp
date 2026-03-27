"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { getQuotationAmount } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { requestQ } from "@/queries/requestModule";
import {
  DateFilter,
  NavLink,
  QUOTATION_STATUS,
  QuotationStatus,
} from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Settings2 } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Page = () => {
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [quotationFilter, setQuotationFilter] = React.useState<"all" | string>(
    "all",
  );
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | QuotationStatus
  >("all");
  const [amountFilter, setAmountFilter] = React.useState<number>(0);
  const [amountTypeFilter, setAmountTypeFilter] = React.useState<
    "greater" | "inferior" | "equal"
  >("greater");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [statusSearch, setStatusSearch] = React.useState("");
  const [quotationSearch, setQuotationSearch] = React.useState("");

  // modal specific states
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  // Reset Filters
  const resetAllFilters = () => {
    setSearchFilter("");
    setProviderFilter("all");
    setStatusFilter("all");
    setQuotationFilter("all");
    setAmountTypeFilter("greater");
    setAmountFilter(0);
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setCustomOpen(false);
    // Réinitialiser les recherches
    setProviderSearch("");
    setStatusSearch("");
    setQuotationSearch("");
  };
  const links: Array<NavLink> = [
    {
      title: "Créer un devis",
      href: "./devis/creer",
    },
  ];
  /**Quotation fetch */

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ["quotations"],
    queryFn: quotationQ.getAll,
  });
  /**Providers fetch */

  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  /**Commands fetch */
  const commands = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const getUsers = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
  });

  const getRequests = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestQ.getAll(),
  });

  const providers = React.useMemo(() => {
    if (!getProviders.data) return [];
    return getProviders.data.data;
  }, [getProviders.data]);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    const now = new Date();
    let startDate = new Date();
    let endDate = now;
    const search = searchFilter.toLocaleLowerCase();
    return data.data.filter((item) => {
      const itemAmount = getQuotationAmount(item, providers);
      //Search Filter
      const matchSearch =
        searchFilter.trim() === ""
          ? true
          : item.commandRequest.title.toLocaleLowerCase().includes(search) ||
            item.commandRequest.reference.includes(search) ||
            item.ref.includes(search) ||
            item.element.some((e) =>
              e.title.toLocaleLowerCase().includes(search),
            );
      //Quotation Filter
      const matchQuotation =
        quotationFilter === "all"
          ? true
          : item.commandRequestId === Number(quotationFilter);
      //Provider Filter
      const matchProvider =
        providerFilter === "all"
          ? true
          : item.providerId === Number(providerFilter);
      //Status Filter
      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      // Filter amount
      const matchAmount =
        amountFilter === 0
          ? true
          : amountTypeFilter === "greater"
            ? itemAmount > amountFilter
            : amountTypeFilter === "equal"
              ? itemAmount === amountFilter
              : itemAmount < amountFilter;
      //Date filter
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
            new Date(item.createdAt) >= startDate &&
            new Date(item.createdAt) <= endDate;
        }
      }
      return (
        matchDate &&
        matchQuotation &&
        matchProvider &&
        matchStatus &&
        matchAmount &&
        matchSearch
      );
    });
  }, [
    data,
    customDateRange,
    dateFilter,
    quotationFilter,
    providerFilter,
    statusFilter,
    amountFilter,
    amountTypeFilter,
    searchFilter,
  ]);

  const validated = filteredData.filter((d) => d.status === "APPROVED").length;
  const pending = filteredData.filter((d) => d.status === "PENDING").length;
  const rejected = filteredData.filter((d) => d.status === "REJECTED").length;

  const statistics: Array<StatisticProps> = [
    {
      title: "Devis validés",
      value: validated,
      variant: "success",
      more: {
        title: "Devis rejetés",
        value: rejected,
      },
    },
    {
      title: "En attente de validation",
      value: pending,
      variant: "default",
      more: {
        title: "Total de devis",
        value: filteredData.length,
      },
    },
  ];

  if (
    isLoading ||
    getProviders.isLoading ||
    commands.isLoading ||
    getUsers.isLoading ||
    getRequests.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getProviders.isError ||
    commands.isError ||
    getUsers.isError ||
    getRequests.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getProviders.error ||
          commands.error ||
          getUsers.error ||
          getRequests.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getProviders.isSuccess &&
    commands.isSuccess &&
    getUsers.isSuccess &&
    getRequests.isSuccess
  )
    return (
      <div className="content">
        <PageTitle
          title="Devis"
          subtitle="Consultez et gérez les cotations."
          color="red"
          links={links}
        />
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
            <div className="px-5 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                <Input
                  name="search"
                  type="search"
                  id="searchCommand"
                  placeholder="Référence, titre, fournisseur..."
                  value={searchFilter}
                  onChange={(event) => setSearchFilter(event.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* Filtre par fournisseur */}
              <div className="grid gap-1.5">
                <Label>{"Fournisseur"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {providerFilter === "all"
                          ? "Tous les fournisseurs"
                          : getProviders.data.data.find(
                              (p) => p.id.toString() === providerFilter,
                            )?.name || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un fournisseur..."
                        className="h-8"
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setProviderFilter("all");
                        setProviderSearch("");
                      }}
                      className={providerFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les fournisseurs</span>
                      </div>
                    </DropdownMenuItem>
                    {getProviders.data.data
                      .filter((provider) =>
                        provider.name
                          .toLowerCase()
                          .includes(providerSearch.toLowerCase()),
                      )
                      .map((provider) => (
                        <DropdownMenuItem
                          key={provider.id}
                          onClick={() => {
                            setProviderFilter(provider.id.toString());
                            setProviderSearch("");
                          }}
                          className={
                            providerFilter === provider.id.toString()
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {getProviders.data.data.filter((provider) =>
                      provider.name
                        .toLowerCase()
                        .includes(providerSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun fournisseur trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtre par statut */}
              <div className="grid gap-1.5">
                <Label>{"Statut"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {statusFilter === "all"
                          ? "Tous les statuts"
                          : QUOTATION_STATUS.find(
                              (s) => s.value === statusFilter,
                            )?.name || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher un statut..."
                        className="h-8"
                        value={statusSearch}
                        onChange={(e) => setStatusSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setStatusFilter("all");
                        setStatusSearch("");
                      }}
                      className={statusFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les statuts</span>
                      </div>
                    </DropdownMenuItem>
                    {QUOTATION_STATUS.filter((s) =>
                      data.data.some((d) => d.status === s.value),
                    )
                      .filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase()),
                      )
                      .map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => {
                            setStatusFilter(s.value);
                            setStatusSearch("");
                          }}
                          className={
                            statusFilter === s.value ? "bg-accent" : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span>{s.name}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {QUOTATION_STATUS.filter((s) =>
                      data.data.some((d) => d.status === s.value),
                    ).filter((s) =>
                      s.name.toLowerCase().includes(statusSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun statut trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtre par demande de cotation */}
              <div className="grid gap-1.5">
                <Label>{"Demande de cotation"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {quotationFilter === "all"
                          ? "Toutes les demandes"
                          : commands.data.data.find(
                              (c) => c.id.toString() === quotationFilter,
                            )?.title || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher une demande..."
                        className="h-8"
                        value={quotationSearch}
                        onChange={(e) => setQuotationSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setQuotationFilter("all");
                        setQuotationSearch("");
                      }}
                      className={quotationFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Toutes les demandes</span>
                      </div>
                    </DropdownMenuItem>
                    {commands.data.data
                      .filter((command) =>
                        `${command.title} - ${command.reference}`
                          .toLowerCase()
                          .includes(quotationSearch.toLowerCase()),
                      )
                      .map((command) => (
                        <DropdownMenuItem
                          key={command.id}
                          onClick={() => {
                            setQuotationFilter(command.id.toString());
                            setQuotationSearch("");
                          }}
                          className={
                            quotationFilter === command.id.toString()
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">{`${command.title} - ${command.reference}`}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    {commands.data.data.filter((command) =>
                      `${command.title} - ${command.reference}`
                        .toLowerCase()
                        .includes(quotationSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucune demande trouvée
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filter by amount */}
              <div className="grid gap-1.5">
                <Label>{"Comparer le montant"}</Label>
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
        <div className="grid-stats-4">
          {statistics.map((stat, index) => (
            <StatisticCard key={index} {...stat} />
          ))}
        </div>
        <DevisTable
          data={filteredData}
          commands={commands.data.data}
          providers={getProviders.data.data}
          users={getUsers.data.data}
          requests={getRequests.data.data}
        />
      </div>
    );
};

export default Page;
