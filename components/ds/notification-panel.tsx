"use client"

import * as React from "react"
import { ActivityItem } from "@/components/ds/activity-item"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type NotificationEntry = {
  id: string
  actor: string
  reference?: string
  message: string
  time: string
  unread?: boolean
}

/**
 * Menu de la cloche (Figma · NotificationPanel). Onglet « Non lues » par
 * défaut ; chaque notification mène directement à l'objet (1 clic).
 */
export function NotificationPanel({
  notifications,
  onSelect,
  onMarkAllRead,
  className,
}: {
  notifications: NotificationEntry[]
  onSelect?: (notification: NotificationEntry) => void
  onMarkAllRead?: () => void
  className?: string
}) {
  const unread = notifications.filter((n) => n.unread)
  return (
    <div
      data-slot="notification-panel"
      className={cn(
        "flex w-full max-w-105 flex-col overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg",
        className
      )}
    >
      <Tabs defaultValue="unread" className="gap-0">
        <header className="flex items-center pt-4 pr-4 pb-1 pl-5">
          <h2 className="flex-1 text-title text-text-primary">Notifications</h2>
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-sm text-body-medium text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
          >
            Tout marquer comme lu
          </button>
        </header>
        <TabsList className="gap-5 px-5">
          <TabsTrigger value="unread" count={unread.length}>
            Non lues
          </TabsTrigger>
          <TabsTrigger value="all" count={notifications.length}>
            Toutes
          </TabsTrigger>
        </TabsList>
        {(
          [
            ["unread", unread],
            ["all", notifications],
          ] as const
        ).map(([value, list]) => (
          <TabsContent
            key={value}
            value={value}
            className="flex max-h-96 flex-col gap-0.5 overflow-y-auto px-2.5 py-2"
          >
            {list.length === 0 ? (
              <p className="px-2 py-8 text-center text-body text-text-tertiary">
                Rien de nouveau : vous êtes à jour.
              </p>
            ) : (
              list.map((n, i) => (
                <ActivityItem
                  key={n.id}
                  actor={n.actor}
                  reference={n.reference}
                  time={n.time}
                  unread={n.unread}
                  highlighted={value === "unread" && i === 0}
                  onClick={() => onSelect?.(n)}
                >
                  {n.message}
                </ActivityItem>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
      <footer className="flex justify-center bg-surface-muted py-3">
        <button
          type="button"
          className="rounded-sm text-body-medium text-text-secondary outline-none hover:text-text-primary focus-visible:shadow-focus-ring"
        >
          Gérer mes canaux de notification
        </button>
      </footer>
    </div>
  )
}
