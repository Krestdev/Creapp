"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
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
    color: "hsl(var(--chart-2))", // Vert
  },
  rejeté: {
    label: "Rejeté",
    color: "hsl(var(--chart-1))", // Rouge
  },
  enAttente: {
    label: "En attente",
    color: "hsl(var(--chart-3))", // Orange
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

  // Logique de filtrage regroupée pour 3 statuts
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

  const chartData = React.useMemo(() => {
    if (filteredData.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (!dateFilter) {
      startDate = subDays(now, 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateFilter === "custom" && customDateRange) {
      startDate = customDateRange.from;
      endDate = customDateRange.to;
    } else {
      switch (dateFilter) {
        case "today": startDate = new Date(now).setHours(0, 0, 0, 0) as any; break;
        case "week": startDate = subDays(now, 6); break;
        case "month": startDate = startOfMonth(now); endDate = endOfMonth(now); break;
        default: startDate = subDays(now, 6);
      }
    }

    const dateRange = eachDayOfInterval({
      start: new Date(startDate),
      end: endDate,
    });

    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = filteredData.filter(
        (item) => format(new Date(item.createdAt), "yyyy-MM-dd") === dateStr,
      );

      return {
        date: dateStr,
        ...getStatusCounts(dayData),
      };
    });
  }, [filteredData, dateFilter, customDateRange]);

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
              tickFormatter={(v) => format(new Date(v), "dd/MM", { locale: fr })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(v) => format(new Date(v), "dd MMMM yyyy", { locale: fr })}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="enAttente"
              stroke="orange"
              fill={type === "my" ? "url(#fillAttente)" : "none"}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="rejeté"
              stroke="red"
              fill={type === "my" ? "url(#fillRejete)" : "none"}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="approuvé"
              stroke="green"
              fill={type === "my" ? "url(#fillApprouve)" : "none"}
              strokeWidth={2}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}