"use client"

import * as React from "react"
import { Check, Info, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Barre flottante (bas de la liste) dès qu'un élément est coché — validation
 * en masse (Figma · BulkActionBar). Seule l'action « Valider » est groupable ;
 * renvoyer / rejeter exigent un motif par élément.
 */
export function BulkActionBar({
  count,
  selectedLabel,
  hint,
  confirmLabel,
  onClear,
  onCancel,
  onConfirm,
  className,
}: {
  count: number
  /** Remplace « n éléments sélectionnés » (ex. « 2 besoins sélectionnés »). */
  selectedLabel?: string
  hint?: string
  confirmLabel?: string
  onClear?: () => void
  onCancel?: () => void
  onConfirm?: () => void
  className?: string
}) {
  if (count <= 0) return null
  return (
    <div
      role="region"
      aria-label="Actions sur la sélection"
      data-slot="bulk-action-bar"
      className={cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-xl bg-inverse py-2.5 pr-2.5 pl-[18px] text-text-inverse shadow-lg",
        className
      )}
    >
      <span
        aria-hidden
        className="flex size-[18px] items-center justify-center rounded-xs bg-brand text-text-on-brand"
      >
        <Minus className="size-3.5" strokeWidth={3} />
      </span>
      <p className="text-body-strong">
        {selectedLabel ?? `${count} ${count > 1 ? "éléments sélectionnés" : "élément sélectionné"}`}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="rounded-sm text-body-medium text-brand-soft outline-none hover:underline focus-visible:shadow-focus-ring"
      >
        Tout désélectionner
      </button>
      <span className="flex-1" />
      <span className="hidden items-center gap-2 text-caption text-neutral-300 @3xl:flex">
        <Info aria-hidden className="size-4" />
        {hint ?? "Renvoi et rejet : un par un, avec motif"}
      </span>
      <Button
        className="bg-brand-vivid text-text-on-brand hover:bg-brand-vivid/85 focus-visible:shadow-focus-ring"
        onClick={onCancel}
      >
        <X />
        Annuler
      </Button>
      <Button
        className="bg-brand-vivid text-text-on-brand hover:bg-brand-vivid/85 focus-visible:shadow-focus-ring"
        onClick={onConfirm}
      >
        <Check />
        {confirmLabel ?? "Valider la sélection"} ({count})
      </Button>
    </div>
  )
}
