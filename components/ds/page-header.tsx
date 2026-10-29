import * as React from "react"
import { cn } from "@/lib/utils"

/** En-tête de page : titre, sous-titre et zone d'actions (une seule action Primary). */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-heading-2 text-text-primary sm:text-heading-1">
          {title}
        </h1>
        {description && (
          <p className="text-body-large text-text-secondary">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  )
}

/** Titre de section avec description, pour séparer les blocs d'une page. */
export function SectionHeader({
  title,
  description,
  actions,
  id,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  id?: string
  className?: string
}) {
  return (
    <div
      className={cn("flex flex-wrap items-end justify-between gap-3", className)}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 id={id} className="text-heading-2 text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="text-body text-text-tertiary">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
