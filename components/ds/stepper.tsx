import * as React from "react"
import { Check, Circle, CircleCheck, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"

export type StepperStep = { label: string; description?: string }

/**
 * Stepper de formulaire / assistant (« Créer un besoin » en 4 étapes…).
 * `current` est l'index (0-based) de l'étape en cours ; les précédentes sont
 * terminées. Pour un circuit de validation avec auteurs et dates, utiliser
 * `ProcessTimeline`.
 */
export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className,
}: {
  steps: StepperStep[]
  current: number
  orientation?: "horizontal" | "vertical"
  className?: string
}) {
  const horizontal = orientation === "horizontal"
  return (
    <ol
      data-slot="stepper"
      className={cn(
        "flex",
        horizontal ? "items-start" : "flex-col gap-0",
        className
      )}
    >
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming"
        const last = i === steps.length - 1
        return (
          <li
            key={step.label}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex",
              horizontal ? "min-w-0 flex-1 flex-col gap-2.5" : "gap-3"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2",
                !horizontal && "flex-col"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-label font-semibold transition-colors",
                  state === "done" && "bg-brand text-text-on-brand",
                  state === "current" &&
                    "border-[1.5px] border-brand bg-brand-subtle text-brand shadow-[0_0_0_4px_var(--color-brand-subtle-hover)]",
                  state === "upcoming" &&
                    "border-[1.5px] border-border-strong bg-surface text-text-tertiary"
                )}
              >
                {state === "done" ? (
                  <Check aria-hidden className="size-4" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </span>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    "rounded-[1px] transition-colors",
                    horizontal ? "h-0.5 flex-1" : "min-h-8 w-0.5 flex-1",
                    i < current ? "bg-brand" : "bg-border-default"
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                horizontal ? "pr-3" : "pb-6"
              )}
            >
              <p
                className={cn(
                  state === "current"
                    ? "text-body-strong text-brand"
                    : state === "done"
                      ? "text-body-medium text-text-primary"
                      : "text-body-medium text-text-tertiary"
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-caption text-text-tertiary">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export type ChecklistState = "done" | "current" | "todo"

/** Ligne de liste de tâches / didacticiel (Figma · TutorialStep). */
export function ChecklistItem({
  state = "todo",
  children,
  className,
}: {
  state?: ChecklistState
  children: React.ReactNode
  className?: string
}) {
  return (
    <li
      data-state={state}
      className={cn("flex items-center gap-2.5 py-0.5 text-body", className)}
    >
      {state === "done" ? (
        <CircleCheck aria-hidden className="size-[18px] shrink-0 text-status-success-fg" />
      ) : state === "current" ? (
        <CircleDot aria-hidden className="size-[18px] shrink-0 text-brand" />
      ) : (
        <Circle aria-hidden className="size-[18px] shrink-0 text-border-strong" />
      )}
      <span
        className={cn(
          state === "done" && "text-text-tertiary line-through",
          state === "current" && "text-body-strong text-brand",
          state === "todo" && "text-text-secondary"
        )}
      >
        {children}
      </span>
    </li>
  )
}
