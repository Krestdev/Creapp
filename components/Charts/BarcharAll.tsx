"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getWeek,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameDay,
} from "date-fns";
import { fr } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { RequestModelT } from "@/types/types";

interface ChartAreaInteractiveAllProps {
  filteredData?: RequestModelT[];
  dateFilter?: string;
  customDateRange?: { from: Date; to: Date };
  title?: string;
  description?: string;
  type?: string;
}

const chartConfig = {
  approuvé: {
    label: "Approuvé",
    color: "hsl(var(--chart-2))",
  },
  rejeté: {
    label: "Rejeté",
    color: "hsl(var(--chart-1))",
  },
  enAttente: {
    label: "En attente",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractiveAll({
  filteredData = [],
  dateFilter,
  customDateRange,
  title,
  description,
  type,
}: ChartAreaInteractiveAllProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("approuvé");

  const getStatusCounts = (items: RequestModelT[]) => {
    return {
      approuvé: items.filter((item) => {
        const s = (item.state || "").toLowerCase();
        return ["approved", "store", "approv", "valid"].some(key => s.includes(key));
      }).length,
      rejeté: items.filter((item) => {
        const s = (item.state || "").toLowerCase();
        return ["rejected", "rejet", "refus"].some(key => s.includes(key));
      }).length,
      enAttente: items.filter((item) => {
        const s = (item.state || "").toLowerCase();
        return ["pending", "reviews", "wait", "attente"].some(key => s.includes(key));
      }).length,
    };
  };

  // 🔥 Fonction pour filtrer les données selon le filtre
  const filterDataByDate = React.useCallback((data: RequestModelT[]) => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Si pas de filtre, retourner toutes les données
    if (!dateFilter) {
      return data;
    }

    // Filtre personnalisé
    if (dateFilter === "custom" && customDateRange) {
      startDate = new Date(customDateRange.from);
      endDate = new Date(customDateRange.to);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return data;
      }
      return data.filter(item => {
        try {
          const itemDate = new Date(item.createdAt);
          return isWithinInterval(itemDate, { start: startDate, end: endDate });
        } catch {
          return false;
        }
      });
    }

    // Filtres prédéfinis
    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        return data.filter(item => {
          try {
            return isSameDay(new Date(item.createdAt), now);
          } catch {
            return false;
          }
        });

      case "week": {
        startDate = subDays(now, 6);
        startDate.setHours(0, 0, 0, 0);
        return data.filter(item => {
          try {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= now;
          } catch {
            return false;
          }
        });
      }

      case "month": {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        return data.filter(item => {
          try {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
          } catch {
            return false;
          }
        });
      }

      case "year": {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        return data.filter(item => {
          try {
            const itemDate = new Date(item.createdAt);
            return itemDate >= startDate && itemDate <= endDate;
          } catch {
            return false;
          }
        });
      }

      default:
        return data;
    }
  }, [dateFilter, customDateRange]);

  // 🔥 Données filtrées
  const filteredDataByDate = React.useMemo(() => {
    return filterDataByDate(filteredData);
  }, [filteredData, filterDataByDate]);

  const getIntervalType = (start: Date, end: Date): 'day' | 'week' | 'month' => {
    const diffDays = differenceInDays(end, start);
    if (diffDays > 60) return 'month';
    if (diffDays > 14) return 'week';
    return 'day';
  };

  const chartData = React.useMemo(() => {
    if (filteredDataByDate.length === 0) return [];

    // Extraire les dates des données filtrées
    const dates = filteredDataByDate
      .map(item => new Date(item.createdAt))
      .filter(date => !isNaN(date.getTime()));

    if (dates.length === 0) return [];

    const dataMinDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const dataMaxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    let startDate: Date;
    let endDate: Date;
    let intervalType: 'day' | 'week' | 'month' = 'day';

    // Si c'est "year", on utilise une logique spéciale
    if (dateFilter === "year") {
      const year = dataMaxDate.getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      intervalType = 'month';
    }
    // Si "month", on utilise le mois
    else if (dateFilter === "month") {
      const month = dataMaxDate.getMonth();
      const year = dataMaxDate.getFullYear();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
      intervalType = 'week';
    }
    // Si "custom" ou autre
    else {
      // Utiliser les dates min et max des données filtrées
      startDate = new Date(dataMinDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dataMaxDate);
      endDate.setHours(23, 59, 59, 999);

      const diffDays = differenceInDays(endDate, startDate);
      if (diffDays > 60) intervalType = 'month';
      else if (diffDays > 14) intervalType = 'week';
      else intervalType = 'day';
    }

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    let intervals: Date[] = [];

    switch (intervalType) {
      case 'day':
        intervals = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'week':
        intervals = eachWeekOfInterval(
          { start: startDate, end: endDate },
          { weekStartsOn: 1 }
        );
        break;
      case 'month':
        intervals = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
    }

    return intervals.map((date) => {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      switch (intervalType) {
        case 'day':
          periodStart = new Date(date);
          periodStart.setHours(0, 0, 0, 0);
          periodEnd = new Date(date);
          periodEnd.setHours(23, 59, 59, 999);
          label = format(date, 'dd/MM', { locale: fr });
          break;
        case 'week':
          periodStart = startOfWeek(date, { weekStartsOn: 1 });
          periodEnd = endOfWeek(date, { weekStartsOn: 1 });
          label = `S${getWeek(date, { weekStartsOn: 1 })}`;
          break;
        case 'month':
          periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
          periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          label = format(date, 'MMM', { locale: fr });
          break;
      }

      const dayData = filteredDataByDate.filter((item) => {
        try {
          const itemDate = new Date(item.createdAt);
          return itemDate >= periodStart && itemDate <= periodEnd;
        } catch {
          return false;
        }
      });

      return {
        date: format(date, 'yyyy-MM-dd'),
        label,
        ...getStatusCounts(dayData),
      };
    });
  }, [filteredDataByDate, dateFilter]);

  const formatXAxisTick = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      if (dateFilter === "year") {
        return format(date, 'MMM', { locale: fr });
      } else if (dateFilter === "month") {
        return `S${getWeek(date, { weekStartsOn: 1 })}`;
      } else {
        return format(date, 'dd/MM', { locale: fr });
      }
    } catch {
      return value;
    }
  };

  const formatTooltipLabel = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      if (dateFilter === "year") {
        return format(date, 'MMMM yyyy', { locale: fr });
      } else if (dateFilter === "month") {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `Semaine ${getWeek(date, { weekStartsOn: 1 })} (${format(weekStart, 'dd/MM', { locale: fr })} - ${format(weekEnd, 'dd/MM', { locale: fr })})`;
      } else {
        return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
      }
    } catch {
      return value;
    }
  };

  const total = React.useMemo(
    () =>
      chartData.reduce(
        (acc, item) => {
          acc.approuvé += item.approuvé;
          acc.rejeté += item.rejeté;
          acc.enAttente += item.enAttente;
          return acc;
        },
        { approuvé: 0, rejeté: 0, enAttente: 0 },
      ),
    [chartData],
  );

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b py-5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex flex-col items-stretch border-b sm:flex-row p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex flex-wrap border-t sm:border-t-0">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="flex flex-1 min-w-[100px] flex-col justify-center gap-1 border-l px-4 py-2 text-left data-[active=true]:bg-muted/50 sm:px-6 sm:py-4"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-muted-foreground text-xs">{chartConfig[key].label}</span>
              <span className="text-lg font-bold leading-none sm:text-2xl">{total[key]}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée à afficher pour cette période
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillApprouve" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRejete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillAttente" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatXAxisTick}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={formatTooltipLabel}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="enAttente"
                stackId="a"
                stroke="var(--chart-3)"
                fill="url(#fillAttente)"
                strokeWidth={2}
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="rejeté"
                stackId="a"
                stroke="var(--chart-1)"
                fill="url(#fillRejete)"
                strokeWidth={2}
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="approuvé"
                stackId="a"
                stroke="var(--chart-2)"
                fill="url(#fillApprouve)"
                strokeWidth={2}
                fillOpacity={1}
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}