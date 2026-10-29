import * as React from "react"
import { ChevronRight, CircleCheck, CircleDot, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export type StageState = "done" | "current" | "partial" | "upcoming"

const stateStyles = {
  done: {
    box: "border border-status-success-border bg-status-success-bg",
    icon: CircleCheck,
    iconClass: "text-status-success-fg",
    title: "text-body-medium text-text-primary",
    ref: "text-text-tertiary",
  },
  current: {
    box: "border-[1.5px] border-brand bg-brand-subtle",
    icon: CircleDot,
    iconClass: "text-brand",
    title: "text-body-strong text-brand",
    ref: "text-text-tertiary",
  },
  partial: {
    box: "border border-status-warning-border bg-status-warning-bg",
    icon: Clock,
    iconClass: "text-status-warning-fg",
    title: "text-body-medium text-text-primary",
    ref: "text-text-tertiary",
  },
  upcoming: {
    box: "border border-border-default bg-surface",
    icon: CircleDot,
    iconClass: "text-text-disabled",
    title: "text-body-medium text-text-tertiary",
    ref: "text-text-disabled",
  },
} as const

/**
 * Étape du suivi de bout en bout (Figma · P2PStage). `partial` = réception ou
 * paiement partiel.
 */
export function ProcessStage({
  state = "done",
  stage,
  reference,
  className,
}: {
  state?: StageState
  stage: string
  reference?: string
  className?: string
}) {
  const s = stateStyles[state]
  const Icon = s.icon
  return (
    <div
      data-slot="process-stage"
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
      className={cn(
        "flex min-w-40 items-center gap-2.5 rounded-lg py-2 pr-3 pl-2.5",
        s.box,
        className
      )}
    >
      <Icon aria-hidden className={cn("size-4 shrink-0", s.iconClass)} />
      <div className="flex min-w-0 flex-col">
        <p className={cn("truncate", s.title)}>{stage}</p>
        <p className={cn("truncate text-caption", s.ref)}>
          {reference ?? "—"}
        </p>
      </div>
    </div>
  )
}

export type TrackerStage = {
  stage: string
  reference?: string
  state: StageState
}

/**
 * Suivi d'un dossier de bout en bout (Figma · ProcurementTracker) : une
 * rangée d'étapes reliées, chacune avec la référence du document produit.
 */
export function ProcessTracker({
  title,
  stages,
  className,
}: {
  title?: string
  stages: TrackerStage[]
  className?: string
}) {
  return (
    <section
      data-slot="process-tracker"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border-default bg-surface px-6 py-5",
        className
      )}
    >
      <h3 className="text-title text-text-primary">{title ?? "Suivi du dossier"}</h3>
      <ol className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((s, i) => (
          <li key={s.stage} className="flex items-center gap-2">
            <ProcessStage {...s} />
            {i < stages.length - 1 && (
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-text-disabled"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
