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
import { useFetchQuery } from "@/hooks/useData";
import { getRandomColor, XAF } from "@/lib/utils";
import { commadQ } from "@/queries/command";
import { paymentQ } from "@/queries/payment";
import { payTypeQ } from "@/queries/payType";
import { providerQ } from "@/queries/providers";
import { DateFilter, PAY_STATUS, PaymentRequest, PayType } from "@/types/types";
import { format } from "date-fns";
import { Settings2 } from "lucide-react";
import React from "react";

function Page() {
  const getProviders = useFetchQuery(["providers"], providerQ.getAll, 50000);
  const getPurchases = useFetchQuery(["purchaseOrders"], commadQ.getAll);
  const getPaymentType = useFetchQuery(["paymentType"], payTypeQ.getAll, 30000);

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
  const [customOpen, setCustomOpen] = React.useState<boolean>(false);
  const resetAllFilters = () => {
    setDateFilter(undefined);
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
      setStatusFilter("all");
      setTypeFilter("all");
      setMethodFilter("all");
      setProviderFilter("all");
    }
  };
  const { data, isLoading, isError, error, isSuccess } = useFetchQuery(
    ["payments"],
    paymentQ.getAll,
    15000
  );

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
          : !!payment.commandId
          ? getPurchases.data?.data.find((p) => p.id === payment.commandId)
              ?.providerId === Number(providerFilter)
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
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
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
    getPurchases.data,
    data,
  ]);

  // Calcul des métriques principales
  const metrics = React.useMemo(() => {
    const totalAmount = filteredData.reduce(
      (sum, payment) => sum + payment.price,
      0
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
            (p) => p.status === "validated" || p.status === "paid"
          ).length /
            filteredData.length) *
          100
        : 0;

    const pendingCount = filteredData.filter(
      (p) => p.status === "pending" || p.status === "pending_depense"
    ).length;
    const validatedCount = filteredData.filter(
      (p) => p.status === "validated"
    ).length;
    const paidCount = filteredData.filter((p) => p.status === "paid").length;
    const rejectedCount = filteredData.filter(
      (p) => p.status === "rejected"
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
        value: XAF.format(metrics.validatedAmount - metrics.paidAmount),
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
        PAYMENT_TYPES.map((t) => [t.value, t.name])
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
          ])
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
        ]) || []
      );

      filteredData.forEach((payment) => {
        let providerId: number | string = "creaconsult";
        let providerName = "Creaconsult";

        // Trouver le fournisseur via le bon de commande
        if (payment.commandId) {
          const purchaseOrder = getPurchases.data?.data?.find(
            (p) => p.id === payment.commandId
          );
          if (purchaseOrder?.provider) {
            providerId = purchaseOrder.provider.id;
            providerName = purchaseOrder.provider.name;
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
        }
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
          ])
        ),
      };

      return { data: sortedData, config };
    }, [getProviders.data, filteredData, getPurchases.data]);

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
        ])
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
        })
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
          ])
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
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
    getPurchases.isLoading ||
    getPaymentType.isLoading
  ) {
    return <LoadingPage />;
  }
  if (
    isError ||
    getProviders.isError ||
    getPurchases.isError ||
    getPaymentType.isError
  ) {
    return (
      <ErrorPage
        error={
          error ||
          getProviders.error ||
          getPurchases.error ||
          getPaymentType.error ||
          undefined
        }
      />
    );
  }
  if (
    isSuccess &&
    getProviders.isSuccess &&
    getPurchases.isSuccess &&
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
              {/**Filtre par type */}
              <div className="grid gap-1.5">
                <Label htmlFor="typeFilter">{"Type"}</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(v) =>
                    setTypeFilter(v as "all" | PaymentRequest["type"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>{"Tous"}</SelectItem>
                    {PAYMENT_TYPES.map((t, id) => (
                      <SelectItem key={id} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/**Filtre par fournisseur */}
              <div className="grid gap-1.5">
                <Label htmlFor="providerFilter">{"Fournisseur"}</Label>
                <Select
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>{"Tous"}</SelectItem>
                    {getProviders.data.data.map((p, id) => (
                      <SelectItem key={id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/**Filtre par méthode de paiement */}
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Méthode de paiement"}</Label>
                <Select
                  value={methodFilter}
                  onValueChange={(v) => setMethodFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>{"Toutes"}</SelectItem>
                    {getPaymentType.data.data.map(
                      (method: PayType, id: number) => (
                        <SelectItem key={id} value={String(method.id)}>
                          {method.label || `Méthode ${method.id}`}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/**Filtre par statut */}
              <div className="grid gap-1.5">
                <Label htmlFor="statusFilter">{"Statut"}</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as "all" | PaymentRequest["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"all"}>{"Tous"}</SelectItem>
                    {PAY_STATUS.filter(
                      (t) =>
                        t.value === "paid" ||
                        t.value === "pending" ||
                        t.value === "pending_depense"
                    ).map((t, id) => (
                      <SelectItem key={id} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                              "dd/MM/yyyy"
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
