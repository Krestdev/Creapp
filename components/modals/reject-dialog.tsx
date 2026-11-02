"use client"

import * as React from "react"
import { CircleX } from "lucide-react"
import {
  ReasonActionDialog,
  type ReasonOptions,
} from "@/components/ds/reason-action-dialog"

/**
 * Rejet d'une demande (besoin, paiement, transfert, bon de commande…), même
 * présentation que `ReasonDialog` (type « rejet »). Le rejet est définitif :
 * le dire dans la description.
 *
 * Le motif est demandé par défaut ; `reason={{ optional: true }}` le rend
 * facultatif, `reason={false}` le retire. La mutation reste côté appelant.
 */
export function RejectDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  reason = {},
  reasonValue,
  onReasonChange,
  confirmLabel = "Rejeter",
  cancelLabel,
  confirmDisabled,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  reason?: ReasonOptions | false
  /** Motif piloté par la page (sinon interne). */
  reasonValue?: string
  onReasonChange?: (value: string) => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  isPending?: boolean
  /** Reçoit le motif nettoyé (chaîne vide quand aucun motif n'est demandé). */
  onConfirm: (reason: string) => void
}) {
  return (
    <ReasonActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      icon={CircleX}
      title={title}
      description={description}
      reason={
        reason === false
          ? undefined
          : {
              label: "Motif du rejet",
              helper: "Visible par l’émetteur et conservé dans l’historique.",
              ...reason,
            }
      }
      reasonValue={reasonValue}
      onReasonChange={onReasonChange}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={confirmDisabled}
      isPending={isPending}
      onConfirm={onConfirm}
    >
      {children}
    </ReasonActionDialog>
  )
}
