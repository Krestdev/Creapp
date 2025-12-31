"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* -------------------- FORMAT XAF -------------------- */
const XAF = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

/* -------------------- DATA -------------------- */
const chartData = [
  { date: "2024-07-01", attente: 222000, payé: 150000 },
  { date: "2024-08-01", attente: 9700, payé: 180000 },
  { date: "2024-09-01", attente: 16700, payé: 120000 },
  { date: "2024-10-01", attente: 24200, payé: 260000 },
  { date: "2024-11-01", attente: 180000, payé: 290000 },
  { date: "2024-12-01", attente: 140000, payé: 340000 },
  { date: "2025-01-01", attente: 200000, payé: 180000 },
  { date: "2025-02-01", attente: 175000, payé: 320000 },
  { date: "2025-03-01", attente: 190000, payé: 110000 },
  { date: "2025-04-01", attente: 160000, payé: 190000 },
  { date: "2025-05-01", attente: 210000, payé: 350000 },
  { date: "2025-06-01", attente: 250000, payé: 400000 },
];

/* -------------------- CONFIG -------------------- */
const chartConfig = {
  views: {
    label: "Dépenses",
  },
  attente: {
    label: "En attente",
    color: "var(--chart-2)",
  },
  payé: {
    label: "Ticket payé",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/* -------------------- COMPONENT -------------------- */
export function ChartLineInteractive() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("attente");

  /* -------- 12 MOIS FIXES -------- */
  const last12MonthsData = React.useMemo(() => {
    return chartData.slice(-12);
  }, []);

  /* -------- TOTALS -------- */
  const total = React.useMemo(
    () => ({
      attente: last12MonthsData.reduce((acc, curr) => acc + curr.attente, 0),
      payé: last12MonthsData.reduce((acc, curr) => acc + curr.payé, 0),
    }),
    [last12MonthsData]
  );

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>{"Dépenses"}</CardTitle>
          <CardDescription>
            {"Consultez les dépenses des 12 derniers mois"}
          </CardDescription>
        </div>

        {/* -------- SWITCH -------- */}
        <div className="flex">
          {(["attente", "payé"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {XAF.format(total[key])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      {/* -------------------- CHART -------------------- */}
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={last12MonthsData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", {
                  month: "short",
                  year: "numeric",
                })
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                  formatter={(value, name) => {
                    const label =
                      name === "attente"
                        ? "En attente "
                        : name === "payé"
                        ? "Ticket payé "
                        : name;

                    return [label, XAF.format(Number(value))];
                  }}
                />
              }
            />

            <Line
              dataKey="attente"
              type="monotone"
              stroke="var(--color-attente)"
              strokeWidth={2}
              dot={false}
            />

            <Line
              dataKey="payé"
              type="monotone"
              stroke="var(--color-payé)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
