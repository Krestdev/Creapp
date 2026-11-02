import * as React from "react"
import {
  ChevronRight,
  CircleCheck,
  CircleDot,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tones = {
  default: {
    card: "border-border-default bg-surface",
    label: "text-text-secondary",
    value: "text-text-primary",
    delta: "text-text-tertiary",
    icon: CircleDot,
    iconClass: "text-text-secondary",
  },
  alert: {
    card: "border-status-danger-border bg-status-danger-bg",
    label: "text-status-danger-fg",
    value: "text-status-danger-fg",
    delta: "text-status-danger-fg",
    icon: TriangleAlert,
    iconClass: "text-status-danger-fg",
  },
  good: {
    card: "border-border-default bg-surface",
    label: "text-text-secondary",
    value: "text-status-success-fg",
    delta: "text-text-tertiary",
    icon: CircleCheck,
    iconClass: "text-status-success-fg",
  },
} as const

export type StatCardTone = keyof typeof tones

/**
 * Carte d'indicateur (Figma · StatCard). Cliquable : ouvre la liste filtrée
 * (passer `href` ou `onClick`). `alert` = valeur > 0 ET critique uniquement ;
 * `good` = état vide positif (« ✓ Aucun retard ») ; jamais de rouge à zéro.
 *
 * La valeur passe de 24 à 40 px selon la largeur d'écran et reste lisible
 * quand elle est longue (montants) : elle retourne à la ligne au lieu d'être
 * rognée.
 */
export function StatCard({
  label,
  value,
  delta,
  tone = "default",
  icon,
  href,
  onClick,
  className,
  valueClassName,
  deltaClassName,
}: {
  label: string
  value: React.ReactNode
  delta?: React.ReactNode
  tone?: StatCardTone
  /** Remplace l'icône du ton (circle-dot / triangle-alert / circle-check). */
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  className?: string
  valueClassName?: string
  deltaClassName?: string
}) {
  const t = tones[tone]
  const Icon = icon ?? t.icon
  const interactive = Boolean(href || onClick)
  const Comp = href ? "a" : onClick ? "button" : "div"
  return (
    <Comp
      {...(href ? { href } : {})}
      {...(onClick ? { onClick, type: "button" as const } : {})}
      data-slot="stat-card"
      data-tone={tone}
      className={cn(
        "flex w-full min-w-0 flex-col items-start gap-1.5 rounded-xl border px-[18px] py-4 text-left outline-none",
        t.card,
        interactive &&
          "cursor-pointer transition-shadow hover:shadow-md focus-visible:shadow-focus-ring",
        className
      )}
    >
      <span className="flex w-full items-center gap-2">
        <span className={cn("min-w-0 flex-1 text-body-medium", t.label)}>
          {label}
        </span>
        <Icon aria-hidden className={cn("size-[18px] shrink-0", t.iconClass)} />
      </span>
      <span
        className={cn(
          "w-full min-w-0 text-heading-2 [overflow-wrap:anywhere] sm:text-heading-1",
          t.value,
          valueClassName
        )}
      >
        {value}
      </span>
      {delta && (
        <span className={cn("flex w-full items-center gap-1.5", deltaClassName)}>
          <span className={cn("min-w-0 flex-1 text-caption", t.delta)}>
            {delta}
          </span>
          {interactive && (
            <ChevronRight
              aria-hidden
              className="size-3.5 shrink-0 text-text-tertiary"
            />
          )}
        </span>
      )}
    </Comp>
  )
}
