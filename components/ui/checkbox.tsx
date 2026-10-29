"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Case à cocher 18 px (Figma · Checkbox). Cible cliquable étendue à 32 px.
 * `checked="indeterminate"` = sélection partielle (en-tête de liste).
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-[18px] shrink-0 cursor-pointer items-center justify-center rounded-xs border-[1.5px] border-border-strong bg-surface transition-colors outline-none after:absolute after:-inset-1.5 hover:border-neutral-400 focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:border-border-default disabled:bg-disabled aria-invalid:border-status-danger-fg data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-text-on-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-text-on-brand data-[disabled]:data-[state=checked]:border-transparent data-[disabled]:data-[state=checked]:bg-brand-soft",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        {props.checked === "indeterminate" ? (
          <MinusIcon strokeWidth={3} />
        ) : (
          <CheckIcon strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
