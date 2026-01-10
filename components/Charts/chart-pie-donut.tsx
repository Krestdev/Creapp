"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

export interface ChartDataItem {
  /** Identifiant unique pour chaque segment */
  id: string | number;
  /** Valeur numérique à afficher */
  value: number;
  /** Label à afficher dans la légende et le tooltip */
  label: string;
  /** Couleur CSS (hex, rgb, hsl, ou variable CSS) */
  color: string;
  /** Nom interne pour la correspondance avec chartConfig */
  name?: string;
}

interface DonutChartProps {
  /** Données du graphique */
  data: ChartDataItem[];
  /** Configuration du graphique (optionnel, généré automatiquement si non fourni) */
  chartConfig?: ChartConfig;
  /** Rayon intérieur (0 = camembert, >0 = donut) */
  innerRadius?: number;
  /** Taille maximale du graphique */
  maxHeight?: number;
  /** Afficher les légendes */
  showLegend?: boolean;
  /** Contenu du footer (optionnel, remplace le footer par défaut) */
  footerContent?: React.ReactNode;
  /** Statistiques de tendance (optionnel) */
  trend?: {
    /** Pourcentage de changement */
    value: number;
    /** Label de la tendance */
    label: string;
    /** Période de la tendance */
    period: string;
  };
  /** Personnalisation du tooltip */
  tooltipConfig?: {
    /** Cacher le label dans le tooltip */
    hideLabel?: boolean;
    /** Format personnalisé pour les valeurs */
    valueFormatter?: (value: number) => string;
  };
}

const defaultChartConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig;

const generateChartConfigFromData = (data: ChartDataItem[]): ChartConfig => {
  const config: ChartConfig = { ...defaultChartConfig };

  data.forEach((item, index) => {
    const key = item.name || `item_${index}`;
    config[key] = {
      label: item.label,
      color: item.color,
    };
  });

  return config;
};

export function ChartPieDonut({
  data,
  chartConfig,
  innerRadius = 60,
  maxHeight = 400,
  showLegend = false,
  tooltipConfig = {},
}: DonutChartProps) {
  // Préparer les données pour Recharts
  const chartData = data.map((item, index) => ({
    id: item.id,
    value: item.value,
    label: item.label,
    name: item.name || `item_${index}`,
    fill: item.color,
  }));

  // Utiliser le chartConfig fourni ou en générer un à partir des données
  const finalChartConfig = chartConfig || generateChartConfigFromData(data);

  // Calculer le total pour les pourcentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Formatter par défaut pour les valeurs
  const defaultValueFormatter = (value: number) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
    return `${value} (${percentage}%)`;
  };

  return (
    <div>
      <ChartContainer
        config={finalChartConfig}
        className="mx-auto aspect-square"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel={tooltipConfig.hideLabel}
                formatter={(value, name) => {
                  const formattedValue =
                    tooltipConfig.valueFormatter?.(Number(value)) ||
                    defaultValueFormatter(Number(value));
                  return [
                    formattedValue,
                    finalChartConfig[name]?.label || name,
                  ];
                }}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius="80%"
            paddingAngle={0}
            stroke="transparent"
            strokeWidth={2}
          />
        </PieChart>
      </ChartContainer>

      {/* Légende optionnelle */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1 md:grid-cols-2">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
