'use client'
import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeClosed, Search } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  if(type==="password"){
    return (
      <div className="relative">
        <input
      type={showPassword ? "text" : "password"}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-xs rounded border bg-transparent px-4 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
      {
      showPassword ? 
      <Eye className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-paragraph" 
      size={20} 
      onClick={()=>setShowPassword(!showPassword)}/>
      : 
      <EyeClosed className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-paragraph" 
      size={20}
      onClick={()=>setShowPassword(!showPassword)}/>}
    </div>
    )
  }
  if(type === "search"){
    return(
    <div className="relative">
      <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-xs rounded border bg-transparent pr-4 pl-9 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
    <Search size={20} className="absolute top-1/2 left-2 -translate-y-1/2 text-muted-foreground" />
    </div>
    )
  }
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-xs rounded border bg-transparent px-4 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
