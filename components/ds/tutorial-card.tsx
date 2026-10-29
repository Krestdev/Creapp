"use client"

import * as React from "react"
import { Check, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type TutorialStepState = "done" | "current" | "todo"
export type TutorialStepItem = { label: string; state: TutorialStepState }

function TutorialStep({
  index,
  label,
  state,
}: {
  index: number
  label: string
  state: TutorialStepState
}) {
  return (
    <li
      data-state={state}
      aria-current={state === "current" ? "step" : undefined}
      className="flex items-center gap-2.5"
    >
      <span
        className={cn(
          "flex size-[22px] shrink-0 items-center justify-center rounded-full text-overline tracking-normal",
          state === "done" && "bg-status-success-fg text-text-on-brand",
          state === "current" && "bg-brand text-text-on-brand",
          state === "todo" && "bg-surface-muted text-text-tertiary"
        )}
      >
        {state === "done" ? (
          <Check aria-hidden className="size-3.5" strokeWidth={3} />
        ) : (
          index
        )}
      </span>
      <span
        className={cn(
          "flex-1 text-body",
          state === "done" && "text-text-primary",
          state === "current" && "text-body-strong text-text-primary",
          state === "todo" && "text-text-tertiary"
        )}
      >
        {label}
      </span>
    </li>
  )
}

/**
 * Tutoriel CONTEXTUEL (Figma · TutorialCard, format Steps) : chaque page
 * déclare son propre contenu, lié à la tâche en cours ; l'étape courante suit
 * l'écran. Masquable (croix) ; doit réapparaître depuis « Centre d'aide ».
 */
export function TutorialCard({
  eyebrow,
  title,
  steps,
  linkLabel,
  onLink,
  onDismiss,
  className,
}: {
  eyebrow?: string
  title: string
  steps: TutorialStepItem[]
  linkLabel?: string
  onLink?: () => void
  onDismiss?: () => void
  className?: string
}) {
  const [visible, setVisible] = React.useState(true)
  if (!visible) return null
  return (
    <section
      data-slot="tutorial-card"
      aria-label={title}
      className={cn(
        "flex flex-col gap-3.5 rounded-[28px] border border-border-default bg-surface-muted bg-gradient-glass px-5 py-[18px] shadow-sm",
        className
      )}
    >
      <header className="flex items-center gap-2">
        <p className="flex-1 text-overline text-brand uppercase">{eyebrow ?? "Bienvenue sur CreApp V2"}</p>
        <button
          type="button"
          aria-label="Masquer le tutoriel"
          onClick={() => {
            setVisible(false)
            onDismiss?.()
          }}
          className="flex size-6 items-center justify-center rounded-sm text-text-tertiary outline-none hover:text-text-primary focus-visible:shadow-focus-ring"
        >
          <X className="size-4" />
        </button>
      </header>
      <h2 className="text-heading-3 text-text-primary">{title}</h2>
      <ol className="flex flex-col gap-2.5">
        {steps.map((s, i) => (
          <TutorialStep key={s.label} index={i + 1} {...s} />
        ))}
      </ol>
      <button
        type="button"
        onClick={onLink}
        className="flex w-fit items-center gap-1 rounded-sm text-body-medium text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
      >
        {linkLabel ?? "Tous les tutoriels"}
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </section>
  )
}
