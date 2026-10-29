"use client"

import * as React from "react"
import { CircleX, RotateCcw, TriangleAlert, type LucideIcon } from "lucide-react"
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
import { TextareaField } from "@/components/ds/form-field"
import { cn } from "@/lib/utils"

const types = {
  rejet: {
    icon: CircleX,
    badge: "bg-status-danger-bg text-status-danger-fg",
    destructive: true,
  },
  renvoi: {
    icon: RotateCcw,
    badge: "bg-status-review-bg text-status-review-fg",
    destructive: false,
  },
  annulation: {
    icon: TriangleAlert,
    badge: "bg-status-warning-bg text-status-warning-fg",
    destructive: true,
  },
} satisfies Record<
  string,
  { icon: LucideIcon; badge: string; destructive: boolean }
>

export type ReasonType = keyof typeof types

const copies = {
  rejet: {
    title: (reference: string) => `Rejeter le besoin ${reference} ?`,
    description:
      "Le rejet est définitif : le besoin sort du circuit. L’émetteur est notifié avec votre motif.",
    field: "Motif du rejet",
    confirm: "Rejeter le besoin",
  },
  renvoi: {
    title: (reference: string) => `Renvoyer ${reference} pour correction ?`,
    description:
      "Le besoin retourne à son émetteur avec votre motif. Une fois corrigé, le circuit repart du début.",
    field: "Motif du renvoi",
    confirm: "Renvoyer pour correction",
  },
  annulation: {
    title: (reference: string) => `Annuler ${reference} ?`,
    description:
      "L’annulation est journalisée et ne peut pas être défaite. Les personnes concernées sont notifiées.",
    field: "Motif de l’annulation",
    confirm: "Annuler le besoin",
  },
} satisfies Record<
  ReasonType,
  {
    title: (reference: string) => string
    description: string
    field: string
    confirm: string
  }
>

/**
 * Boîte de motif obligatoire (Figma · ReasonDialog) pour tout rejet, renvoi,
 * annulation, saut d'échéance ou changement de moyen de paiement. Le bouton
 * de confirmation reste désactivé tant que le motif est vide. Libellé de
 * confirmation = verbe + objet, jamais « OK ».
 */
export function ReasonDialog({
  type,
  reference,
  trigger,
  maxLength = 500,
  onConfirm,
  open: openProp,
  onOpenChange,
}: {
  type: ReasonType
  reference: string
  /** Élément qui ouvre la boîte (ex. `<Button variant="destructive">`). */
  trigger?: React.ReactElement
  maxLength?: number
  onConfirm?: (reason: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const cfg = types[type]
  const copy = copies[type]
  const Icon = cfg.icon
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [reason, setReason] = React.useState("")
  const open = openProp ?? internalOpen
  const [touched, setTouched] = React.useState(false)
  const empty = reason.trim().length === 0

  function setOpen(next: boolean) {
    setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setReason("")
      setTouched(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0">
        <DialogHeader className="flex-row items-start gap-3.5 px-6 pt-6">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              cfg.badge
            )}
          >
            <Icon aria-hidden className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <DialogTitle>{copy.title(reference)}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <TextareaField
            label={copy.field}
            required
            value={reason}
            maxLength={maxLength}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            error={touched && empty ? "Le motif est obligatoire." : undefined}
            helper="Visible par l’émetteur et conservé dans l’historique."
            counter={{ value: reason.length, max: maxLength }}
            className="[&_textarea]:h-26"
          />
        </DialogBody>
        <DialogFooter className="bg-surface-muted px-6 py-4 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary">Retour</Button>
          </DialogClose>
          <Button
            variant={cfg.destructive ? "destructive" : "default"}
            disabled={empty}
            onClick={() => {
              onConfirm?.(reason.trim())
              setOpen(false)
            }}
          >
            {copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
