"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

export interface AreaChartDataItem {
  period: string;
  [key: string]: number | string;
}

export interface AreaChartSeries {
  key: string;
  label: string;
  color: string;
  type?: "natural" | "monotone" | "linear";
  fillOpacity?: number;
  strokeWidth?: number;
}

interface AreaChartProps {
  data: AreaChartDataItem[];
  series: AreaChartSeries[];
  chartConfig?: ChartConfig;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
  showYAxis?: boolean;
  showGrid?: boolean;
  tooltipIndicator?: "dot" | "line" | "dashed";
  tooltipConfig?: {
    hideLabel?: boolean;
    valueFormatter?: (value: number, name: string, payload?: any) => string;
    labelFormatter?: (label: string) => string;
  };
  footerContent?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    period: string;
  };
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  className?: string;
}

export function ChartArea({
  data,
  series,
  chartConfig,
  xAxisFormatter = (value) => value.length > 6 ? `${value.slice(0, 3)}` : value,
  yAxisFormatter = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  },
  showYAxis = false,
  showGrid = true,
  tooltipIndicator = "dot",
  tooltipConfig = {},
  footerContent,
  trend,
  height = 300,
  margin = { top: 20, right: 30, left: 20, bottom: 10 },
  className = "",
}: AreaChartProps) {
  
  // Générer chartConfig si non fourni
  const finalChartConfig: ChartConfig = chartConfig || {
    ...Object.fromEntries(
      series.map(serie => [
        serie.key,
        {
          label: serie.label,
          color: serie.color,
        }
      ])
    ),
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Calculer la tendance si non fournie
  const calculateTrend = () => {
    if (trend) return trend;
    
    if (data.length > 1 && series.length > 0) {
      const firstValue = Number(data[0][series[0].key]) || 0;
      const lastValue = Number(data[data.length - 1][series[0].key]) || 0;
      
      if (firstValue > 0) {
        const trendValue = ((lastValue - firstValue) / firstValue) * 100;
        return {
          value: trendValue,
          label: trendValue > 0 ? "Hausse de" : "Baisse de",
          period: `sur ${data.length} périodes`,
        };
      }
    }
    
    return null;
  };

  const calculatedTrend = trend || calculateTrend();

  // Formatter par défaut pour le tooltip
  const defaultValueFormatter = (value: number) => {
    return value.toLocaleString('fr-FR');
  };

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
                  formatter={(value, name, props) => {
                    const formattedValue = tooltipConfig.valueFormatter?.(
                      Number(value), 
                      name as string,
                      props?.payload
                    ) || defaultValueFormatter(Number(value));
                    
                    const label = finalChartConfig[name]?.label || name;
                    return [formattedValue, label];
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
                fill={serie.color}
                fillOpacity={serie.fillOpacity || 0.4}
                stroke={serie.color}
                strokeWidth={serie.strokeWidth || 2}
                activeDot={{ r: 6, strokeWidth: 2, stroke: serie.color }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ChartContainer>
  );
}