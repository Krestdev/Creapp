"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import {
  ReasonActionDialog,
  type ReasonOptions,
} from "@/components/ds/reason-action-dialog"

export type CancelReasonOptions = ReasonOptions

/**
 * Annulation d'un objet métier (ticket, devis, facture, transfert…), même
 * présentation que `ReasonDialog` (type « annulation »).
 *
 * Passer `reason` pour demander un motif ; il est obligatoire sauf
 * `optional: true`. Sans `reason`, c'est une simple confirmation. La mutation
 * reste côté appelant (`onConfirm`, `isPending`).
 */
export function CancelDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  reason,
  reasonValue,
  onReasonChange,
  confirmLabel = "Confirmer l’annulation",
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
  reason?: ReasonOptions
  /** Motif piloté par la page (sinon interne). */
  reasonValue?: string
  onReasonChange?: (value: string) => void
  confirmLabel?: string
  cancelLabel?: string
  confirmDisabled?: boolean
  isPending?: boolean
  /** Reçoit le motif nettoyé (chaîne vide quand `reason` n'est pas demandé). */
  onConfirm: (reason: string) => void
}) {
  return (
    <ReasonActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="warning"
      icon={TriangleAlert}
      title={title}
      description={description}
      reason={reason && { label: "Motif de l’annulation", ...reason }}
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
