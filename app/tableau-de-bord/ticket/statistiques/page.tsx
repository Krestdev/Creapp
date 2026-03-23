"use client";
import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import {
  AreaChartDataItem,
  AreaChartSeries,
  ChartArea,
} from "@/components/Charts/area-chart";
import {
  ChartDataItem,
  ChartPieDonut,
} from "@/components/Charts/chart-pie-donut";
import EmptyChart from "@/components/empty-chart";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChartConfig } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { getRandomColor, XAF } from "@/lib/utils";
import { invoiceQ } from "@/queries/invoices";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { providerQ } from "@/queries/providers";
import { DateFilter, PaymentRequest, PayType } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronDown, Settings2 } from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";

function Page() {
  const getProviders = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });
  const getInvoices = useQuery({
    queryKey: ["invoices"],
    queryFn: invoiceQ.getAll,
  });
  const getPaymentType = useQuery({
    queryKey: ["paymentType"],
    queryFn: payTypeQ.getAll,
  });

  const [statusFilter, setStatusFilter] = React.useState<
    "all" | PaymentRequest["status"]
  >("all");
  const [typeFilter, setTypeFilter] = React.useState<
    "all" | PaymentRequest["type"]
  >("all");
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [providerFilter, setProviderFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [typeSearch, setTypeSearch] = React.useState("");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [methodSearch, setMethodSearch] = React.useState("");
  const [statusSearch, setStatusSearch] = React.useState("");
  const [customOpen, setCustomOpen] = React.useState<boolean>(false);
  const resetAllFilters = () => {
    setTypeFilter("all");
    setProviderFilter("all");
    setMethodFilter("all");
    setStatusFilter("all");
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setCustomOpen(false);
    // Réinitialiser les recherches
    setTypeSearch("");
    setProviderSearch("");
    setMethodSearch("");
    setStatusSearch("");
  };
  const { data, isLoading, isError, error, isSuccess } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentQ.getAll,
  });

  const filteredData: Array<PaymentRequest> = React.useMemo(() => {
    if (!data) return [];
    return data.data.filter((payment) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      //Filter by provider
      const matchProvider =
        providerFilter === "all"
          ? true
          : !!payment.invoiceId
            ? getInvoices.data?.data.find((p) => p.id === payment.invoiceId)
                ?.command.providerId === Number(providerFilter)
            : false;
      //Filter by type
      const matchType =
        typeFilter === "all" ? true : payment.type === typeFilter;
      //Filter by method
      const matchMethod =
        methodFilter === "all" || payment.methodId?.toString() === methodFilter;

      //Filter Status
      const matchStatus =
        statusFilter === "all" ? true : payment.status === statusFilter;
      // Filter by date
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
            new Date(payment.createdAt) >= startDate &&
            new Date(payment.createdAt) <= endDate;
        }
      }
      return (
        matchDate && matchMethod && matchStatus && matchType && matchProvider
      );
    });
  }, [
    dateFilter,
    customDateRange,
    statusFilter,
    typeFilter,
    methodFilter,
    providerFilter,
    getInvoices.data,
    data,
  ]);

  // Calcul des métriques principales
  const metrics = React.useMemo(() => {
    const totalAmount = filteredData.reduce(
      (sum, payment) => sum + payment.price,
      0,
    );
    const pendingAmount = filteredData
      .filter((p) => p.status === "pending" || p.status === "pending_depense")
      .reduce((sum, p) => sum + p.price, 0);
    const validatedAmount = filteredData
      .filter((p) => p.status === "validated")
      .reduce((sum, p) => sum + p.price, 0);
    const paidAmount = filteredData
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.price, 0);
    const rejectedAmount = filteredData
      .filter((p) => p.status === "rejected")
      .reduce((sum, p) => sum + p.price, 0);

    const avgPayment =
      filteredData.length > 0 ? totalAmount / filteredData.length : 0;

    const approvalRate =
      filteredData.length > 0
        ? (filteredData.filter(
            (p) => p.status === "validated" || p.status === "paid",
          ).length /
            filteredData.length) *
          100
        : 0;

    const pendingCount = filteredData.filter(
      (p) => p.status === "pending" || p.status === "pending_depense",
    ).length;
    const validatedCount = filteredData.filter(
      (p) => p.status === "validated",
    ).length;
    const paidCount = filteredData.filter((p) => p.status === "paid").length;
    const rejectedCount = filteredData.filter(
      (p) => p.status === "rejected",
    ).length;

    return {
      totalAmount,
      pendingAmount,
      validatedAmount,
      paidAmount,
      rejectedAmount,
      avgPayment,
      approvalRate: Math.round(approvalRate * 10) / 10,
      totalCount: filteredData.length,
      pendingCount,
      validatedCount,
      paidCount,
      rejectedCount,
    };
  }, [filteredData]);

  const Statistics: Array<StatisticProps> = [
    {
      title: "Montant Total",
      value: XAF.format(metrics.totalAmount),
      variant: "primary",
      more: {
        title: "Moyenne par paiement",
        value: XAF.format(metrics.avgPayment),
      },
    },
    {
      title: "En Attente",
      value: XAF.format(metrics.pendingAmount),
      variant: "secondary",
      more: {
        title: `${metrics.pendingCount} paiements`,
        value: `${
          Math.round((metrics.pendingAmount / metrics.totalAmount) * 100) || 0
        }% du total`,
      },
    },
    {
      title: "Approuvés",
      value: XAF.format(metrics.validatedAmount),
      variant: "dark",
      more: {
        title: "Taux d'approbation",
        value: `${metrics.approvalRate}%`,
      },
    },
    {
      title: "Payés",
      value: XAF.format(metrics.paidAmount),
      variant: "success",
      more: {
        title: "En attente de paiement",
        value: XAF.format(metrics.validatedAmount),
      },
    },
  ];

  // Créer une constante pour les types de paiement
  const PAYMENT_TYPES = [
    { value: "facilitation", name: "Facilitation" },
    { value: "ressource_humaine", name: "Ressource Humaine" },
    { value: "speciaux", name: "Spéciaux" },
    { value: "achat", name: "Achat" },
    { value: "CURRENT", name: "CURRENT" },
  ] as const;

  // Données pour le graphique par type de paiement
  const paymentTypeData: { data: ChartDataItem[]; config: ChartConfig } =
    React.useMemo(() => {
      let data;
      let config;
      const typeStats: Record<string, { amount: number; count: number }> = {};
      const typeLabels = Object.fromEntries(
        PAYMENT_TYPES.map((t) => [t.value, t.name]),
      );
      const typeColors: Record<string, string> = {
        facilitation: "var(--secondary-600)",
        ressource_humaine: "var(--chart-2)",
        speciaux: "var(--chart-6)",
        achat: "var(--primary-600)",
        CURRENT: "var(--chart-5)",
      };

      filteredData.forEach((payment) => {
        const type = payment.type;
        if (!typeStats[type]) {
          typeStats[type] = { amount: 0, count: 0 };
        }
        typeStats[type].amount += payment.price;
        typeStats[type].count += 1;
      });

      data = Object.entries(typeStats).map(([type, data], index) => ({
        id: type,
        value: data.amount,
        label: typeLabels[type] || type,
        color: typeColors[type] || getRandomColor(index),
        name: typeLabels[type] || type,
        count: data.count,
      }));
      config = {
        value: { label: "Montant" },
        ...Object.fromEntries(
          Object.entries(typeLabels).map(([key, label]) => [
            key,
            { label, color: typeColors[key] },
          ]),
        ),
      };
      return { data, config };
    }, [filteredData]);

  // Données par fournisseur
  const paymentByProvider: { data: ChartDataItem[]; config: ChartConfig } =
    React.useMemo(() => {
      const providerStats: Record<
        number | string,
        { amount: number; count: number; name: string }
      > = {};

      // Préparer les labels des fournisseurs
      const providerLabels = new Map(
        getProviders.data?.data?.map((provider) => [
          provider.id,
          provider.name,
        ]) || [],
      );

      filteredData.forEach((payment) => {
        let providerId: number | string = "creaconsult";
        let providerName = "Creaconsult";

        // Trouver le fournisseur via la facture
        if (payment.invoiceId) {
          const invoice = getInvoices.data?.data?.find(
            (p) => p.id === payment.invoiceId,
          );
          if (invoice?.command.provider) {
            providerId = invoice.command.provider.id;
            providerName = invoice.command.provider.name;
            // Mettre à jour le cache des noms si nécessaire
            if (!providerLabels.has(providerId)) {
              providerLabels.set(providerId, providerName);
            }
          }
        }

        // Initialiser si nécessaire
        if (!providerStats[providerId]) {
          providerStats[providerId] = {
            amount: 0,
            count: 0,
            name: providerName,
          };
        }

        // Ajouter les données
        providerStats[providerId].amount += payment.price;
        providerStats[providerId].count += 1;
      });

      // Convertir en array pour le graphique
      const data: ChartDataItem[] = Object.entries(providerStats).map(
        ([id, stats], index) => {
          const providerId =
            typeof id === "string" && id === "creaconsult" ? id : Number(id);

          return {
            id: providerId,
            value: stats.amount,
            label: stats.name,
            color: getRandomColor(index),
            name: `provider_${providerId}`,
            count: stats.count,
            fullName: stats.name,
          };
        },
      );

      // Trier par montant décroissant
      const sortedData = data.sort((a, b) => b.value - a.value);

      // Créer la configuration du graphique
      const config: ChartConfig = {
        value: { label: "Montant" },
        ...Object.fromEntries(
          sortedData.map((item, index) => [
            `provider_${item.id}`,
            {
              label: item.fullName || item.label,
              color: item.color,
            },
          ]),
        ),
      };

      return { data: sortedData, config };
    }, [getProviders.data, filteredData, getInvoices.data]);

  // Données pour le graphique par méthode de paiement (basé sur les données API)
  const paymentMethodData: { data: ChartDataItem[]; config: ChartConfig } =
    React.useMemo(() => {
      const methodStats: Record<
        string,
        { amount: number; count: number; label: string }
      > = {};

      // Récupérer les méthodes de paiement depuis l'API
      const paymentMethods = getPaymentType.data?.data || [];

      // Créer un mapping ID -> label
      const methodMap = new Map(
        paymentMethods.map((method) => [
          method.id.toString(),
          method.label || `Méthode ${method.id}`,
        ]),
      );

      // Calculer les statistiques
      filteredData.forEach((payment) => {
        const methodId = payment.methodId?.toString();
        if (!methodId) return;

        if (!methodStats[methodId]) {
          methodStats[methodId] = {
            amount: 0,
            count: 0,
            label: methodMap.get(methodId) || `Méthode ${methodId}`,
          };
        }
        methodStats[methodId].amount += payment.price;
        methodStats[methodId].count += 1;
      });

      // Convertir en array pour le graphique
      const data: ChartDataItem[] = Object.entries(methodStats).map(
        ([methodId, stats], index) => ({
          id: methodId,
          value: stats.amount,
          label: stats.label,
          color: getRandomColor(index),
          name: `method_${methodId}`,
          count: stats.count,
          fullName: stats.label,
        }),
      );

      // Trier par montant décroissant
      const sortedData = data.sort((a, b) => b.value - a.value);

      // Créer la configuration du graphique
      const config: ChartConfig = {
        value: { label: "Montant" },
        ...Object.fromEntries(
          sortedData.map((item, index) => [
            `method_${item.id}`,
            {
              label: item.fullName || item.label,
              color: item.color,
            },
          ]),
        ),
      };

      return { data: sortedData, config };
    }, [filteredData, getPaymentType.data]);

  // Séries temporelles quotidiennes par type de paiement
  const timeSeriesByType: AreaChartDataItem[] = React.useMemo(() => {
    const types = PAYMENT_TYPES.map((t) => t.value);
    const typeColors: Record<string, string> = {
      facilitation: "var(--chart-6)",
      ressource_humaine: "var(--chart-1)",
      speciaux: "var(--chart-4)",
      achat: "var(--primary-600)",
      CURRENT: "var(--secondary-400)",
    };

    const daily: Record<string, Record<string, number>> = {};

    filteredData.forEach((payment) => {
      const d = new Date(payment.createdAt);
      const day = d.toISOString().slice(0, 10);
      if (!daily[day]) daily[day] = {};
      const type = payment.type || "UNKNOWN";
      daily[day][type] = (daily[day][type] || 0) + payment.price;
    });

    const days = Object.keys(daily).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    return days.map((day) => {
      const entry: any = { period: day };
      types.forEach((t) => {
        entry[t] = daily[day][t] || 0;
      });
      return entry;
    });
  }, [filteredData]);

  const typeSeries: AreaChartSeries[] = PAYMENT_TYPES.map((t, i) => ({
    key: t.value,
    label: t.name,
    color: getRandomColor(i),
    type: "natural",
    fillOpacity: 0.18,
  }));

  // Créer une constante pour les statuts de paiement
  const PAY_STATUS = [
    { value: "pending", name: "En attente" },
    { value: "pending_depense", name: "En attente dépense" },
    { value: "accepted", name: "Accepté" },
    { value: "validated", name: "Validé" },
    { value: "signed", name: "Signé" },
    { value: "paid", name: "Payé" },
    { value: "rejected", name: "Rejeté" },
    { value: "ghost", name: "Ghost" },
  ] as const;

  // Séries temporelles quotidiennes par statut de paiement
  const timeSeriesByStatus: AreaChartDataItem[] = React.useMemo(() => {
    const statuses = PAY_STATUS.map((s) => s.value);
    const statusColors: Record<string, string> = {
      pending: "#f59e0b",
      pending_depense: "#f59e0b",
      accepted: "var(--chart-1)",
      validated: "#10b981",
      signed: "#84cc16",
      paid: "#22c55e",
      rejected: "#ef4444",
      ghost: "#64748b",
    };

    const daily: Record<string, Record<string, number>> = {};

    filteredData.forEach((payment) => {
      const d = new Date(payment.createdAt);
      const day = d.toISOString().slice(0, 10);
      if (!daily[day]) daily[day] = {};
      const status = payment.status || "ghost";
      daily[day][status] = (daily[day][status] || 0) + payment.price;
    });

    const days = Object.keys(daily).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    return days.map((day) => {
      const entry: any = { period: day };
      statuses.forEach((s) => {
        entry[s] = daily[day][s] || 0;
      });
      return entry;
    });
  }, [filteredData]);

  const statusSeries: AreaChartSeries[] = PAY_STATUS.map((s, i) => ({
    key: s.value,
    label: s.name,
    color: getRandomColor(i),
    type: "natural",
    fillOpacity: 0.15,
  }));

  if (
    isLoading ||
    getProviders.isLoading ||
    getInvoices.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getProviders.isError ||
    getInvoices.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getProviders.error ||
          getInvoices.error ||
          getPaymentType.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getProviders.isSuccess &&
    getInvoices.isSuccess &&
    getPaymentType.isSuccess
  ) {
    return (
      <div className="content">
        <PageTitle
          title="Statistiques"
          subtitle="Analyses et statistiques liées aux paiements"
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"outline"} className="w-fit">
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
              {/** Filtre par type */}
              <div className="grid gap-1.5">
                <Label htmlFor="typeFilter">{"Type"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {typeFilter === "all"
                          ? "Tous les types"
                          : PAYMENT_TYPES.find((t) => t.value === typeFilter)
                              ?.name || "Sélectionner"}
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
                    {PAYMENT_TYPES.filter((t) =>
                      t.name.toLowerCase().includes(typeSearch.toLowerCase()),
                    ).map((t) => (
                      <DropdownMenuItem
                        key={t.value}
                        onClick={() => {
                          setTypeFilter(t.value);
                          setTypeSearch("");
                        }}
                        className={typeFilter === t.value ? "bg-accent" : ""}
                      >
                        <span>{t.name}</span>
                      </DropdownMenuItem>
                    ))}
                    {PAYMENT_TYPES.filter((t) =>
                      t.name.toLowerCase().includes(typeSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun type trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/** Filtre par fournisseur */}
              <div className="grid gap-1.5">
                <Label htmlFor="providerFilter">{"Fournisseur"}</Label>
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
                              (p) => String(p.id) === providerFilter,
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
                      <span>Tous les fournisseurs</span>
                    </DropdownMenuItem>
                    {getProviders.data.data
                      .filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(providerSearch.toLowerCase()),
                      )
                      .map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          onClick={() => {
                            setProviderFilter(String(p.id));
                            setProviderSearch("");
                          }}
                          className={
                            providerFilter === String(p.id) ? "bg-accent" : ""
                          }
                        >
                          <span>{p.name}</span>
                        </DropdownMenuItem>
                      ))}
                    {getProviders.data.data.filter((p) =>
                      p.name
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

              {/** Filtre par méthode de paiement */}
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Méthode de paiement"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {methodFilter === "all"
                          ? "Toutes les méthodes"
                          : getPaymentType.data.data.find(
                              (m) => String(m.id) === methodFilter,
                            )?.label || `Méthode ${methodFilter}`}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <Input
                        placeholder="Rechercher une méthode..."
                        className="h-8"
                        value={methodSearch}
                        onChange={(e) => setMethodSearch(e.target.value)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setMethodFilter("all");
                        setMethodSearch("");
                      }}
                      className={methodFilter === "all" ? "bg-accent" : ""}
                    >
                      <span>Toutes les méthodes</span>
                    </DropdownMenuItem>
                    {getPaymentType.data.data
                      .filter((method) =>
                        (method.label || `Méthode ${method.id}`)
                          .toLowerCase()
                          .includes(methodSearch.toLowerCase()),
                      )
                      .map((method) => (
                        <DropdownMenuItem
                          key={method.id}
                          onClick={() => {
                            setMethodFilter(String(method.id));
                            setMethodSearch("");
                          }}
                          className={
                            methodFilter === String(method.id)
                              ? "bg-accent"
                              : ""
                          }
                        >
                          <span>{method.label || `Méthode ${method.id}`}</span>
                        </DropdownMenuItem>
                      ))}
                    {getPaymentType.data.data.filter((method) =>
                      (method.label || `Méthode ${method.id}`)
                        .toLowerCase()
                        .includes(methodSearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucune méthode trouvée
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/** Filtre par statut */}
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Statut"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {statusFilter === "all"
                          ? "Tous les statuts"
                          : PAY_STATUS.find((s) => s.value === statusFilter)
                              ?.name || "Sélectionner"}
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
                      <span>Tous les statuts</span>
                    </DropdownMenuItem>
                    {PAY_STATUS.filter(
                      (t) =>
                        t.value === "paid" ||
                        t.value === "pending" ||
                        t.value === "pending_depense",
                    )
                      .filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(statusSearch.toLowerCase()),
                      )
                      .map((t) => (
                        <DropdownMenuItem
                          key={t.value}
                          onClick={() => {
                            setStatusFilter(t.value);
                            setStatusSearch("");
                          }}
                          className={
                            statusFilter === t.value ? "bg-accent" : ""
                          }
                        >
                          <span>{t.name}</span>
                        </DropdownMenuItem>
                      ))}
                    {PAY_STATUS.filter(
                      (t) =>
                        t.value === "paid" ||
                        t.value === "pending" ||
                        t.value === "pending_depense",
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

              {/** Filtre par période */}
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
        <div className="grid-stats-4">
          {Statistics.map((item, id) => (
            <StatisticCard key={id} {...item} />
          ))}
        </div>
        <div className="grid grid-cols-1 @min-[1024px]:grid-cols-2 gap-4">
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Répartition par Type"}</h3>
              <p className="text-gray-600 text-sm">
                {"Montant total par type de paiement"}
              </p>
            </div>
            {paymentTypeData.data.length > 0 ? (
              <ChartPieDonut
                data={paymentTypeData.data}
                showLegend={true}
                innerRadius={50}
                maxHeight={350}
                tooltipConfig={{
                  valueFormatter: (value, name, payload) => {
                    const item = payload?.payload as any;
                    return `${XAF.format(Number(value))} (${
                      item?.count || 0
                    }) `;
                  },
                }}
                chartConfig={paymentTypeData.config}
              />
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Répartition par Fournisseur"}</h3>
              <p className="text-gray-600 text-sm">
                {"Montant total par fournisseur"}
              </p>
            </div>
            {paymentByProvider.data.length > 0 ? (
              <ChartPieDonut
                data={paymentByProvider.data}
                showLegend={true}
                innerRadius={50}
                maxHeight={350}
                tooltipConfig={{
                  valueFormatter: (value, name, payload) => {
                    const item = payload?.payload as any;
                    return `${XAF.format(Number(value))} (${
                      item?.count || 0
                    }) `;
                  },
                }}
                chartConfig={paymentByProvider.config}
              />
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Méthode de paiement"}</h3>
              <p className="text-gray-600 text-sm">
                {"Répartition par méthode"}
              </p>
            </div>
            {paymentMethodData.data.length > 0 ? (
              <ChartPieDonut
                data={paymentMethodData.data}
                showLegend={true}
                innerRadius={30}
                maxHeight={300}
                tooltipConfig={{
                  valueFormatter: (value, name, payload) => {
                    const item = payload?.payload as any;
                    return `${XAF.format(Number(value))} (${
                      item?.count || 0
                    }) `;
                  },
                }}
                chartConfig={paymentMethodData.config}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Évolution par Type (quotidienne) */}
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Évolution par Type (quotidienne)"}</h3>
              <p className="text-gray-600 text-sm">
                {"Montant total par type et par jour"}
              </p>
            </div>
            {timeSeriesByType.length > 0 ? (
              <ChartArea
                data={timeSeriesByType}
                series={typeSeries}
                showYAxis={true}
                xAxisFormatter={(value) => {
                  try {
                    return format(new Date(value), "dd/MM");
                  } catch {
                    return value;
                  }
                }}
                tooltipIndicator="line"
                tooltipConfig={{
                  valueFormatter: (value) => XAF.format(Number(value)),
                  labelFormatter: (label) => {
                    try {
                      return format(new Date(label), "dd MMM yyyy");
                    } catch {
                      return label;
                    }
                  },
                }}
                height={350}
              />
            ) : (
              <EmptyChart />
            )}
          </div>

          {/* Évolution par Statut (quotidienne) */}
          <div className="p-6 rounded-md border w-full h-full flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3>{"Évolution par Statut (quotidienne)"}</h3>
              <p className="text-gray-600 text-sm">
                {"Montant total par statut et par jour"}
              </p>
            </div>
            {timeSeriesByStatus.length > 0 ? (
              <ChartArea
                data={timeSeriesByStatus}
                series={statusSeries}
                showYAxis={true}
                xAxisFormatter={(value) => {
                  try {
                    return format(new Date(value), "dd/MM");
                  } catch {
                    return value;
                  }
                }}
                tooltipIndicator="line"
                tooltipConfig={{
                  valueFormatter: (value) => XAF.format(Number(value)),
                  labelFormatter: (label) => {
                    try {
                      return format(new Date(label), "dd MMM yyyy");
                    } catch {
                      return label;
                    }
                  },
                }}
                height={350}
              />
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Page;
