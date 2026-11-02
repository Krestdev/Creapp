"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  ActionDialog,
  type ActionDialogTone,
} from "@/components/ds/action-dialog"
import { TextareaField } from "@/components/ds/form-field"
import type { Button } from "@/components/ui/button"

export type ReasonOptions = {
  label?: string
  placeholder?: string
  helper?: string
  /** Longueur minimale du motif (après suppression des espaces). Défaut : 1. */
  minLength?: number
  /** Longueur maximale du motif. Défaut : 500. */
  maxLength?: number
  /** Motif facultatif : jamais bloquant, libellé suffixé « (optionnel) ». */
  optional?: boolean
}

/**
 * `ActionDialog` avec un champ de motif (Figma · ReasonDialog). Socle de
 * `CancelDialog` et `RejectDialog`.
 *
 * - Sans `reason`, aucun champ : simple confirmation.
 * - Un motif obligatoire garde la confirmation désactivée tant qu'il est
 *   invalide ; l'erreur s'affiche une fois le champ quitté.
 * - Par défaut le motif est interne et remis à zéro à la fermeture. Pour le
 *   piloter depuis la page, passer `reasonValue` et `onReasonChange`.
 */
export function ReasonActionDialog({
  open,
  onOpenChange,
  tone,
  icon,
  title,
  description,
  children,
  reason,
  reasonValue,
  onReasonChange,
  confirmLabel,
  cancelLabel,
  confirmVariant,
  confirmDisabled,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tone: ActionDialogTone
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Contenu affiché au-dessus du champ de motif (récapitulatif…). */
  children?: React.ReactNode
  reason?: ReasonOptions
  reasonValue?: string
  onReasonChange?: (value: string) => void
  confirmLabel: string
  cancelLabel?: string
  confirmVariant?: React.ComponentProps<typeof Button>["variant"]
  /** Désactive la confirmation en plus de la validation du motif. */
  confirmDisabled?: boolean
  isPending?: boolean
  /** Reçoit le motif nettoyé (chaîne vide quand `reason` n'est pas demandé). */
  onConfirm: (reason: string) => void
}) {
  const controlled = reasonValue !== undefined
  const [internal, setInternal] = React.useState("")
  const [touched, setTouched] = React.useState(false)
  const value = controlled ? reasonValue : internal
  const setValue = controlled ? (onReasonChange ?? (() => {})) : setInternal

  // La page ferme la boîte (succès) ou l'utilisateur la quitte : on repart de zéro.
  React.useEffect(() => {
    if (!open) {
      if (!controlled) setInternal("")
      setTouched(false)
    }
  }, [open, controlled])

  const optional = reason?.optional ?? false
  const minLength = optional ? 0 : (reason?.minLength ?? 1)
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
      tone={tone}
      icon={icon}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmVariant={confirmVariant}
      confirmDisabled={invalid || confirmDisabled}
      isPending={isPending}
      onConfirm={() => onConfirm(trimmed)}
    >
      {(children || reason) && (
        <>
          {children}
          {reason && (
            <TextareaField
              label={`${reason.label ?? "Motif"}${optional ? " (optionnel)" : ""}`}
              required={!optional}
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
        </>
      )}
    </ActionDialog>
  )
}
