"use client";

import * as React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Rectangle,
  Legend,
} from "recharts";

export interface BarChartDataItem {
  [key: string]: number | string;
  period: string;
}

export interface BarChartSeries {
  key: string;
  label: string;
  color: string;
  stackId?: string;
  radius?: number | [number, number, number, number];
  barSize?: number;
}

interface BarChartProps {
  data: BarChartDataItem[];
  series: BarChartSeries[];
  chartConfig?: ChartConfig;

  xAxisKey?: string;
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
  margin?: { top?: number; right?: number; bottom?: number; left?: number };

  className?: string;

  stacked?: boolean;
  vertical?: boolean;

  barSize?: number;
  showLegend?: boolean;

  barRadius?: number | [number, number, number, number];
  animationDuration?: number;

  barGap?: number;
  categoryGap?: number;
  barCategoryGap?: number;
}

export function ChartBar({
  data,
  series,
  chartConfig,
  xAxisKey = "period",

  xAxisFormatter = (value) =>
    value.length > 12 ? `${value.slice(0, 10)}…` : value,

  yAxisFormatter = (value) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toLocaleString("fr-FR");
  },

  showYAxis = false,
  showGrid = true,

  tooltipIndicator = "line",
  tooltipConfig = {},

  footerContent,
  trend,

  height = 280,
  margin = { top: 10, right: 16, left: 8, bottom: 0 },

  className = "",

  stacked = false,
  vertical = true,

  barSize = 40,
  showLegend = false,

  barRadius = [10, 10, 2, 2],
  animationDuration = 700,

  barGap = 8,
  categoryGap = 14,
  barCategoryGap = 14,
}: BarChartProps) {
  const finalChartConfig: ChartConfig =
    chartConfig ||
    (Object.fromEntries(
      series.map((s) => [
        s.key,
        {
          label: s.label,
          color: s.color,
        },
      ])
    ) as ChartConfig);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const calculatedTrend = React.useMemo(() => {
    if (trend) return trend;

    if (data.length > 1 && series.length > 0) {
      const key = series[0].key;
      const firstValue = Number(data[0]?.[key]) || 0;
      const lastValue = Number(data[data.length - 1]?.[key]) || 0;

      if (firstValue > 0) {
        const v = ((lastValue - firstValue) / firstValue) * 100;
        return {
          value: v,
          label: v > 0 ? "Hausse de" : "Baisse de",
          period: `sur ${data.length} périodes`,
        };
      }
    }

    return undefined;
  }, [trend, data, series]);

  const defaultValueFormatter = (value: number) =>
    value.toLocaleString("fr-FR");

  type RectProps = React.ComponentProps<typeof Rectangle>;

  return (
    <div className={className}>
      <ChartContainer
        config={finalChartConfig}
        className={showLegend ? "h-[calc(100%-40px)]" : "h-full"}
      >
        <ResponsiveContainer width="100%" height={height}>
          {vertical ? (
            <BarChart
              data={data}
              margin={margin}
              barSize={barSize}
              barGap={barGap}
              barCategoryGap={barCategoryGap}
            >
              {showGrid && (
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 4"
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
              )}

              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={xAxisFormatter}
                style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />

              {showYAxis && (
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={yAxisFormatter}
                  style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
              )}

              <ChartTooltip
                cursor={{ fill: "var(--color-border)", opacity: 0.12 }}
                content={
                  <ChartTooltipContent
                    indicator={tooltipIndicator}
                    hideLabel={tooltipConfig.hideLabel}
                    formatter={(value, name, props) => {
                      const formatted =
                        tooltipConfig.valueFormatter?.(
                          Number(value),
                          name as string,
                          props?.payload
                        ) ?? defaultValueFormatter(Number(value));

                      const label = finalChartConfig[name]?.label || (name as string);
                      return [formatted, label];
                    }}
                    labelFormatter={
                      tooltipConfig.labelFormatter ?? ((label) => `${label}`)
                    }
                  />
                }
              />

              {showLegend && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
                />
              )}

              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId={stacked ? "stack" : s.stackId}
                  fill={s.color}
                  barSize={s.barSize}
                  radius={s.radius}
                  animationDuration={animationDuration}
                />
              ))}
            </BarChart>
          ) : (
            <BarChart
              data={data}
              margin={margin}
              layout="vertical"
              barSize={barSize}
              barGap={barGap}
              barCategoryGap={categoryGap}
            >
              {showGrid && (
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="4 4"
                  stroke="var(--color-border)"
                  opacity={0.5}
                />
              )}

              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={yAxisFormatter}
                style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />

              {showYAxis && (
                <YAxis
                  type="category"
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={xAxisFormatter}
                  style={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
              )}

              <ChartTooltip
                cursor={{ fill: "var(--color-border)", opacity: 0.12 }}
                content={
                  <ChartTooltipContent
                    indicator={tooltipIndicator}
                    hideLabel={tooltipConfig.hideLabel}
                    formatter={(value, name, props) => {
                      const formatted =
                        tooltipConfig.valueFormatter?.(
                          Number(value),
                          name as string,
                          props?.payload
                        ) ?? defaultValueFormatter(Number(value));

                      const label = finalChartConfig[name]?.label || (name as string);
                      return [formatted, label];
                    }}
                    labelFormatter={
                      tooltipConfig.labelFormatter ?? ((label) => `${label}`)
                    }
                  />
                }
              />

              {showLegend && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
                />
              )}

              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId={stacked ? "stack" : s.stackId}
                  fill={s.color}
                  barSize={s.barSize}
                  radius={s.radius}
                  animationDuration={animationDuration}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>

      {(calculatedTrend || footerContent) && (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          {calculatedTrend && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getTrendIcon(calculatedTrend.value)}
              <span>
                {calculatedTrend.label}{" "}
                <span className="font-medium text-foreground">
                  {Math.abs(calculatedTrend.value).toFixed(1)}%
                </span>{" "}
                {calculatedTrend.period}
              </span>
            </div>
          )}

          {footerContent && (
            <div className="text-sm text-muted-foreground">{footerContent}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Version simplifiée (spark bar)
interface SimpleBarChartProps {
  data: BarChartDataItem[];
  color?: string;
  height?: number;
  showValues?: boolean;
}

export function SimpleBarChart({
  data,
  color = "hsl(var(--primary))",
  height = 140,
}: SimpleBarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ChartBar
        data={data}
        series={[
          {
            key: "value",
            label: "Valeur",
            color,
          },
        ]}
        chartConfig={{
          value: { label: "Valeur", color },
        }}
        height={Math.max(120, height)}
        showGrid={false}
        showYAxis={false}
        showLegend={false}
        margin={{ top: 6, right: 8, left: 8, bottom: 0 }}
        barSize={24}
        barRadius={[8, 8, 2, 2]}
        tooltipConfig={{
          labelFormatter: (label) => label,
        }}
      />
    </div>
  );
}
