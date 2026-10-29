import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-body text-text-primary transition-[color,box-shadow,border-color] outline-none placeholder:text-text-placeholder hover:border-neutral-400 focus-visible:border-border-focus focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:border-border-default disabled:bg-surface-muted disabled:text-text-disabled aria-invalid:border-status-danger-fg",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
