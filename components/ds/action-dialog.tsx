"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
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
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const tones = {
  danger: "bg-status-danger-bg text-status-danger-fg",
  warning: "bg-status-warning-bg text-status-warning-fg",
  review: "bg-status-review-bg text-status-review-fg",
} as const

export type ActionDialogTone = keyof typeof tones

/** Typographie française : espace insécable avant « ? ! : ; » et dans les guillemets. */
function frenchSpacing(node: React.ReactNode) {
  return typeof node === "string"
    ? node.replace(/ ([?!:;»])/g, "\u00a0$1").replace(/« /g, "«\u00a0")
    : node
}

/**
 * Modale d'action contrôlée, même structure que `ReasonDialog` (Figma ·
 * ReasonDialog) : pastille d'icône, titre, description, corps libre, pied sur
 * bande `surface-muted` avec « Retour » et l'action confirmée.
 *
 * Sert de socle à `CancelDialog` et `DeleteDialog`. Libellé de confirmation =
 * verbe + objet (« Supprimer le service »), jamais « OK ». Pendant
 * `isPending`, la fermeture est bloquée et le bouton affiche un chargement.
 */
export function ActionDialog({
  open,
  onOpenChange,
  tone = "danger",
  icon: Icon,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = "Retour",
  confirmVariant = "destructive",
  confirmDisabled,
  isPending,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tone?: ActionDialogTone
  icon: LucideIcon
  title: React.ReactNode
  description?: React.ReactNode
  /** Corps (champ de motif, récapitulatif…). Sans corps, le titre suffit. */
  children?: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  confirmVariant?: React.ComponentProps<typeof Button>["variant"]
  confirmDisabled?: boolean
  isPending?: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending && !next) return
        onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0"
      >
        {/* En-tête et corps défilent sur les écrans courts ; le pied reste visible. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DialogHeader
            className={cn(
              "flex-row items-start gap-3.5 px-6 pt-6 pr-6",
              !children && "pb-5"
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                tones[tone]
              )}
            >
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle className="text-text-primary [overflow-wrap:anywhere]">
                {frenchSpacing(title)}
              </DialogTitle>
              {description && (
                <DialogDescription asChild>
                  <div className="[overflow-wrap:anywhere]">
                    {frenchSpacing(description)}
                  </div>
                </DialogDescription>
              )}
            </div>
          </DialogHeader>
          {children && <DialogBody>{children}</DialogBody>}
        </div>
        <DialogFooter className="flex-col-reverse bg-surface-muted px-6 py-4 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button variant="secondary" disabled={isPending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={confirmVariant}
            disabled={confirmDisabled || isPending}
            isLoading={isPending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
