"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tiroir latéral (Figma · Drawer) : panneau de 640 px collé à droite, plein
 * hauteur. En-tête (module, titre, description, fermeture), corps défilant,
 * pied avec les actions. Même API que `Dialog` : `Drawer`, `DrawerContent`,
 * `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`…
 *
 * À utiliser pour consulter ou **modifier** un objet depuis une liste ; les
 * confirmations (rejet, annulation, suppression) restent des modales.
 *
 *   <Drawer open onOpenChange>
 *     <DrawerContent>
 *       <DrawerHeader>
 *         <DrawerEyebrow>Trésorerie</DrawerEyebrow>
 *         <DrawerTitle>Nouvelle transaction manuelle</DrawerTitle>
 *         <DrawerDescription>…</DrawerDescription>
 *       </DrawerHeader>
 *       <DrawerBody> …formulaire… <DrawerFooter>…</DrawerFooter> </DrawerBody>
 *     </DrawerContent>
 *   </Drawer>
 */
function Drawer({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-neutral-900/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          // `@container/dialog` : les grilles des formulaires (`@min-[…]/dialog:`)
          // s'adaptent à la largeur du tiroir.
          "@container/dialog fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col bg-surface text-body text-text-primary shadow-lg outline-none sm:max-w-160",
          "duration-300 ease-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="drawer-close-button"
            className="absolute top-5 right-6 flex size-8 cursor-pointer items-center justify-center rounded-md text-text-tertiary transition-colors outline-none hover:bg-hover hover:text-text-primary focus-visible:shadow-focus-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5"
          >
            <XIcon />
            <span className="sr-only">{"Fermer"}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DrawerPortal>
  );
}

/** En-tête : module (optionnel), titre, description, séparé du corps par un filet. */
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex shrink-0 flex-col gap-1 border-b border-border-default px-7 pt-6 pr-16 pb-5 text-left",
        className
      )}
      {...props}
    />
  );
}

/** Module d'appartenance, en petites capitales au-dessus du titre (« TRÉSORERIE »). */
function DrawerEyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="drawer-eyebrow"
      className={cn("text-overline text-text-tertiary uppercase", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-heading-3 text-text-primary", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-body text-text-secondary", className)}
      {...props}
    />
  );
}

/** Corps défilant du tiroir (formulaire, fiche). */
function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn(
        // `content-start` : une grille posée sur le corps ne répartit pas ses
        // rangées sur toute la hauteur du tiroir.
        "min-h-0 flex-1 content-start overflow-y-auto px-7 py-5",
        className
      )}
      {...props}
    />
  );
}

/**
 * Pied avec les actions (Annuler + action principale), à droite, au-dessus d'un
 * filet. Placé dans `DrawerBody` (cas d'un bouton de validation dans le
 * formulaire), il reste collé au bas du tiroir pendant le défilement. Avec
 * `pinned`, il est posé directement dans `DrawerContent`, sous le corps.
 */
function DrawerFooter({
  className,
  pinned,
  ...props
}: React.ComponentProps<"div"> & { pinned?: boolean }) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex flex-col-reverse gap-2.5 border-t border-border-default bg-surface px-7 pt-4 pb-5 sm:flex-row sm:items-center sm:justify-end",
        pinned
          ? "shrink-0"
          : "sticky bottom-0 z-10 -mx-7 -mb-5 mt-6",
        className
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
