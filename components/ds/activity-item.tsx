import * as React from "react"
import { UserAvatar } from "@/components/ds/user-avatar"
import { cn } from "@/lib/utils"

/**
 * Entrée du fil d'activité / d'une notification (Figma · ActivityItem). Le
 * message nomme l'acteur, le verbe métier et la référence (en gras,
 * cliquable). Pastille de marque = non lu.
 */
export function ActivityItem({
  actor,
  reference,
  children,
  time,
  unread,
  highlighted,
  onClick,
  className,
}: {
  /** Nom de l'acteur : sert à l'avatar (initiales). */
  actor: string
  /** Référence de l'objet, mise en gras en début de message. */
  reference?: string
  /** Reste du message. */
  children: React.ReactNode
  time: string
  unread?: boolean
  highlighted?: boolean
  onClick?: () => void
  className?: string
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      {...(onClick ? { type: "button" as const, onClick } : {})}
      data-slot="activity-item"
      data-unread={unread || undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-left outline-none",
        onClick && "hover:bg-hover focus-visible:shadow-focus-ring",
        highlighted && "bg-hover",
        className
      )}
    >
      <UserAvatar name={actor} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-body",
            unread ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {reference && (
            <span className="text-body-strong text-text-primary">
              {reference}
            </span>
          )}
          {reference ? " " : null}
          {children}
        </span>
        <span className="text-caption text-text-tertiary">{time}</span>
      </span>
      {unread && (
        <span
          aria-label="Non lu"
          className="size-2 shrink-0 rounded-full bg-brand"
        />
      )}
    </Comp>
  )
}
