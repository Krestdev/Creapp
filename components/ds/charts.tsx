"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFormat } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Graphiques du DS (recharts via `ui/chart`). Les couleurs viennent des
 * tokens : marque (`--color-brand`, suit le module), statuts et accents. Ne
 * jamais coder une couleur en dur dans un graphique.
 */

/** Carte-conteneur d'un graphique : titre, description, action, contenu. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      data-slot="chart-card"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border-default bg-surface p-5",
        className
      )}
    >
      <header className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-title text-text-primary">{title}</h3>
          {description && (
            <p className="text-caption text-text-tertiary">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

const axisTick = { fontSize: 12, fill: "var(--color-text-tertiary)" }

/** Barres groupées : soumis vs validés par période. */
export function GroupedBarChart({
  data,
  xKey,
  series,
  className,
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: { key: string; label: string; color: string }[]
  className?: string
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  ) satisfies ChartConfig
  return (
    <ChartContainer config={config} className={cn("aspect-auto h-64 w-full", className)}>
      <BarChart data={data} barCategoryGap="28%" margin={{ left: -16, right: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-default)" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tick={axisTick} />
        <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={axisTick} width={44} />
        <ChartTooltip cursor={{ fill: "var(--color-surface-muted)" }} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={`var(--color-${s.key})`} radius={[6, 6, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

/** Aire lissée : une ou plusieurs séries dans le temps. */
export function TrendAreaChart({
  data,
  xKey,
  series,
  className,
}: {
  data: Record<string, string | number>[]
  xKey: string
  series: { key: string; label: string; color: string }[]
  className?: string
}) {
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }])
  ) satisfies ChartConfig
  const uid = React.useId().replace(/:/g, "")
  return (
    <ChartContainer config={config} className={cn("aspect-auto h-64 w-full", className)}>
      <AreaChart data={data} margin={{ left: -16, right: 4 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--color-${s.key})`} stopOpacity={0.28} />
              <stop offset="100%" stopColor={`var(--color-${s.key})`} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border-default)" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tick={axisTick} />
        <YAxis tickLine={false} axisLine={false} tickMargin={4} tick={axisTick} width={44} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            fill={`url(#${uid}-${s.key})`}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  )
}

export type DonutSlice = { key: string; label: string; value: number; color: string }

/** Anneau avec total au centre et légende chiffrée. */
export function DonutChart({
  slices,
  totalLabel = "Total",
  className,
}: {
  slices: DonutSlice[]
  totalLabel?: string
  className?: string
}) {
  const config = Object.fromEntries(
    slices.map((s) => [s.key, { label: s.label, color: s.color }])
  ) satisfies ChartConfig
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <ChartContainer config={config} className="aspect-square h-44">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="key"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={2}
              strokeWidth={0}
              cornerRadius={4}
            >
              {slices.map((s) => (
                <Cell key={s.key} fill={`var(--color-${s.key})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-heading-2 text-text-primary">{total}</span>
          <span className="text-caption text-text-tertiary">{totalLabel}</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-1 gap-1.5">
        {slices.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-body">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-text-secondary">{s.label}</span>
            <span className="text-body-strong text-text-primary tabular-nums">
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Consommation par catégorie : barres horizontales avec seuils d'alerte. */
export function BudgetBars({
  items,
  className,
}: {
  items: { label: string; used: number; total: number; format?: (n: number) => string }[]
  className?: string
}) {
  const { number } = useFormat()
  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {items.map((item) => {
        const ratio = item.total > 0 ? item.used / item.total : 0
        const tone =
          ratio >= 1
            ? "bg-status-danger-fg"
            : ratio >= 0.8
              ? "bg-status-warning-fg"
              : "bg-brand"
        const fmt = item.format ?? number
        return (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 text-body">
              <span className="flex-1 text-text-primary">{item.label}</span>
              <span className="text-caption text-text-tertiary tabular-nums">
                {fmt(item.used)} / {fmt(item.total)}
              </span>
              <span className="w-10 text-right text-body-strong text-text-primary tabular-nums">
                {Math.round(ratio * 100)} %
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={item.label}
              aria-valuenow={Math.round(ratio * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
            >
              <div
                className={cn("h-full rounded-full transition-all", tone)}
                style={{ width: `${Math.min(ratio, 1) * 100}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
