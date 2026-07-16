"use client";

import {
  StatisticCard,
  StatisticProps,
} from "@/components/base/TitleValueCard";
import { ChartAreaInteractiveAll } from "@/components/Charts/BarcharAll";
import { ChartAreaInteractive } from "@/components/Charts/BarChart";
import BarChartType from "@/components/Charts/BarChartType";
import { ChartExpenseEvolution } from "@/components/Charts/ChartExpenseEvolution";
import { ChartGlobalState } from "@/components/Charts/ChartGlobalState";
import { ChartPieLabelList } from "@/components/Charts/ChartPieLabelList";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { queryKeys } from "@/lib/query-keys";
import { isRole, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  subDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Settings2 } from "lucide-react";
import React from "react";
import DashboardFilters, { DashboardFiltersProps } from "./dashboardFilters";

const DashboardPage = () => {
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();

  const [customFilters, setCustomFilters] = React.useState<
    DashboardFiltersProps["customFilters"]
  >({
    date: undefined,
    from: "",
    to: "",
  });

  const resetAllFilters = () => {
    setCustomFilters({
      date: undefined,
      from: "",
      to: "",
    });
    setDateFilter(undefined);
  };

  const { user } = useStore();
  // const volt = isRole({ roleList: user?.role ?? [], role: "trésorier" });
  // const accountant = isRole({ roleList: user?.role ?? [], role: "comptable" });
  // const volt_manager = isRole({
  //   roleList: user?.role ?? [],
  //   role: "Donneur d'ordre décaissement",
  // });
  const manager = isRole({ roleList: user?.role ?? [], role: "manager" });
  const super_admin = isRole({
    roleList: user?.role ?? [],
    role: "SUPERADMIN",
  });

  const getRequestsStats = useQuery({
    queryKey: queryKeys.dashboardStats(dateFilter, customFilters),
    queryFn: () =>
      requestQ.getDashboardStats({
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user?.id,
  });

  const getRequestsGraph = useQuery({
    queryKey: queryKeys.dashboardGraph(dateFilter, customFilters),
    queryFn: () =>
      requestQ.getDashboardGraph({
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user?.id,
  });

  const dashboardPaidData = useQuery({
    queryKey: queryKeys.dashboardPaidData(dateFilter, customFilters),
    queryFn: () =>
      paymentQ.getDashboardPaidData({
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user?.id,
  });

  const paidExpenses = useQuery({
    queryKey: queryKeys.depenses("paid", dateFilter, customFilters),
    queryFn: () =>
      paymentQ.getDepenses({
        pageIndex: 0,
        pageSize: 15,
        tab: "paid",
        amount: 0,
        amountType: "greater",
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user?.id,
  });

  const cancelledExpenses = useQuery({
    queryKey: queryKeys.depenses("cancelled", dateFilter, customFilters),
    queryFn: () =>
      paymentQ.getDepenses({
        pageIndex: 0,
        pageSize: 15,
        tab: "cancelled",
        amount: 0,
        amountType: "greater",
        date: customFilters.date || undefined,
        from: customFilters.from || undefined,
        to: customFilters.to || undefined,
      }),
    enabled: !!user?.id,
  });

  const requestType = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });

  const filterByDate = React.useCallback(
    (data: any[] = []) => {
      if (!data || data.length === 0) return [];
      if (!dateFilter) return data;

      const now = new Date();

      switch (dateFilter) {
        case "today": {
          return data.filter((item) => {
            try {
              return isSameDay(new Date(item.createdAt), now);
            } catch {
              return false;
            }
          });
        }

        case "week": {
          const startDate = subDays(now, 6);
          startDate.setHours(0, 0, 0, 0);
          return data.filter((item) => {
            try {
              const itemDate = new Date(item.createdAt);
              return itemDate >= startDate && itemDate <= now;
            } catch {
              return false;
            }
          });
        }

        case "month": {
          const startDate = startOfMonth(now);
          const endDate = endOfMonth(now);
          return data.filter((item) => {
            try {
              const itemDate = new Date(item.createdAt);
              return itemDate >= startDate && itemDate <= endDate;
            } catch {
              return false;
            }
          });
        }

        case "year": {
          const startDate = new Date(now.getFullYear(), 0, 1);
          const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          return data.filter((item) => {
            try {
              const itemDate = new Date(item.createdAt);
              return itemDate >= startDate && itemDate <= endDate;
            } catch {
              return false;
            }
          });
        }

        case "custom": {
          if (!customFilters.from || !customFilters.to) return data;
          const startDate = new Date(customFilters.from);
          const endDate = new Date(customFilters.to);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return data;
          }
          return data.filter((item) => {
            try {
              const itemDate = new Date(item.createdAt);
              return isWithinInterval(itemDate, {
                start: startDate,
                end: endDate,
              });
            } catch {
              return false;
            }
          });
        }

        default:
          return data;
      }
    },
    [dateFilter, customFilters.from, customFilters.to],
  );

  const filteredSubmited = React.useMemo(() => {
    return filterByDate(getRequestsGraph.data?.data?.submited || []);
  }, [getRequestsGraph.data?.data?.submited, filterByDate]);

  const filteredValidator = React.useMemo(() => {
    return filterByDate(getRequestsGraph.data?.data?.validator || []);
  }, [getRequestsGraph.data?.data?.validator, filterByDate]);

  const filteredAll = React.useMemo(() => {
    return filterByDate(getRequestsGraph.data?.data?.all || []);
  }, [getRequestsGraph.data?.data?.all, filterByDate]);

  const filteredPayments = React.useMemo(() => {
    return filterByDate(dashboardPaidData.data?.payments || []);
  }, [dashboardPaidData.data?.payments, filterByDate]);

  const filteredTotalPaid = React.useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [filteredPayments]);

  const requestTypeDistributionData = React.useMemo(() => {
    // Utiliser filteredAll si disponible (ex: pour les admins), sinon filteredSubmited
    const dataSource = filteredAll.length > 0 ? filteredAll : filteredSubmited;
    if (!dataSource || dataSource.length === 0) return [];

    const groups: Record<string, number> = {};
    const types = requestType.data?.data || [];

    dataSource.forEach((req: any) => {
      const typeObj = types.find((t: any) => t.type === req.type);
      const label = typeObj ? typeObj.label : req.type || "Inconnu";
      groups[label] = (groups[label] || 0) + 1;
    });

    return Object.entries(groups)
      .map(([period, value]) => ({
        period,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredAll, filteredSubmited, requestType.data?.data]);

  const getStatusCount = React.useCallback(
    (items: any[], status: "approuvé" | "rejetté" | "enAttente") => {
      return items.filter((item) => {
        const s = (item.state || "").toLowerCase();
        if (status === "approuvé") {
          return ["approved", "store", "approv", "valid"].some((key) =>
            s.includes(key),
          );
        }
        if (status === "rejetté") {
          return ["rejected", "rejet", "refus"].some((key) => s.includes(key));
        }
        return ["pending", "reviews", "wait", "attente"].some((key) =>
          s.includes(key),
        );
      }).length;
    },
    [],
  );

  const getSubtitle = () => {
    if (dateFilter === "custom" && customFilters.from && customFilters.to) {
      const fromStr = format(customFilters.from, "dd/MM/yyyy", {
        locale: fr,
      });
      const toStr = format(customFilters.to, "dd/MM/yyyy", {
        locale: fr,
      });
      return `Consulter mes besoins du ${fromStr} au ${toStr}`;
    }

    switch (dateFilter) {
      case "today":
        return "Consulter mes besoins d'aujourd'hui";
      case "week":
        return "Consulter mes besoins des 7 derniers jours";
      case "month":
        return "Consulter mes besoins du mois en cours";
      case "year":
        return "Consulter mes besoins de l'année en cours";
      default:
        return "Consulter mes besoins (30 derniers jours)";
    }
  };

  const getReceivedSubtitle = () => {
    if (dateFilter === "custom" && customFilters.from && customFilters.to) {
      const fromStr = format(customFilters.from, "dd/MM/yyyy", {
        locale: fr,
      });
      const toStr = format(customFilters.to, "dd/MM/yyyy", {
        locale: fr,
      });
      return `Consulter les besoins reçus du ${fromStr} au ${toStr}`;
    }

    switch (dateFilter) {
      case "today":
        return "Consulter les besoins reçus d'aujourd'hui";
      case "week":
        return "Consulter les besoins reçus des 7 derniers jours";
      case "month":
        return "Consulter les besoins reçus du mois en cours";
      case "year":
        return "Consulter les besoins reçus de l'année en cours";
      default:
        return "Consulter les besoins reçus (30 derniers jours)";
    }
  };

  const getAllSubtitle = () => {
    if (dateFilter === "custom" && customFilters.from && customFilters.to) {
      const fromStr = format(customFilters.from, "dd/MM/yyyy", {
        locale: fr,
      });
      const toStr = format(customFilters.to, "dd/MM/yyyy", {
        locale: fr,
      });
      return `Consulter tous les besoins du ${fromStr} au ${toStr}`;
    }

    switch (dateFilter) {
      case "today":
        return "Consulter tous les besoins d'aujourd'hui";
      case "week":
        return "Consulter tous les besoins des 7 derniers jours";
      case "month":
        return "Consulter tous les besoins du mois en cours";
      case "year":
        return "Consulter tous les besoins de l'année en cours";
      default:
        return "Consulter tous les besoins (30 derniers jours)";
    }
  };

  if (
    getRequestsStats.isLoading ||
    requestType.isLoading ||
    getRequestsGraph.isLoading ||
    paidExpenses.isLoading ||
    cancelledExpenses.isLoading
  )
    return <LoadingPage />;
  if (
    getRequestsStats.isError ||
    requestType.isError ||
    getRequestsGraph.isError ||
    paidExpenses.isError ||
    cancelledExpenses.isError
  )
    return (
      <ErrorPage
        error={
          getRequestsStats.error ||
          requestType.error ||
          getRequestsGraph.error ||
          paidExpenses.error ||
          cancelledExpenses.error ||
          undefined
        }
      />
    );
  if (
    getRequestsStats.isSuccess &&
    requestType.isSuccess &&
    user &&
    getRequestsGraph.isSuccess &&
    paidExpenses.isSuccess &&
    cancelledExpenses.isSuccess
  ) {
    const statistics: Array<StatisticProps> = [
      {
        title: "Total besoins soumis",
        value: String(filteredAll.length),
        variant: "default",
        more: {
          title: "Total besoins approuvés",
          value: String(getStatusCount(filteredAll, "approuvé")),
        },
      },
      {
        title: "En attente de validation",
        value: String(getStatusCount(filteredValidator, "enAttente")),
        variant: "primary",
        more: {
          title: "Besoins rejetés",
          value: String(getStatusCount(filteredSubmited, "rejetté")),
        },
      },
      {
        title: "Mes besoins soumis",
        value: String(filteredSubmited.length),
        variant: "secondary",
        more: {
          title: "Mes besoins approuvés",
          value: String(getStatusCount(filteredSubmited, "approuvé")),
        },
      },
      {
        title: "Paiement effectués",
        value: String(paidExpenses.data?.count || 0),
        variant: "dark",
        more: {
          title: "Paiement annulé",
          value: String(cancelledExpenses.data?.count || 0),
        },
      },
    ];

    console.log("distribution data", requestTypeDistributionData);

    return (
      <div className="content">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-bold">{"Tableau de bord"}</h1>
            <h4 className="font-extralight tracking-wide">{`Bonjour ${user?.firstName}`}</h4>
          </div>

          {/* Filtre de période */}
          <Sheet>
            <SheetTrigger asChild className="w-fit">
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent className="px-3">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <DashboardFilters
                customFilters={customFilters}
                setCustomFilters={setCustomFilters}
                isCustomDateModalOpen={isCustomDateModalOpen}
                setIsCustomDateModalOpen={setIsCustomDateModalOpen}
                resetAllFilters={resetAllFilters}
                setDateFilter={setDateFilter}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid-stats-4">
          {statistics
            .filter((item) => {
              if (
                user.role.some(
                  (r) =>
                    r.label === "VOLT_MANAGER" ||
                    r.label === "ADMIN" ||
                    r.label === "SUPERADMIN",
                )
              ) {
                return true;
              }
              if (user.validators && user.validators.length > 0) {
                return item.title !== "Total besoins soumis";
              }
              return item.title === "Mes besoins soumis";
            })
            .map((item) => (
              <StatisticCard key={item.title} {...item} />
            ))}
        </div>

        {/* Barchart: Type de besoins soumis */}
        {manager && (
          <BarChartType
            requestTypeDistributionData={requestTypeDistributionData}
          />
        )}

        {(manager || super_admin) && (
          <ChartGlobalState
            filteredData={
              filteredAll.length > 0 ? filteredAll : filteredSubmited
            }
          />
        )}

        {/* Graphique 1: Mes besoins */}
        <ChartAreaInteractive
          filteredData={filteredSubmited}
          dateFilter={dateFilter}
          customDateRange={
            customFilters.from && customFilters.to
              ? {
                  from: new Date(customFilters.from),
                  to: new Date(customFilters.to),
                }
              : undefined
          }
          title="Mes besoins"
          description={getSubtitle()}
          type="my"
        />

        {/* Graphique 2: Besoins reçus */}
        {manager && (
          <ChartAreaInteractive
            filteredData={filteredValidator}
            dateFilter={dateFilter}
            customDateRange={
              customFilters.from && customFilters.to
                ? {
                    from: new Date(customFilters.from),
                    to: new Date(customFilters.to),
                  }
                : undefined
            }
            title="Besoins reçus"
            description={getReceivedSubtitle()}
            type="all"
          />
        )}

        {super_admin && (
          <ChartAreaInteractiveAll
            filteredData={filteredAll}
            dateFilter={dateFilter}
            customDateRange={
              customFilters.from && customFilters.to
                ? {
                    from: new Date(customFilters.from),
                    to: new Date(customFilters.to),
                  }
                : undefined
            }
            title="Tous les besoins"
            description={getAllSubtitle()}
            type="all"
          />
        )}

        {dashboardPaidData.data && (
          <ChartExpenseEvolution
            filteredData={filteredPayments}
            dateFilter={dateFilter}
            customDateRange={
              customFilters.from && customFilters.to
                ? {
                    from: new Date(customFilters.from),
                    to: new Date(customFilters.to),
                  }
                : undefined
            }
          />
        )}

        {dashboardPaidData.data && (
          <Card className="py-4 mt-6">
            <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                <CardTitle>{"Dépenses"}</CardTitle>
                <CardDescription>
                  {`Dépenses totales: ${XAF.format(filteredTotalPaid)}`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dépense par type */}
              <ChartPieLabelList
                data={filteredPayments}
                chartType="type"
                title="Répartition par type"
                description="Répartition par type de paiement"
                requestType={requestType.data.data}
              />
              {/* Dépense par fournisseur */}
              <ChartPieLabelList
                data={filteredPayments}
                chartType="fournisseur"
                title="Répartition par fournisseur"
                description="Répartition par fournisseur"
                requestType={requestType.data.data}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
};

export default DashboardPage;
