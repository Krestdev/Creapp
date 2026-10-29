"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"
import { CircleCheck, CircleX, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

const tones = {
  success: { icon: CircleCheck, iconClass: "text-accent-green" },
  info: { icon: Info, iconClass: "text-accent-blue" },
  danger: { icon: CircleX, iconClass: "text-accent-red" },
} as const

export type ToastTone = keyof typeof tones

/**
 * Retour immédiat après une action (Figma · Toast) : fond sombre pour
 * contraster sur toutes les surfaces, action courte facultative (« Voir »),
 * lu par les lecteurs d'écran (role=status).
 */
export function Toast({
  tone = "success",
  title,
  description,
  action,
  onAction,
  onClose,
  className,
}: {
  tone?: ToastTone
  title: string
  description?: string
  action?: string
  onAction?: () => void
  onClose?: () => void
  className?: string
}) {
  const { icon: Icon, iconClass } = tones[tone]
  return (
    <div
      role="status"
      data-slot="toast"
      className={cn(
        "flex w-full max-w-130 items-center gap-3 rounded-lg bg-inverse py-2.5 pr-2 pl-4 shadow-lg",
        className
      )}
    >
      <Icon aria-hidden className={cn("size-5 shrink-0", iconClass)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-body-strong text-text-inverse">{title}</p>
        {description && (
          <p className="text-caption text-neutral-300">{description}</p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md px-2.5 py-1.5 text-body-strong whitespace-nowrap text-brand-soft outline-none hover:bg-white/10 focus-visible:shadow-focus-ring"
        >
          {action}
        </button>
      )}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="rounded-md p-1.5 text-neutral-300 outline-none hover:bg-white/10 focus-visible:shadow-focus-ring"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

/** Affiche un toast DS : `notify({ tone: "success", title: "BES-… validé" })`. */
export function notify({
  tone = "success",
  title,
  description,
  action,
  onAction,
}: {
  tone?: ToastTone
  title: string
  description?: string
  action?: string
  onAction?: () => void
}) {
  return sonnerToast.custom(
    (id) => (
      <Toast
        tone={tone}
        title={title}
        description={description}
        action={action}
        onAction={() => {
          onAction?.()
          sonnerToast.dismiss(id)
        }}
        onClose={() => sonnerToast.dismiss(id)}
      />
    ),
    { duration: 6000 }
  )
}
