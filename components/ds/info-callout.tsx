import * as React from "react"
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

const tones = {
  info: {
    icon: Info,
    className: "border-status-info-border bg-status-info-bg text-status-info-fg",
  },
  warning: {
    icon: TriangleAlert,
    className:
      "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  },
  success: {
    icon: CircleCheck,
    className:
      "border-status-success-border bg-status-success-bg text-status-success-fg",
  },
  danger: {
    icon: CircleX,
    className:
      "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
  },
} as const

/**
 * Message contextuel dans un formulaire ou une fiche (Figma · InfoCallout).
 * Toujours icône + texte, le ton suit le statut.
 */
export function InfoCallout({
  tone = "info",
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: keyof typeof tones }) {
  const { icon: Icon, className: toneClass } = tones[tone]
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      data-slot="info-callout"
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-body",
        toneClass,
        className
      )}
      {...props}
    >
      <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  )
}
