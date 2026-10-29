"use client"

import * as React from "react"
import { Clock, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { accents, type Accent } from "@/lib/accents"
import { cn } from "@/lib/utils"

export type InboxItemType = {
  /** Libellé du type, affiché en surtitre (« Besoin », « Devis »…). */
  label: string
  accent: Accent
  icon: LucideIcon
}

/**
 * Ligne de la boîte « À traiter » (Figma · InboxItem). Toute la ligne est
 * cliquable. L'action principale porte le verbe métier exact (Valider,
 * Approuver, Autoriser, Signer) ; le rejet / renvoi se fait depuis la fiche
 * via `ReasonDialog`. La teinte du type suit l'accent configuré. Pastille
 * d'âge orange au-delà de 48 h.
 */
export function InboxItem({
  type,
  reference,
  title,
  meta,
  amount,
  age,
  primaryAction,
  selectable,
  selected,
  onSelectedChange,
  onOpen,
  onPrimary,
  className,
}: {
  type: InboxItemType
  reference: string
  title: string
  meta?: string
  amount?: string
  age?: { label: string; late?: boolean }
  primaryAction?: string
  selectable?: boolean
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
  onOpen?: () => void
  onPrimary?: () => void
  className?: string
}) {
  const accent = accents[type.accent]
  const Icon = type.icon
  return (
    <div
      data-slot="inbox-item"
      data-selected={selected || undefined}
      onClick={onOpen}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border-default bg-surface px-4 py-3.5 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-sm data-selected:border-brand data-selected:bg-brand-subtle",
        onOpen && "cursor-pointer",
        className
      )}
    >
      {selectable && (
        <span onClick={(e) => e.stopPropagation()} className="flex">
          <Checkbox
            checked={selected}
            onCheckedChange={(v) => onSelectedChange?.(Boolean(v))}
            aria-label={`Sélectionner ${reference}`}
          />
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md border",
          accent.tile
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
        <p className="flex items-center gap-2 text-caption">
          <span className={cn("text-overline uppercase", accent.text)}>
            {type.label}
          </span>
          <span className="text-text-tertiary">{reference}</span>
        </p>
        <p className="truncate text-body-strong text-text-primary">{title}</p>
        {meta && <p className="text-caption text-text-tertiary">{meta}</p>}
      </div>
      {amount && (
        <p className="text-body-strong whitespace-nowrap text-text-primary">
          {amount}
        </p>
      )}
      {age && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption",
            age.late
              ? "bg-status-warning-bg text-status-warning-fg"
              : "bg-surface-muted text-text-secondary"
          )}
        >
          <Clock aria-hidden className="size-3" />
          {age.label}
        </span>
      )}
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="secondary" size="sm" onClick={onOpen}>
          Ouvrir
        </Button>
        {primaryAction && (
          <Button size="sm" onClick={onPrimary}>
            {primaryAction}
          </Button>
        )}
      </div>
    </div>
  )
}
