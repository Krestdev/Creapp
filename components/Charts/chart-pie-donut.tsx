"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

export interface ChartDataItem {
  id: string | number;
  value: number;
  label: string;
  color: string;
  name?: string;
  [key: string]: any; // Pour les données supplémentaires
}

interface DonutChartProps {
  data: ChartDataItem[];
  chartConfig?: ChartConfig;
  innerRadius?: number;
  maxHeight?: number;
  showLegend?: boolean;
  footerContent?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    period: string;
  };
  tooltipConfig?: {
    hideLabel?: boolean;
    valueFormatter?: (value: number, name: string, payload?: any) => string;
  };
  className?: string;
  total?: number; // Total pour calculer les pourcentages
}

export function ChartPieDonut({
  data,
  chartConfig,
  innerRadius = 40,
  maxHeight = 300,
  showLegend = false,
  tooltipConfig = {},
  className = "",
  total: propTotal,
}: DonutChartProps) {
  
  // Calculer le total si non fourni
  const total = propTotal || data.reduce((sum, item) => sum + item.value, 0);
  
  // Préparer les données pour Recharts
  const chartData = data.map((item, index) => ({
    ...item,
    name: item.name || `item_${index}`,
    fill: item.color,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0",
  }));

  // Générer chartConfig si non fourni
  const finalChartConfig: ChartConfig = chartConfig || {
    value: { label: "Value" },
    ...Object.fromEntries(
      data.map((item, index) => [
        item.name || `item_${index}`,
        {
          label: item.label,
          color: item.color,
        }
      ])
    ),
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  };

  // Formatter par défaut pour le tooltip
  const defaultValueFormatter = (value: number, name: string, payload?: any) => {
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
    return `${value.toLocaleString('fr-FR')} (${percentage}%)`;
  };

  return (
    <div className="w-full">
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
              formatter={(value, name, props) => {
                const formattedValue = tooltipConfig.valueFormatter?.(
                  Number(value), 
                  name as string,
                  props?.payload
                ) || defaultValueFormatter(Number(value), name as string, props?.payload);
                
                const label = finalChartConfig[name]?.label || name;
                return [formattedValue, label];
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
          paddingAngle={2}
          stroke="white"
          strokeWidth={2}
        />
      </PieChart>
    </ChartContainer>

    {showLegend && (
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1 md:grid-cols-2">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={item.id || index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium truncate max-w-[100px]">
                  {item.label}
                </span>
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