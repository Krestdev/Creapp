"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { ActionDialog } from "@/components/ds/action-dialog"

/**
 * Suppression d'un objet (service, catégorie…), même présentation que
 * `ReasonDialog`. À réserver aux suppressions : pour annuler un objet métier
 * qui reste dans l'historique, utiliser `CancelDialog`. Dire clairement ce
 * qui est supprimé et si l'action est irréversible.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Supprimer",
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** Contenu complémentaire (conséquences, récapitulatif…). */
  children?: React.ReactNode
  confirmLabel?: string
  isPending?: boolean
  onConfirm: () => void
}) {
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone="danger"
      icon={Trash2}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      isPending={isPending}
      onConfirm={onConfirm}
    >
      {children}
    </ActionDialog>
  )
}
