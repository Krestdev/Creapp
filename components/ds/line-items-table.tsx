"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type LineItem = {
  id: string
  designation: string
  quantity: string
  unit: string | null
}

/** Unités proposées par défaut. */
const defaultUnitValues = ["piece", "kg", "m", "lot", "h"] as const

const unitLabels: Record<(typeof defaultUnitValues)[number], string> = {
  piece: "Pièce",
  kg: "Kilogramme",
  m: "Mètre",
  lot: "Lot",
  h: "Heure",
}

let counter = 0
const newLine = (): LineItem => ({
  id: `line-${++counter}`,
  designation: "",
  quantity: "",
  unit: null,
})

/**
 * Lignes d'article (Figma · LineItemsTable : désignation, quantité, unité).
 * Une ligne vide est toujours proposée en fin de tableau : elle se recrée
 * dès que la dernière est remplie.
 */
export function LineItemsTable({
  defaultValue,
  units,
  onChange,
}: {
  defaultValue?: Omit<LineItem, "id">[]
  units?: { value: string; label: string }[]
  onChange?: (items: LineItem[]) => void
}) {
  const unitOptions =
    units ??
    defaultUnitValues.map((v) => ({ value: v, label: unitLabels[v] }))
  const [items, setItems] = React.useState<LineItem[]>(() => [
    ...(defaultValue ?? []).map((l) => ({ ...newLine(), ...l })),
    newLine(),
  ])

  function update(next: LineItem[]) {
    setItems(next)
    onChange?.(next.filter((l) => l.designation.trim()))
  }

  function patch(id: string, values: Partial<LineItem>) {
    const next = items.map((l) => (l.id === id ? { ...l, ...values } : l))
    // Toujours garder une ligne vide en fin de tableau.
    const last = next[next.length - 1]
    update(last.designation.trim() ? [...next, newLine()] : next)
  }

  function remove(id: string) {
    const next = items.filter((l) => l.id !== id)
    update(next.length ? next : [newLine()])
  }

  return (
    <div
      data-slot="line-items-table"
      className="overflow-hidden rounded-lg border border-border-default bg-surface"
    >
      <div className="flex items-center gap-3 bg-surface-muted py-2 pr-2 pl-3 text-label text-text-tertiary">
        <span className="w-6 shrink-0">#</span>
        <span className="min-w-0 flex-1">Désignation</span>
        <span className="w-24 shrink-0 sm:w-30">Quantité</span>
        <span className="hidden w-35 shrink-0 sm:block">Unité</span>
        <span className="w-8 shrink-0" />
      </div>
      {items.map((line, i) => (
        <div
          key={line.id}
          className="flex items-center gap-3 border-t border-border-default py-2 pr-2 pl-3"
        >
          <span className="w-6 shrink-0 text-body text-text-tertiary">
            {i + 1}
          </span>
          <Input
            aria-label={`Désignation, ligne ${i + 1}`}
            placeholder="Ex. : Chaise de bureau ergonomique"
            value={line.designation}
            onChange={(e) => patch(line.id, { designation: e.target.value })}
            className="min-w-0 flex-1"
          />
          <Input
            aria-label={`Quantité, ligne ${i + 1}`}
            inputMode="decimal"
            placeholder="0"
            value={line.quantity}
            onChange={(e) => patch(line.id, { quantity: e.target.value })}
            className="w-24 shrink-0 sm:w-30"
          />
          <div className="hidden w-35 shrink-0 sm:block">
            <Select
              value={line.unit ?? undefined}
              onValueChange={(v) => patch(line.id, { unit: v })}
            >
              <SelectTrigger
                className="w-full"
                aria-label={`Unité, ligne ${i + 1}`}
              >
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Retirer la ligne ${i + 1}`}
            className="w-8 shrink-0 text-text-tertiary hover:bg-hover"
            onClick={() => remove(line.id)}
          >
            <X />
          </Button>
        </div>
      ))}
      <div className="border-t border-border-default py-1.5 pl-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update([...items, newLine()])}
        >
          <Plus />
          Ajouter une ligne
        </Button>
      </div>
    </div>
  )
}
