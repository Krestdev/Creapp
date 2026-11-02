import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const icons = {
  bank: "bg-accent-blue-bg text-accent-blue-fg",
  cash: "bg-accent-green-bg text-accent-green-fg",
} as const

/**
 * Solde d'un compte ou d'une caisse (Figma · AccountBalance) : disponible,
 * barre disponible / réservé, puis solde et réservé. Cliquable (`onClick`) :
 * ouvre la fiche du compte. `warning` signale un solde insuffisant (valeur et
 * barre en orange, contour orangé). `menu` se pose en haut à droite, hors du
 * bouton principal.
 */
export function AccountBalance({
  icon: Icon,
  kind = "bank",
  name,
  subtitle,
  available,
  balance,
  reserved,
  warning,
  muted,
  badge,
  onClick,
  menu,
  className,
}: {
  icon: LucideIcon
  kind?: keyof typeof icons
  name: React.ReactNode
  subtitle?: React.ReactNode
  /** Montant utilisable (solde moins réservé). */
  available: number
  /** Solde réel (disponible + réservé). */
  balance: number
  reserved: number
  warning?: boolean
  /** Compte désactivé : atténué. */
  muted?: boolean
  badge?: React.ReactNode
  onClick?: () => void
  menu?: React.ReactNode
  className?: string
}) {
  const total = Math.max(available, 0) + Math.max(reserved, 0)
  const reservedShare = total > 0 ? (Math.max(reserved, 0) / total) * 100 : 0
  const body = (
    <>
      <span className={cn("flex w-full items-center gap-2.5", menu && "pr-7")}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            icons[kind]
          )}
        >
          <Icon aria-hidden className="size-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-strong text-text-primary">
            {name}
          </span>
          {subtitle && (
            <span className="truncate text-caption text-text-tertiary">
              {subtitle}
            </span>
          )}
        </span>
        {badge}
      </span>
      <span
        className={cn(
          "text-heading-2",
          warning ? "text-status-warning-fg" : "text-text-primary"
        )}
      >
        {formatNumber(available)}
      </span>
      <span className="-mt-1.5 text-caption text-text-tertiary">
        {"Disponible (XAF)"}
      </span>
      <span
        aria-hidden
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <span
          className={cn(
            "h-full",
            warning ? "bg-accent-orange" : "bg-accent-green"
          )}
          style={{ width: `${100 - reservedShare}%` }}
        />
        {reservedShare > 0 && (
          <span
            className="h-full bg-accent-orange"
            style={{ width: `${reservedShare}%` }}
          />
        )}
      </span>
      <span className="flex w-full gap-3">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-caption text-text-tertiary">{"Solde"}</span>
          <span className="text-body-medium text-text-primary">
            {formatNumber(balance)}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-caption text-text-tertiary">{"Réservé"}</span>
          <span className="text-body-medium text-status-warning-fg">
            {formatNumber(reserved)}
          </span>
        </span>
      </span>
    </>
  )
  const cardClass = cn(
    "flex w-full min-w-0 flex-col items-start gap-2.5 rounded-xl border bg-surface px-[18px] py-4 text-left",
    warning ? "border-status-warning-border" : "border-border-default",
    muted && "opacity-70"
  )
  return (
    <div
      data-slot="account-balance"
      className={cn("relative", className)}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            cardClass,
            "cursor-pointer outline-none transition-shadow hover:shadow-md focus-visible:shadow-focus-ring"
          )}
        >
          {body}
        </button>
      ) : (
        <div className={cardClass}>{body}</div>
      )}
      {menu && <div className="absolute top-3 right-3">{menu}</div>}
    </div>
  )
}
