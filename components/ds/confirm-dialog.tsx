"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * Confirmation simple, sans motif (action réversible ou à faible enjeu).
 * Libellé de confirmation = verbe + objet (« Valider le besoin »), jamais
 * « OK ». Pour un rejet / renvoi / une annulation, utiliser `ReasonDialog`.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  children,
  onConfirm,
}: {
  trigger: React.ReactElement
  title: string
  description?: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Contenu libre entre l'en-tête et le pied (récapitulatif, champs…). */
  children?: React.ReactNode
  onConfirm?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pr-14">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogBody className={children ? undefined : "pt-2 pb-4"}>
          {children}
        </DialogBody>
        <DialogFooter className="bg-surface-muted px-6 py-4 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">{cancelLabel ?? "Retour"}</Button>
          </DialogClose>
          <Button
            onClick={() => {
              onConfirm?.()
              setOpen(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
