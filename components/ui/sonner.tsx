"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Conteneur des toasts : bas-centre, 6 s, pause au survol (Figma · Toast).
 * `notify()` (components/ds/toast.tsx) fournit le rendu du design system ;
 * les `toast.success()` / `toast.error()` existants gardent le rendu coloré
 * de sonner (`richColors`).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      position="bottom-center"
      duration={6000}
      visibleToasts={3}
      richColors
      {...props}
    />
  )
}

export { Toaster }
