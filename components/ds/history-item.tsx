import * as React from "react"
import {
  CircleCheck,
  CircleDot,
  CircleX,
  RotateCcw,
  UserCheck,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const types = {
  submitted: {
    icon: CircleDot,
    className: "border-status-info-border bg-status-info-bg text-status-info-fg",
  },
  validated: {
    icon: CircleCheck,
    className:
      "border-status-success-border bg-status-success-bg text-status-success-fg",
  },
  returned: {
    icon: RotateCcw,
    className:
      "border-status-review-border bg-status-review-bg text-status-review-fg",
  },
  rejected: {
    icon: CircleX,
    className:
      "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
  },
  onBehalf: {
    icon: UserCheck,
    className:
      "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
  },
} satisfies Record<string, { icon: LucideIcon; className: string }>

export type HistoryType = keyof typeof types

/**
 * Entrée d'historique (Figma · HistoryItem) : auteur, action, « pour le
 * compte de », date/heure, commentaire. Masquer la ligne sur la dernière
 * entrée (`showLine={false}`).
 */
export function HistoryItem({
  type = "submitted",
  title,
  date,
  comment,
  showLine = true,
  className,
}: {
  type?: HistoryType
  title: React.ReactNode
  date: string
  comment?: string
  showLine?: boolean
  className?: string
}) {
  const { icon: Icon, className: toneClass } = types[type]
  return (
    <li data-slot="history-item" data-type={type} className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center gap-1">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border",
            toneClass
          )}
        >
          <Icon aria-hidden className="size-4" />
        </span>
        {showLine && (
          <span aria-hidden className="w-[1.5px] flex-1 bg-border-default" />
        )}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1", showLine && "pb-4")}>
        <p className="text-body-medium text-text-primary">{title}</p>
        <p className="text-caption text-text-tertiary">{date}</p>
        {comment && (
          <p className="rounded-md bg-surface-muted px-2.5 py-1.5 text-body text-text-secondary">
            {comment}
          </p>
        )}
      </div>
    </li>
  )
}

export function HistoryList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return <ol className={cn("flex flex-col", className)} {...props} />
}
