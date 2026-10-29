import * as React from "react"
import { cn } from "@/lib/utils"

/** État vide d'une liste ou d'un tableau : une phrase utile et, si possible, une action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface-muted px-6 py-10 text-center",
        className
      )}
    >
      {icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-surface text-brand [&_svg]:size-6">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-title text-text-primary">{title}</p>
        {description && (
          <p className="max-w-sm text-body text-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
