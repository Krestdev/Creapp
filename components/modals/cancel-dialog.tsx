"use client"

import * as React from "react"
import { TriangleAlert } from "lucide-react"
import { ActionDialog } from "@/components/ds/action-dialog"
import { TextareaField } from "@/components/ds/form-field"

export type CancelReasonOptions = {
  label?: string
  placeholder?: string
  helper?: string
  /** Longueur minimale du motif (après suppression des espaces). Défaut : 1. */
  minLength?: number
  /** Longueur maximale du motif. Défaut : 500. */
  maxLength?: number
}

/**
 * Annulation d'un objet métier (ticket, devis, facture, transfert…), même
 * présentation que `ReasonDialog` (type « annulation »).
 *
 * Passer `reason` pour demander un motif obligatoire ; la confirmation reste
 * désactivée tant qu'il est invalide. Sans `reason`, c'est une simple
 * confirmation. La mutation reste côté appelant (`onConfirm`, `isPending`).
 */
export function CancelDialog({
  open,
  onOpenChange,
  title,
  description,
  reason,
  confirmLabel = "Confirmer l’annulation",
  cancelLabel,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  reason?: CancelReasonOptions
  confirmLabel?: string
  cancelLabel?: string
  isPending?: boolean
  /** Reçoit le motif nettoyé (chaîne vide quand `reason` n'est pas demandé). */
  onConfirm: (reason: string) => void
}) {
  const [value, setValue] = React.useState("")
  const [touched, setTouched] = React.useState(false)

  // La page ferme la boîte (succès) ou l'utilisateur la quitte : on repart de zéro.
  React.useEffect(() => {
    if (!open) {
      setValue("")
      setTouched(false)
    }
  }, [open])

  const minLength = reason?.minLength ?? 1
  const maxLength = reason?.maxLength ?? 500
  const trimmed = value.trim()
  const invalid = Boolean(reason) && trimmed.length < minLength
  const error =
    touched && invalid
      ? minLength <= 1
        ? "Le motif est obligatoire."
        : `Le motif doit contenir au moins ${minLength} caractères.`
      : undefined

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="warning"
      icon={TriangleAlert}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={invalid}
      isPending={isPending}
      onConfirm={() => onConfirm(trimmed)}
    >
      {reason && (
        <TextareaField
          label={reason.label ?? "Motif de l’annulation"}
          required
          value={value}
          maxLength={maxLength}
          placeholder={reason.placeholder}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          error={error}
          helper={reason.helper ?? "Conservé dans l’historique."}
          counter={{ value: value.length, max: maxLength }}
          className="[&_textarea]:h-26"
        />
      )}
    </ActionDialog>
  )
}
