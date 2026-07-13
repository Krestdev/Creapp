"use client";

import * as React from "react";
import { Area, ComposedChart, CartesianGrid, XAxis, YAxis, Line } from "recharts";
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
import { XAF } from "@/lib/utils";

interface ChartExpenseEvolutionProps {
  filteredData?: any[];
  dateFilter?: string;
  customDateRange?: { from: Date; to: Date };
  title?: string;
  description?: string;
}

const chartConfig = {
  montant: {
    label: "Montant (XAF)",
    color: "hsl(var(--chart-1))",
  },
  nombre: {
    label: "Nombre d'opérations",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ChartExpenseEvolution({
  filteredData = [],
  dateFilter,
  customDateRange,
  title = "Évolution des dépenses",
  description,
}: ChartExpenseEvolutionProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("montant");

  const filterDataByDate = React.useCallback((data: any[]) => {
    if (!data || data.length === 0) return [];
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (!dateFilter) return data;

    if (dateFilter === "custom" && customDateRange) {
      startDate = new Date(customDateRange.from);
      endDate = new Date(customDateRange.to);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return data;
      return data.filter((item) => {
        try {
          return isWithinInterval(new Date(item.createdAt), { start: startDate, end: endDate });
        } catch {
          return false;
        }
      });
    }

    switch (dateFilter) {
      case "today":
        return data.filter((item) => {
          try {
            return isSameDay(new Date(item.createdAt), now);
          } catch {
            return false;
          }
        });
      case "week": {
        startDate = subDays(now, 6);
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
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
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
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        return data.filter((item) => {
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

  const filteredDataByDate = React.useMemo(() => {
    return filterDataByDate(filteredData);
  }, [filteredData, filterDataByDate]);

  const chartData = React.useMemo(() => {
    if (filteredDataByDate.length === 0) return [];

    const dates = filteredDataByDate
      .map(item => new Date(item.createdAt))
      .filter(date => !isNaN(date.getTime()));

    if (dates.length === 0) return [];

    const dataMinDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const dataMaxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    let startDate: Date;
    let endDate: Date;
    let intervalType: 'day' | 'week' | 'month' = 'day';

    if (dateFilter === "year") {
      const year = dataMaxDate.getFullYear();
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
      intervalType = 'month';
    } else if (dateFilter === "month") {
      const month = dataMaxDate.getMonth();
      const year = dataMaxDate.getFullYear();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
      intervalType = 'week';
    } else {
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
      case 'day': intervals = eachDayOfInterval({ start: startDate, end: endDate }); break;
      case 'week': intervals = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 }); break;
      case 'month': intervals = eachMonthOfInterval({ start: startDate, end: endDate }); break;
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
        montant: dayData.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
        nombre: dayData.length,
      };
    });
  }, [filteredDataByDate, dateFilter]);

  const formatXAxisTick = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      if (dateFilter === "year") return format(date, 'MMM', { locale: fr });
      if (dateFilter === "month") return `S${getWeek(date, { weekStartsOn: 1 })}`;
      return format(date, 'dd/MM', { locale: fr });
    } catch {
      return value;
    }
  };

  const formatTooltipLabel = (value: string) => {
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      if (dateFilter === "year") return format(date, 'MMMM yyyy', { locale: fr });
      if (dateFilter === "month") {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `Semaine ${getWeek(date, { weekStartsOn: 1 })} (${format(weekStart, 'dd/MM', { locale: fr })} - ${format(weekEnd, 'dd/MM', { locale: fr })})`;
      }
      return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
    } catch {
      return value;
    }
  };

  const total = React.useMemo(() => {
    return chartData.reduce(
      (acc, item) => {
        acc.montant += item.montant;
        acc.nombre += item.nombre;
        return acc;
      },
      { montant: 0, nombre: 0 },
    );
  }, [chartData]);

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
              <span className="text-lg font-bold leading-none sm:text-2xl">
                {key === "montant" ? XAF.format(total[key]) : total[key]}
              </span>
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
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="fillMontant" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
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
              <YAxis
                yAxisId="left"
                tickFormatter={(value) =>
                  value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()
                }
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={formatTooltipLabel}
                    formatter={(value, name, item) => (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color || item.payload?.fill || "var(--primary)" }}
                        />
                        <span className="text-muted-foreground">
                          {name === "montant" ? "Montant" : "Nombre d'opération"} :
                        </span>
                        <span className="font-medium text-foreground">
                          {name === "montant" ? XAF.format(Number(value)) : String(value)}
                        </span>
                      </div>
                    )}
                  />
                }
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="montant"
                stroke="var(--chart-1)"
                fill="url(#fillMontant)"
                strokeWidth={2}
                fillOpacity={1}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="nombre"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />

              <ChartLegend content={<ChartLegendContent />} />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
