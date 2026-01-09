import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 h-5.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-input bg-gray-100 text-foreground [a&]:hover:bg-gray-200",
        primary: "border-primary-200 bg-primary-100 text-primary-600",
        secondary:
          "border-secondary-200 bg-secondary-100 text-secondary [a&]:hover:bg-secondary/20",
        success: "border-green-200 bg-green-100 text-green-600",
        destructive: "border-red-200 bg-red-100 text-red-600",
        dark: "border-input bg-gray-800 text-gray-50",
        blue: "border-blue-200 bg-blue-100 text-blue-600",
        yellow: "border-yellow-200 bg-yellow-100 text-yellow-600",
        sky: "border-sky-200 bg-sky-100 text-sky-600",
        teal: "border-teal-200 bg-teal-100 text-teal-600",
        lime: "border-lime-200 bg-lime-100 text-lime-600",
        amber: "border-amber-200 bg-amber-100 text-amber-600",
        purple: "border-purple-200 bg-purple-100 text-purple-600",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
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
