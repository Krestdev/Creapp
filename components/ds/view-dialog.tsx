"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

/**
 * Fenêtre de consultation (voir un besoin, un bon de commande, un projet…) :
 * en-tête « Entité - nom » avec description, corps libre (le plus souvent un
 * `ViewGrid` de `ViewGroup`) et pied avec « Fermer ». Même gabarit que
 * `detail-besoin` et `viewPurchase`, qui font référence.
 *
 * `footer` ajoute des actions avant « Fermer » (télécharger, aperçu…).
 */
export function ViewDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-3xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          {footer}
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Grille à deux colonnes (une seule sous 520 px de large de boîte). */
export function ViewGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 @min-[520px]/dialog:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Information de la fiche : pastille d'icône, intitulé, valeur. `wide` occupe
 * toute la largeur de la grille (listes, textes longs).
 */
export function ViewGroup({
  icon: Icon,
  label,
  wide,
  children,
  className,
}: {
  icon: LucideIcon
  label: React.ReactNode
  wide?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("view-group", wide && "col-span-full", className)}>
      <span className="view-icon">
        <Icon />
      </span>
      <div className={cn("flex flex-col", wide && "w-full")}>
        <p className="view-group-title">{label}</p>
        {children}
      </div>
    </div>
  )
}
