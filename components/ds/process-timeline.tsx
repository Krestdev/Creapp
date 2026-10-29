import * as React from "react"
import { Check, RotateCcw, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimelineState =
  | "done"
  | "current"
  | "upcoming"
  | "rejected"
  | "skipped"
  | "returned"

/**
 * Étape d'un circuit (Figma · TimelineStep). done = coche verte + auteur/date ·
 * current = marque + halo · rejected = croix rouge · skipped = étape sautée ·
 * returned = renvoyé pour correction. Masquer le connecteur sur la dernière
 * étape (`showConnector={false}`).
 */
export function TimelineStep({
  state = "done",
  step,
  meta,
  index,
  showConnector = true,
  className,
}: {
  state?: TimelineState
  step: string
  meta?: string
  /** Numéro affiché dans les états upcoming / skipped. */
  index?: number
  showConnector?: boolean
  className?: string
}) {
  const indicator = {
    done: "bg-status-success-fg",
    current: "bg-brand shadow-[0_0_0_4px_var(--color-brand-subtle-hover)]",
    upcoming: "border-[1.5px] border-border-strong bg-surface",
    rejected: "bg-status-danger-fg",
    skipped: "bg-surface-muted",
    returned: "bg-status-review-fg",
  }[state]

  const connector = {
    done: "bg-status-success-fg",
    current: "bg-border-strong",
    upcoming: "bg-border-default",
    rejected: "bg-border-strong",
    skipped: "bg-border-default",
    returned: "bg-border-strong",
  }[state]

  const title = {
    done: "text-body-medium text-text-primary",
    current: "text-body-strong text-brand",
    upcoming: "text-body-medium text-text-tertiary",
    rejected: "text-body-medium text-status-danger-fg",
    skipped: "text-body-medium text-text-disabled",
    returned: "text-body-medium text-status-review-fg",
  }[state]

  const metaClass = {
    done: "text-text-tertiary",
    current: "text-text-secondary",
    upcoming: "text-text-tertiary",
    rejected: "text-status-danger-fg",
    skipped: "text-text-tertiary",
    returned: "text-status-review-fg",
  }[state]

  return (
    <li
      data-slot="timeline-step"
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
      className={cn("flex min-w-0 flex-1 flex-col gap-2.5", className)}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "relative flex size-6 shrink-0 items-center justify-center rounded-full text-label font-semibold text-text-on-brand",
            indicator
          )}
        >
          {state === "done" && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
          {state === "rejected" && <X aria-hidden className="size-3.5" strokeWidth={3} />}
          {state === "returned" && <RotateCcw aria-hidden className="size-3.5" strokeWidth={2.5} />}
          {state === "current" && (
            <span aria-hidden className="size-2 rounded-full bg-surface" />
          )}
          {state === "upcoming" && (
            <span className="text-text-tertiary">{index}</span>
          )}
          {state === "skipped" && (
            <span className="text-text-disabled">{index}</span>
          )}
        </span>
        {showConnector && (
          <span
            aria-hidden
            className={cn("h-0.5 flex-1 rounded-[1px]", connector)}
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 pr-3">
        <p className={cn("truncate", title)}>{step}</p>
        {meta && <p className={cn("text-caption", metaClass)}>{meta}</p>}
      </div>
    </li>
  )
}

export type ProcessStep = {
  step: string
  meta?: string
  state: TimelineState
}

/**
 * Frise des étapes d'un objet (Figma · ProcessTimeline), figée à la
 * soumission. Les étapes viennent du type d'objet.
 */
export function ProcessTimeline({
  title,
  caption,
  badge,
  steps,
  className,
}: {
  title?: string
  caption?: string
  /** Souvent un `StatusBadge`. */
  badge?: React.ReactNode
  steps: ProcessStep[]
  className?: string
}) {
  return (
    <section
      data-slot="process-timeline"
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border-default bg-surface px-6 py-5",
        className
      )}
    >
      <header className="flex items-center gap-3">
        <h3 className="flex-1 text-title text-text-primary">
          {title ?? "Circuit de validation"}
        </h3>
        {caption && <p className="text-caption text-text-tertiary">{caption}</p>}
        {badge}
      </header>
      <ol className="flex w-full items-start overflow-x-auto">
        {steps.map((s, i) => (
          <TimelineStep
            key={`${s.step}-${i}`}
            {...s}
            index={i + 1}
            showConnector={i < steps.length - 1}
            className="min-w-36"
          />
        ))}
      </ol>
    </section>
  )
}
