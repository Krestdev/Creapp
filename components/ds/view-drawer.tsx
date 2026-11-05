"use client"

import * as React from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

/**
 * Tiroir de consultation (Figma · « Devis (voir) », « Besoins voir ») : surtitre
 * de l'objet, son nom, « Consultez les informations associées au … », un corps
 * défilant (le plus souvent un `ViewGrid` de `ViewField`) et un pied avec
 * « Fermer ». `footer` ajoute des actions avant « Fermer » ; `footerInfo`
 * affiche un résumé à gauche (« 2 besoins · 3 éléments »).
 */
export function ViewDrawer({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  children,
  footer,
  primaryAction,
  footerInfo,
  className,
  bodyClassName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Objet consulté : « Devis », « Besoin », « Fournisseur »… */
  eyebrow: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** Action principale placée après « Fermer » (ex. « Comparer »). */
  primaryAction?: React.ReactNode
  footerInfo?: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={className}>
        <DrawerHeader>
          <DrawerEyebrow>{eyebrow}</DrawerEyebrow>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <DrawerBody className={cn("flex flex-col gap-3 [&>*]:shrink-0", bodyClassName)}>
          {children}
        </DrawerBody>
        <DrawerFooter pinned className="sm:justify-between">
          <p className="text-body-medium text-text-primary">{footerInfo}</p>
          <div className="flex items-center gap-2.5">
            {footer}
            <DrawerClose asChild>
              <Button variant="outline">{"Fermer"}</Button>
            </DrawerClose>
            {primaryAction}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
 * Information de la fiche : libellé gris au-dessus de la valeur. `wide` occupe
 * toute la largeur de la grille (textes longs, listes). `icon` n'est plus
 * affiché (le Figma n'en a pas) ; il est conservé pour les appels existants.
 */
export function ViewField({
  label,
  wide,
  children,
  className,
}: {
  label: React.ReactNode
  wide?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("view-group", wide && "col-span-full", className)}>
      <p className="view-group-title">{label}</p>
      <div className="flex w-full min-w-0 flex-col">{children}</div>
    </div>
  )
}

export function ViewGroup({
  icon: _icon,
  ...props
}: React.ComponentProps<typeof ViewField> & { icon?: unknown }) {
  return <ViewField {...props} />
}

/** Pièce jointe (Figma · FileItem) : tuile, nom, type et poids. */
export function ViewFile({
  name,
  meta,
  href,
  className,
}: {
  name: React.ReactNode
  meta?: React.ReactNode
  href?: string
  className?: string
}) {
  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
        <FileText aria-hidden className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-body-medium text-text-primary">
          {name}
        </span>
        {meta && <span className="text-caption text-text-tertiary">{meta}</span>}
      </span>
    </>
  )
  const base =
    "flex items-center gap-3 rounded-lg border border-border-default bg-surface py-2.5 pr-2 pl-3"
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(base, "transition-colors hover:bg-hover", className)}
    >
      {body}
    </a>
  ) : (
    <div className={cn(base, className)}>{body}</div>
  )
}
