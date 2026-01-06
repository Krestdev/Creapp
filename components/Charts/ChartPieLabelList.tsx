"use client"

import { Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PaymentRequest } from "@/types/types"
import { XAF } from "@/lib/utils"

interface ChartPieLabelListProps {
  data?: PaymentRequest[];
  chartType: 'type' | 'project' | 'fournisseur';
  title?: string;
  description?: string;
}

const PAYMENT_TYPES = {
  salary: "Salaire",
  invoice: "Facture",
  expense: "Dépense",
  other: "Autre"
} as const;

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

export function ChartPieLabelList({
  data = [],
  chartType,
  title = "Répartition des dépenses",
  description = "Répartition des montants payés"
}: ChartPieLabelListProps) {

  // Préparer les données
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];

    const groups: Record<string, number> = {};

    data.forEach(payment => {
      let key = '';
      const price = payment.price || 0;

      switch (chartType) {
        case 'type':
          const type = payment.type || 'other';
          key = PAYMENT_TYPES[type as keyof typeof PAYMENT_TYPES] || type;
          break;
        case 'project':
          key = payment.projectId ? `Projet ${payment.projectId}` : 'Sans projet';
          break;
        case 'fournisseur':
          const provider = payment.title || payment.reference || 'Inconnu';
          key = provider.length > 12 ? `${provider.substring(0, 10)}...` : provider;
          break;
      }

      if (key) {
        groups[key] = (groups[key] || 0) + price;
      }
    });

    const result = Object.entries(groups)
      .map(([name, amount], index) => ({
        name,
        amount: Math.round(amount * 100) / 100,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount);

    // Limiter à 5 catégories pour la lisibilité
    if (result.length > 5) {
      const top = result.slice(0, 4);
      const others = result.slice(4);
      const othersTotal = others.reduce((sum, item) => sum + item.amount, 0);

      return [
        ...top,
        {
          name: 'Autres',
          amount: Math.round(othersTotal * 100) / 100,
          fill: CHART_COLORS[5]
        }
      ];
    }

    return result;
  };

  const chartData = prepareChartData();
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  // Calculer les pourcentages pour les labels
  const chartDataWithPercent = chartData.map(item => ({
    ...item,
    percent: totalAmount > 0 ? Math.round(item.amount / totalAmount * 100) : 0
  }));

  // Config du graphique
  const chartConfig = chartDataWithPercent.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.fill
    };
    return config;
  }, {
    amount: {
      label: "Montant",
    },
  } as ChartConfig);

  // Fonction pour afficher les pourcentages sur les portions
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    // Ne pas afficher de label si le pourcentage est trop petit
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const displayPercent = Math.round(percent * 100);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
        className="drop-shadow-sm pointer-events-none text-[10px]"
      >
        {`${displayPercent / 100}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  if (chartDataWithPercent.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
          <p className="text-muted-foreground">Pas de données pour ce type</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">
          {description}
          <div className="mt-1 font-semibold text-foreground">
            Total: {XAF.format(totalAmount)}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-48">
          <PieChart>
            <ChartTooltip
              cursor={{ fill: 'transparent' }}
              content={
                <ChartTooltipContent
                  nameKey="name"
                  labelKey="name"
                  formatter={(value, name, props) => {
                    const item = props.payload as any;
                    const percent = item?.percent || 0;
                    return [
                      <div key="value" className="font-semibold">
                        {XAF.format(Number(value))}
                      </div>,
                      <div key="details" className="text-xs text-muted-foreground">
                        {name} • {percent}% du total
                      </div>
                    ];
                  }}
                />
              }
            />
            <Pie
              data={chartDataWithPercent}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {chartDataWithPercent.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="transition-opacity hover:opacity-90 cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}