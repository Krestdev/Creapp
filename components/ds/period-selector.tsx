"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

/** Valeurs des périodes proposées par défaut. */
export const defaultPeriodValues = ["today", "7d", "30d", "month"] as const

const periodLabels: Record<(typeof defaultPeriodValues)[number], string> = {
  today: "Aujourd’hui",
  "7d": "7 jours",
  "30d": "30 jours",
  month: "Ce mois",
}

/**
 * Sélecteur de période global (Figma · PeriodSelector) : s'applique à toutes
 * les cartes de l'Accueil en même temps.
 */
export function PeriodSelector({
  periods,
  value,
  defaultValue = "7d",
  onValueChange,
}: {
  periods?: { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const items =
    periods ?? defaultPeriodValues.map((v) => ({ value: v, label: periodLabels[v] }))
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as string)}
    >
      <TabsList variant="segmented" aria-label="Période">
        {items.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
