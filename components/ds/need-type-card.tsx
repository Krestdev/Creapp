"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { accents, type Accent } from "@/lib/accents"
import { cn } from "@/lib/utils"

/**
 * Carte de type (Figma · NeedTypeCard), étape 1 de « Créer un besoin ».
 * L'accent est la teinte choisie dans les paramètres : elle suit le type
 * partout (cartes, badges, InboxItem). Le pied affiche le circuit du type.
 */
export function NeedTypeCard({
  accent,
  icon: Icon,
  title,
  description,
  flow,
  selected,
  onSelect,
  className,
}: {
  accent: Accent
  icon: LucideIcon
  title: string
  description: string
  flow?: string
  selected?: boolean
  onSelect?: () => void
  className?: string
}) {
  const a = accents[accent]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      data-slot="need-type-card"
      data-selected={selected || undefined}
      className={cn(
        "flex w-full flex-col items-start gap-4 rounded-2xl border px-5 pt-5 pb-4 text-left transition-shadow outline-none hover:shadow-md focus-visible:shadow-focus-ring data-selected:ring-2",
        a.card,
        a.ring,
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-12 items-center justify-center rounded-lg border bg-surface",
          a.border,
          a.text
        )}
      >
        <Icon className="size-6" />
      </span>
      <span className="flex flex-col gap-1.5">
        <span className={cn("text-heading-3", a.text)}>{title}</span>
        <span className="text-body text-text-secondary">{description}</span>
      </span>
      {flow && (
        <span
          className={cn(
            "flex w-full items-center gap-1.5 border-t pt-3 text-caption text-text-tertiary",
            a.border
          )}
        >
          <ChevronRight aria-hidden className="size-3.5 shrink-0" />
          {flow}
        </span>
      )}
    </button>
  )
}
