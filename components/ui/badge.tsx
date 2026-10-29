import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Pastille générique (compteurs, étiquettes). Pour le statut d'un objet métier
 * (icône + libellé obligatoires), utiliser `StatusBadge` (components/ds).
 * Les variantes de couleur nommées (blue, yellow, teal…) sont conservées pour
 * les pages existantes.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-5.5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 text-label normal-case whitespace-nowrap transition-colors focus-visible:shadow-focus-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-border-default bg-surface-muted text-text-primary [a&]:hover:bg-neutral-100",
        primary:
          "border-brand-soft bg-brand-subtle-hover text-brand",
        solid: "bg-brand text-text-on-brand",
        secondary:
          "bg-surface-muted text-text-secondary [a&]:hover:bg-neutral-100",
        success:
          "border-status-success-border bg-status-success-bg text-status-success-fg",
        warning:
          "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
        danger:
          "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
        destructive:
          "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
        info: "border-status-info-border bg-status-info-bg text-status-info-fg",
        review:
          "border-status-review-border bg-status-review-bg text-status-review-fg",
        dark: "bg-neutral-800 text-neutral-50",
        blue: "border-accent-blue-border bg-accent-blue-bg text-accent-blue-fg",
        yellow:
          "border-accent-yellow-border bg-accent-yellow-bg text-accent-yellow-fg",
        sky: "border-accent-cyan-border bg-accent-cyan-bg text-accent-cyan-fg",
        teal: "border-accent-teal-border bg-accent-teal-bg text-accent-teal-fg",
        lime: "border-lime-200 bg-lime-100 text-lime-700",
        amber: "border-amber-200 bg-amber-100 text-amber-700",
        purple:
          "border-accent-purple-border bg-accent-purple-bg text-accent-purple-fg",
        indigo:
          "border-accent-indigo-border bg-accent-indigo-bg text-accent-indigo-fg",
        cyan: "border-accent-cyan-border bg-accent-cyan-bg text-accent-cyan-fg",
        olive: "border-olive-200 bg-olive-500 text-olive-50",
        fuchsia: "border-fuchsia-200 bg-fuchsia-500 text-fuchsia-50",
        pink: "border-accent-pink-border bg-accent-pink-bg text-accent-pink-fg",
        orange:
          "border-accent-orange-border bg-accent-orange-bg text-accent-orange-fg",
        outline:
          "border-border-strong bg-surface text-text-primary [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
