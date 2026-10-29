'use client'
import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeClosed, Search } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Champ texte (Figma · TextField › Field) : 36 px, rayon md, focus bordeaux. */
const inputClassName =
  "h-9 w-full min-w-32 rounded-md border border-border-strong bg-surface px-3 text-body text-text-primary transition-[color,box-shadow,border-color] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-body-medium file:text-text-primary placeholder:text-text-placeholder hover:border-neutral-400 focus-visible:border-border-focus focus-visible:shadow-focus-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border-default disabled:bg-surface-muted disabled:text-text-disabled disabled:placeholder:text-text-disabled aria-invalid:border-status-danger-fg aria-invalid:hover:border-status-danger-fg";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  if(type==="password"){
    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          data-slot="input"
          className={cn(inputClassName, "pr-10", className)}
          {...props}
        />
        {showPassword ? (
          <Eye
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-tertiary"
            size={20}
            onClick={()=>setShowPassword(!showPassword)}
          />
        ) : (
          <EyeClosed
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-text-tertiary"
            size={20}
            onClick={()=>setShowPassword(!showPassword)}
          />
        )}
      </div>
    )
  }
  if(type === "search"){
    return(
      <div className="relative">
        <input
          type={type}
          data-slot="input"
          className={cn(inputClassName, "pr-3 pl-9", className)}
          {...props}
        />
        <Search size={20} className="absolute top-1/2 left-2 -translate-y-1/2 text-text-tertiary" />
      </div>
    )
  }
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  );
}

export { Input };
