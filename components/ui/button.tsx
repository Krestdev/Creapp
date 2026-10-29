import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

/**
 * Bouton CreApp (Figma · Components V2 › Button).
 * Un seul `default` (Primary) par zone d'action. `destructive` = rejeter /
 * annuler, toujours suivi d'une confirmation avec motif.
 * `primary`, `delete`, `success`, `accent` et `iconlg` sont conservés pour les
 * pages existantes.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent text-body-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:shadow-focus-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-text-on-brand hover:bg-brand-hover active:bg-brand-pressed disabled:bg-disabled disabled:text-text-disabled",
        primary:
          "bg-brand text-text-on-brand hover:bg-brand-hover active:bg-brand-pressed disabled:bg-disabled disabled:text-text-disabled",
        secondary:
          "border-border-strong bg-surface text-text-primary hover:bg-hover disabled:border-border-default disabled:bg-surface disabled:text-text-disabled",
        outline:
          "border-border-strong bg-surface text-text-primary hover:bg-hover disabled:border-border-default disabled:bg-surface disabled:text-text-disabled",
        ghost: "text-brand hover:bg-brand-subtle disabled:text-text-disabled",
        destructive:
          "bg-status-danger-fg text-text-on-brand hover:bg-status-danger-hover disabled:bg-disabled disabled:text-text-disabled",
        link: "text-text-link underline-offset-4 hover:underline disabled:text-text-disabled",
        accent:
          "bg-accent-orange text-text-on-brand hover:bg-accent-orange-fg disabled:bg-disabled disabled:text-text-disabled",
        delete:
          "bg-status-danger-bg text-status-danger-fg hover:bg-status-danger-border disabled:bg-disabled disabled:text-text-disabled",
        success:
          "bg-status-success-fg text-text-on-brand hover:bg-status-success-fg/85 disabled:bg-disabled disabled:text-text-disabled",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 rounded-sm px-2 text-label [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-5",
        icon: "size-9",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
        iconlg: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  children,
  className,
  variant,
  size,
  isLoading = false,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {isLoading && <LoaderCircle className="animate-spin" />}
    </button>
  );
}

export { Button, buttonVariants };
