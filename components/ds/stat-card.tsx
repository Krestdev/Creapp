import * as React from "react"
import { ChevronRight, CircleCheck, CircleDot, TriangleAlert } from "lucide-react"
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

/**
 * Carte d'indicateur (Figma · StatCard). Cliquable : ouvre la liste filtrée
 * (passer `href` ou `onClick`). `alert` = valeur > 0 ET critique uniquement ;
 * `good` = état vide positif (« ✓ Aucun retard ») ; jamais de rouge à zéro.
 */
export function StatCard({
  label,
  value,
  delta,
  tone = "default",
  href,
  onClick,
  className,
}: {
  label: string
  value: React.ReactNode
  delta?: string
  tone?: keyof typeof tones
  href?: string
  onClick?: () => void
  className?: string
}) {
  const t = tones[tone]
  const Icon = t.icon
  const interactive = Boolean(href || onClick)
  const Comp = href ? "a" : onClick ? "button" : "div"
  return (
    <Comp
      {...(href ? { href } : {})}
      {...(onClick ? { onClick, type: "button" as const } : {})}
      data-slot="stat-card"
      data-tone={tone}
      className={cn(
        "flex w-full flex-col items-start gap-1.5 rounded-xl border px-[18px] py-4 text-left outline-none",
        t.card,
        interactive &&
          "transition-shadow hover:shadow-md focus-visible:shadow-focus-ring",
        className
      )}
    >
      <span className="flex w-full items-center gap-2">
        <span className={cn("flex-1 text-body-medium", t.label)}>{label}</span>
        <Icon aria-hidden className={cn("size-[18px] shrink-0", t.iconClass)} />
      </span>
      <span className={cn("text-heading-1", t.value)}>{value}</span>
      {delta && (
        <span className="flex w-full items-center gap-1.5">
          <span className={cn("flex-1 text-caption", t.delta)}>{delta}</span>
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
