"use client";

import { StatisticCard, StatisticProps } from "@/components/base/TitleValueCard";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { DevisTable } from "@/components/tables/DevisTable";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getQuotationAmount } from "@/lib/utils";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { providerQ } from "@/queries/providers";
import { quotationQ } from "@/queries/quotation";
import { DateFilter, NavLink, QUOTATION_STATUS, QuotationStatus } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Settings2 } from "lucide-react";
import React from "react";

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
  
    // modal specific states
    const [dateFilter, setDateFilter] = React.useState<DateFilter>();
    const [customDateRange, setCustomDateRange] = React.useState<
      { from: Date; to: Date } | undefined
    >();
    const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
    // Reset Filters
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
    setProviderFilter("all");
    setQuotationFilter("all");
    setStatusFilter("all");
    setAmountFilter(0);
    setAmountTypeFilter("greater");
    setSearchFilter("");
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

  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  /**Commands fetch */
  const commands = useQuery({
    queryKey: ["commands"],
    queryFn: commandRqstQ.getAll,
  });

  const filteredData = React.useMemo(() => {
      if (!data) return [];
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      const search = searchFilter.toLocaleLowerCase();
      return data.data.filter((item) => {
        const itemAmount = getQuotationAmount(item.element);
        //Search Filter
        const matchSearch =
        searchFilter.trim() === "" ? true :
        item.commandRequest.title.toLocaleLowerCase().includes(search) ||
        item.commandRequest.reference.includes(search) ||
        item.ref.includes(search) ||
        item.element.some(e => e.title.toLocaleLowerCase().includes(search))
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
          amountTypeFilter === "greater"
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
        return matchDate && matchQuotation && matchProvider && matchStatus && matchAmount && matchSearch;
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
      searchFilter
    ]);

    const validated = filteredData.filter(d=> d.status === "APPROVED").length;
    const pending = filteredData.filter(d=>d.status === "PENDING").length;
    const rejected = filteredData.filter(d=>d.status === "REJECTED").length;

    const statistics: Array<StatisticProps> = [
      {
        title: "Devis validés",
        value: validated,
        variant: "success",
        more: {
          title: "Devis rejetés",
          value: rejected,
        }
      },
      {
        title: "En attente de validation",
        value: pending,
        variant: "default",
        more: {
          title: "Total de devis",
          value: filteredData.length
        }
      }
    ]

  if (isLoading || providers.isLoading || commands.isLoading) {
    return <LoadingPage />;
  }
  if (isError || providers.isError || commands.isError) {
    return (
      <ErrorPage
        error={error ?? providers.error ?? commands.error ?? undefined}
      />
    );
  }
  if (isSuccess && providers.isSuccess && commands.isSuccess)
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
                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Tous les fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {"Tous les fournisseurs"}
                    </SelectItem>
                    {providers.data.data.map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id.toString()}
                      >
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filtre par statut */}
              <div className="grid gap-1.5">
                <Label>{"Statut"}</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as typeof statusFilter)
                  }
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous les statuts"}</SelectItem>
                    {QUOTATION_STATUS.filter(r=> data.data.some(d => d.status === r.value)).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par demande de cotation */}
              <div className="grid gap-1.5">
                <Label>{"Demande de cotation"}</Label>
                <Select
                  value={quotationFilter}
                  onValueChange={(v) =>
                    setQuotationFilter(v as typeof quotationFilter)
                  }
                >
                  <SelectTrigger className="min-w-40 w-full">
                    <SelectValue placeholder="Toutes les demandes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes les demandes"}</SelectItem>
                    {commands.data.data.map((command) => (
                      <SelectItem
                        key={command.id}
                        value={command.id.toString()}
                      >
                        {`${command.title} - ${command.reference}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <div className="grid-stats-4">
          {statistics.map((stat, index)=>(
            <StatisticCard key={index} {...stat}/>
          ))}
        </div>
        <DevisTable
          data={filteredData}
          commands={commands.data.data}
          providers={providers.data.data}
        />
      </div>
    );
};

export default Page;
