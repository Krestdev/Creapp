"use client";

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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useQuery } from "@/hooks/useData";
import { XAF } from "@/lib/utils";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { PaymentRequest } from "@/types/types";

interface ChartPieLabelListProps {
  data?: PaymentRequest[];
  chartType: "type" | "project" | "fournisseur";
  title?: string;
  description?: string;
}

const PAYMENT_TYPES = {
  salary: "Salaire",
  invoice: "Facture",
  expense: "Dépense",
  other: "Autre",
} as const;

const CHART_COLORS = [
  "#2563EB", // bleu
  "#14B8A6", // turquoise
  "#16A34A", // vert
  "#F97316", // orange vif
  "#059669", // vert émeraude
  "#DC2626", // rouge
  "#F59E0B", // orange
  "#7C3AED", // violet
  "#0EA5E9", // cyan
  "#DB2777", // rose
  "#65A30D", // vert olive
  "#9333EA", // violet foncé
  "#EA580C", // orange foncé
  "#0284C7", // bleu clair
  "#B91C1C", // rouge foncé
  "#A16207", // moutarde
  "#1F2937", // gris foncé
  "#84CC16", // vert lime
  "#6366F1", // indigo
  "#EC4899", // rose vif
];

export function ChartPieLabelList({
  data = [],
  chartType,
  title = "Répartition des dépenses",
}: ChartPieLabelListProps) {
  const { data: projectData } = useQuery(
    ["projectsList"],
    projectQ.getAll,
    30000
  );

  const { data: commandData } = useQuery({queryKey:["purchaseOrders"], purchaseQ.getAll);

  // les commandes (liste des IDs)
  const commandIds = data.flatMap((x) => x.commandId);

  // Je vais chercher les fournisseurs des commandes qui appartiennent à commandIds
  const providerData = commandData?.data.filter((command) =>
    commandIds.includes(command.id)
  );

  console.log(data.filter((x) => x.status === "paid"));

  // Préparer les données
  const prepareChartData = () => {
    if (!data || data.length === 0) return [];

    const groups: Record<string, number> = {};

    data.forEach((payment) => {
      let key = "";
      const price = payment.price || 0;

      switch (chartType) {
        case "type":
          const type = payment.type || "other";
          key = PAYMENT_TYPES[type as keyof typeof PAYMENT_TYPES] || type;
          break;
        case "project":
          key = payment.projectId
            ? `Projet ${
                projectData?.data.find((p) => p.id === payment.projectId)?.label
              }`
            : "Sans projet";
          break;
        case "fournisseur":
          const provider =
            providerData?.find((p) => p.id === payment.commandId)?.provider
              .name || "Inconnu";
          key =
            provider.length > 12 ? `${provider.substring(0, 10)}...` : provider;
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
        fill: CHART_COLORS[index % CHART_COLORS.length],
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
          name: "Autres",
          amount: Math.round(othersTotal * 100) / 100,
          fill: CHART_COLORS[5],
        },
      ];
    }

    return result;
  };

  const chartData = prepareChartData();
  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  const translateType = (type: string) => {
    switch (type) {
      case "FAC":
        return "Facilitation";
      case "RH":
        return "RH";
      case "SPECIAL":
        return "Special";
      case "PURCHASE":
        return "Achat";
      case "Autre":
        return "Autre";
      default:
        return type;
    }
  };

  // Calculer les pourcentages pour les labels - 2 chiffres après la virgule
  const chartDataWithPercent = chartData.map((item) => ({
    ...item,
    name: translateType(item.name),
    // CORRECTION : utiliser toFixed(2) au lieu de Math.round
    percent:
      totalAmount > 0
        ? parseFloat(((item.amount / totalAmount) * 100).toFixed(2))
        : 0,
  }));

  // Config du graphique
  const chartConfig = chartDataWithPercent.reduce(
    (config, item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
      return config;
    },
    {
      amount: {
        label: "Montant",
      },
    } as ChartConfig
  );

  // Fonction pour afficher les pourcentages sur les portions
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    // Ne pas afficher de label si le pourcentage est trop petit
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // CORRECTION : multiplier par 100 et formater avec 2 décimales
    const displayPercent = percent.toFixed(2);

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
        {`${displayPercent}%`}
      </text>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
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
      </CardHeader>
      <CardContent>
        {/* Graphique en haut */}
        <div className="mb-4">
          <ChartContainer
            style={{ height: "350px", width: "100%" }}
            config={chartConfig}
          >
            <PieChart>
              <ChartTooltip
                cursor={{ fill: "transparent" }}
                content={
                  <ChartTooltipContent
                    nameKey="name"
                    labelKey="name"
                    formatter={(value, name, props) => {
                      // Afficher le pourcentage avec 2 décimales
                      const percent =
                        totalAmount > 0
                          ? parseFloat(
                              ((Number(value) / totalAmount) * 100).toFixed(2)
                            )
                          : 0;
                      return [
                        <div key="tooltip" className="space-y-1 min-w-[160px]">
                          <div className="font-semibold text-sm">{name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">
                              Montant:
                            </span>
                            <span className="font-semibold text-right">
                              {XAF.format(Number(value))}
                            </span>
                            <span className="text-muted-foreground">Part:</span>
                            <span className="font-semibold text-right">
                              {percent.toFixed(2)}%
                            </span>
                          </div>
                        </div>,
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
                innerRadius={60}
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
              <ChartLegend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                spacing={20}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="mx-auto text-gray-500">
          Total: {XAF.format(totalAmount)}
        </div>
      </CardFooter>
    </Card>
  );
}
