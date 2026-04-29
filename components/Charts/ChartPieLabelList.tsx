"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
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
import {
  Invoice,
  PAYMENT_TYPES,
  PaymentRequest,
  PayType,
  ProjectT,
  RequestType,
} from "@/types/types";

interface ChartPieLabelListProps {
  data?: PaymentRequest[];
  chartType: "type" | "project" | "fournisseur";
  title?: string;
  description?: string;
  projects?: ProjectT[];
  invoices?: Invoice[];
  requestType?: RequestType[];
}

const CHART_COLORS = [
  "#2563EB",
  "#14B8A6",
  "#16A34A",
  "#F97316",
  "#059669",
  "#DC2626",
  "#F59E0B",
  "#7C3AED",
  "#0EA5E9",
  "#DB2777",
  "#65A30D",
  "#9333EA",
  "#EA580C",
  "#0284C7",
  "#B91C1C",
  "#A16207",
  "#1F2937",
  "#84CC16",
  "#6366F1",
  "#EC4899",
];

export function ChartPieLabelList({
  data = [],
  chartType,
  invoices = [],
  projects = [],
  requestType = [],
  title = "Répartition des dépenses",
}: ChartPieLabelListProps) {
  // 1. Préparation des données groupées
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const groups: Record<string, number> = {};

    data.forEach((payment) => {
      let key = "Inconnu";
      const price = payment.price || 0;

      switch (chartType) {
        case "type":
          // const typeLabel = PAYMENT_TYPES.find((x) => x.value === payment.type)?.name;
          const typeLabel = requestType.find(
            (x) => x.type === payment.type,
          )?.label;
          key = typeLabel || "Autre";
          break;

        case "project":
          const project = projects.find((p) => p.id === payment.projectId);
          key = project ? `Projet ${project.label}` : "N/A";
          break;

        case "fournisseur":
          // Utilisation de == pour comparer string/number si nécessaire
          const invoice = invoices.find((inv) => inv.id == payment.invoiceId);
          const providerName = invoice?.command?.provider?.name;
          key = providerName || "Fournisseur inconnu";
          break;
      }

      groups[key] = (groups[key] || 0) + price;
    });

    // Transformation en tableau pour Recharts
    let result = Object.entries(groups)
      .map(([name, amount], index) => ({
        name,
        amount: Math.round(amount * 100) / 100,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    // Limitation à 5 catégories pour la lisibilité
    if (result.length > 5) {
      const top = result.slice(0, 4);
      const others = result.slice(4);
      const othersTotal = others.reduce((sum, item) => sum + item.amount, 0);

      result = [
        ...top,
        {
          name: "Autres",
          amount: Math.round(othersTotal * 100) / 100,
          fill: "#94a3b8",
        },
      ];
    }

    return result;
  }, [data, chartType, invoices, projects]);

  const totalAmount = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData],
  );

  // 2. Configuration pour le composant ChartContainer de shadcn/ui
  const chartConfig = React.useMemo(() => {
    const config = {
      amount: { label: "Montant" },
    } as ChartConfig;

    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });

    return config;
  }, [chartData]);

  // 3. Label personnalisé au centre des portions
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Ne pas afficher si trop petit (< 5%)

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold pointer-events-none"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </Card>
    );
  }

  // ... (reste du code identique au début)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          // On retire "mx-auto" et on utilise flex pour aligner le SVG et la légende
          className="aspect-square max-h-[350px] w-full [&_.recharts-pie-label-line]:display-none"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className="font-bold text-foreground">{name}</span>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Montant:</span>
                        <span className="font-medium">
                          {XAF.format(Number(value))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Part:</span>
                        <span className="font-medium">
                          {((Number(value) / totalAmount) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>

            {/* MODIFICATIONS ICI POUR LA LÉGENDE */}
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              className="flex-col items-start! gap-2 ml-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm border-top pt-4">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total cumulé : {XAF.format(totalAmount)}
        </div>
      </CardFooter>
    </Card>
  );
}
