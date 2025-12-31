"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

/**
 * ⚠️ Données FIXES : exactement 7 jours
 * ➜ Pas de filtre
 * ➜ Pas de state
 * ➜ Pas de Date.now()
 */
const chartData = [
  { date: "2024-06-24", approuvé: 5, rejetté: 2 },
  { date: "2024-06-25", approuvé: 8, rejetté: 0 },
  { date: "2024-06-26", approuvé: 6, rejetté: 3 },
  { date: "2024-06-27", approuvé: 3, rejetté: 0 },
  { date: "2024-06-28", approuvé: 0, rejetté: 0 },
  { date: "2024-06-29", approuvé: 6, rejetté: 1 },
  { date: "2024-06-30", approuvé: 0, rejetté: 0 },
]

const chartConfig = {
  approuvé: {
    label: "Approuvé",
    color: "var(--chart-2)",
  },
  rejetté: {
    label: "Rejeté",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  return (
    <Card className="pt-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Mes besoins</CardTitle>
        <CardDescription>
          Consulter mes besoins des 7 derniers jours
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            {/* Dégradés */}
            <defs>
              <linearGradient id="fillApprouve" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-approuvé)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-approuvé)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillRejete" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rejetté)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-rejetté)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            {/* Axe X */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                })
              }
            />

            {/* Tooltip */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
              }
            />

            {/* Zones */}
            <Area
              type="natural"
              dataKey="rejetté"
              stackId="a"
              stroke="var(--color-rejetté)"
              fill="url(#fillRejete)"
            />

            <Area
              type="natural"
              dataKey="approuvé"
              stackId="a"
              stroke="var(--color-approuvé)"
              fill="url(#fillApprouve)"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
