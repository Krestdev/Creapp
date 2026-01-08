"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

export interface AreaChartDataItem {
  /** Identifiant de la période (ex: "2024-01", "January", "Semaine 1") */
  period: string;
  /** Valeurs pour chaque série de données */
  [key: string]: number | string;
}

export interface AreaChartSeries {
  /** Clé d'accès dans les données */
  key: string;
  /** Nom à afficher */
  label: string;
  /** Couleur de la zone */
  color: string;
  /** Type de courbe (naturel, monotone, linéaire) */
  type?: "natural" | "monotone" | "linear";
  /** Opacité de remplissage (0-1) */
  fillOpacity?: number;
  /** Afficher le gradient */
  showGradient?: boolean;
  /** Désactiver la zone */
  strokeOnly?: boolean;
}

interface AreaChartProps {
  /** Données du graphique */
  data: AreaChartDataItem[];
  /** Séries à afficher */
  series: AreaChartSeries[];
  /** Configuration du graphique (optionnel, généré automatiquement si non fourni) */
  chartConfig?: ChartConfig;
  /** Format d'affichage des périodes sur l'axe X */
  xAxisFormatter?: (value: string) => string;
  /** Format d'affichage des valeurs sur l'axe Y */
  yAxisFormatter?: (value: number) => string;
  /** Afficher l'axe Y */
  showYAxis?: boolean;
  /** Afficher la grille */
  showGrid?: boolean;
  /** Type d'indicateur dans le tooltip */
  tooltipIndicator?: "dot" | "line" | "dashed";
  /** Personnalisation du tooltip */
  tooltipConfig?: {
    /** Cacher le label dans le tooltip */
    hideLabel?: boolean;
    /** Format personnalisé pour les valeurs */
    valueFormatter?: (value: number, name: string) => string;
    /** Format personnalisé pour le label */
    labelFormatter?: (label: string) => string;
  };
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
  /** Hauteur du graphique */
  height?: number;
  /** Marges du graphique */
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

const defaultMargin = {
  top: 20,
  right: 0,
  left: 0,
  bottom: 10,
}

const generateChartConfigFromSeries = (series: AreaChartSeries[]): ChartConfig => {
  const config: ChartConfig = {}
  
  series.forEach((serie) => {
    config[serie.key] = {
      label: serie.label,
      color: serie.color,
    }
  })
  
  return config
}

export function ChartArea({
  data,
  series,
  chartConfig,
  xAxisFormatter = (value) => value.length > 6 ? `${value.slice(0, 3)}` : value,
  yAxisFormatter = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return value.toString()
  },
  showYAxis = false,
  showGrid = true,
  tooltipIndicator = "dot",
  tooltipConfig = {},
  trend,
  height = 400,
  margin = defaultMargin,
}: AreaChartProps) {
  
  // Utiliser le chartConfig fourni ou en générer un à partir des séries
  const finalChartConfig = chartConfig || generateChartConfigFromSeries(series)


  // Calculer la tendance si non fournie
  const calculateTrend = () => {
    if (trend) return trend
    
    if (data.length > 1 && series.length > 0) {
      const firstValue = Number(data[0][series[0].key]) || 0
      const lastValue = Number(data[data.length - 1][series[0].key]) || 0
      
      if (firstValue > 0) {
        const trendValue = ((lastValue - firstValue) / firstValue) * 100
        return {
          value: trendValue,
          label: trendValue > 0 ? "Hausse de" : "Baisse de",
          period: `sur ${data.length} périodes`,
        }
      }
    }
    
    return null
  }

  const calculatedTrend = trend || calculateTrend()


  return (
        <ChartContainer config={finalChartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={margin}
            height={height}
          >
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
            
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={xAxisFormatter}
            />
            
            {showYAxis && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={yAxisFormatter}
              />
            )}
            
            <ChartTooltip
              cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent 
                  indicator={tooltipIndicator}
                  hideLabel={tooltipConfig.hideLabel}
                  formatter={(value, name) => {
                    const formattedValue = tooltipConfig.valueFormatter?.(Number(value), String(name)) 
                      || Number(value).toLocaleString('fr-FR')
                    return [formattedValue, finalChartConfig[name]?.label || name]
                  }}
                  labelFormatter={tooltipConfig.labelFormatter || ((label) => `Période: ${label}`)}
                />
              }
            />
            
            {series.map((serie) => (
              <Area
                key={serie.key}
                dataKey={serie.key}
                type={serie.type || "natural"}
                fill={serie.strokeOnly ? "transparent" : serie.color}
                fillOpacity={serie.fillOpacity || (serie.strokeOnly ? 0 : 0.4)}
                stroke={serie.color}
                strokeWidth={2}
                stackId={serie.showGradient ? "1" : undefined}
                activeDot={{ r: 6, strokeWidth: 2, stroke: serie.color }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ChartContainer>
  )
}