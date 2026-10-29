"use client"

import * as React from "react"
import AppSidebar from "@/components/navigation/app-sidebar"
import { TopBar } from "@/components/shell/top-bar"
import { cn } from "@/lib/utils"

/**
 * Coque commune à toutes les pages applicatives : Sidebar + TopBar + contenu.
 * Sous 1024 px la sidebar devient un tiroir ; au-dessus elle se replie à
 * 72 px. Le contenu des pages est rendu tel quel dans la zone principale.
 */
export function AppShell({
  rail,
  children,
}: {
  /** Colonne de droite (`RightRail`), visible dès 1280 px. */
  rail?: React.ReactNode
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(true)

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)")
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  function toggleSidebar() {
    if (isDesktop) setCollapsed((c) => !c)
    else setDrawerOpen((o) => !o)
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      {drawerOpen && (
        <div
          aria-hidden
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AppSidebar
          // Dans le tiroir mobile la sidebar est toujours déployée.
          collapsed={collapsed && isDesktop}
          onExpand={() => setCollapsed(false)}
          onNavigate={() => setDrawerOpen(false)}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleSidebar={toggleSidebar} />
        <div className="flex min-w-0 flex-1">
          <main className="min-w-0 flex-1">
            <div className="p-6 @container min-h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-auto">
              {children}
            </div>
            <div className="w-full flex px-3 items-center justify-center min-h-10 py-2 bg-surface-muted text-caption sm:text-body text-text-tertiary">
              <p className="max-w-7xl mx-auto">
                {"© 2026 CREAPP. Réalisé par "}
                <a
                  href="https://krestdev.com"
                  className="text-brand cursor-pointer hover:underline"
                  target="_blank"
                >
                  KrestDev
                </a>
              </p>
            </div>
          </main>
          {rail}
        </div>
      </div>
    </div>
  )
}
