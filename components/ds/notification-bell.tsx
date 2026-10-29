import * as React from "react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Cloche de notifications (Figma · NotificationBell). Pastille de marque =
 * non lus ; au-delà de 99, « 99+ ». À utiliser comme déclencheur du
 * NotificationPanel.
 */
export const NotificationBell = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { count?: number }
>(function NotificationBell({ count = 0, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={
        count === 0
          ? "Notifications"
          : `Notifications, ${count} ${count > 1 ? "non lues" : "non lue"}`
      }
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-md text-text-primary transition-colors outline-none hover:bg-hover focus-visible:shadow-focus-ring aria-expanded:bg-hover",
        className
      )}
      {...props}
    >
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute top-1 left-[22px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-surface bg-brand px-[5px] text-[10px] leading-3 font-bold text-text-on-brand">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  )
})
