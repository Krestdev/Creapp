import * as React from "react"
import {
  Circle,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock,
  FileText,
  RotateCcw,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Statut d'un objet métier (Figma · StatusBadge). Toujours icône + libellé
 * (WCAG 1.4.1) : ne jamais signifier un statut par la couleur seule. Un
 * libellé par défaut est fourni pour chaque ton ; passer `children` pour un
 * libellé métier précis.
 *
 * Mapping métier : success = Approuvé / Payé / Réceptionné · warning = En
 * attente du chef de service · info = En validation (niveau n/3) · review =
 * En correction · danger = Rejeté / Annulé / Stoppé · neutral = Brouillon /
 * Clôturé · urgent / normal = priorité.
 */
const tones = {
  success: {
    icon: CircleCheck,
    className:
      "border-status-success-border bg-status-success-bg text-status-success-fg",
  },
  warning: {
    icon: Clock,
    className:
      "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  },
  danger: {
    icon: CircleX,
    className:
      "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
  },
  info: {
    icon: CircleDot,
    className: "border-status-info-border bg-status-info-bg text-status-info-fg",
  },
  review: {
    icon: RotateCcw,
    className:
      "border-status-review-border bg-status-review-bg text-status-review-fg",
  },
  neutral: {
    icon: FileText,
    className:
      "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
  },
  urgent: {
    icon: TriangleAlert,
    className:
      "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  },
  normal: {
    icon: Circle,
    className:
      "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
  },
} satisfies Record<string, { icon: LucideIcon; className: string }>

export type StatusTone = keyof typeof tones

const toneLabels: Record<StatusTone, string> = {
  success: "Approuvé",
  warning: "En attente du chef",
  danger: "Rejeté",
  info: "En validation",
  review: "En correction",
  neutral: "Brouillon",
  urgent: "Urgent",
  normal: "Normal",
}

export function StatusBadge({
  tone = "success",
  size = "md",
  children,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  tone?: StatusTone
  size?: "md" | "sm"
}) {
  const { icon: Icon, className: toneClass } = tones[tone]
  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      className={cn(
        "inline-flex w-fit items-center rounded-full border text-label font-semibold whitespace-nowrap",
        size === "md" ? "gap-1.5 py-1 pr-2 pl-1" : "gap-1 py-0.5 pr-2 pl-0.5",
        toneClass,
        className
      )}
      {...props}
    >
      <Icon
        aria-hidden
        className={cn("shrink-0", size === "md" ? "size-3.5" : "size-3")}
      />
      {children ?? toneLabels[tone]}
    </span>
  )
}
