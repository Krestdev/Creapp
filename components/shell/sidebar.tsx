"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { findActiveHref } from "./nav-utils"

export type ShellNavItem = {
  title: string
  href: string
  icon?: LucideIcon
  badge?: number
}

/** Un groupe d'une seule page s'affiche comme un item de premier niveau. */
export type ShellNavGroup = {
  id: string
  title: string
  icon: LucideIcon
  items: ShellNavItem[]
}

function formatBadge(badge: number) {
  return badge > 99 ? "99+" : badge
}

/**
 * Entrée de navigation (Figma · NavItem). `top` = module avec icône ; `sub` =
 * page d'un groupe, indentée, barre de marque quand elle est active. Le badge
 * indique un nombre d'éléments à traiter.
 */
function NavItem({
  label,
  href,
  icon: Icon,
  badge,
  active,
  level = "top",
  collapsed,
  onClick,
}: {
  label: string
  href: string
  icon?: LucideIcon
  badge?: number
  active?: boolean
  level?: "top" | "sub"
  collapsed?: boolean
  onClick?: () => void
}) {
  const className = cn(
    "relative flex h-9 w-full items-center gap-2.5 rounded-md pr-2 text-left text-body outline-none transition-colors focus-visible:shadow-focus-ring",
    level === "sub" ? "pl-10" : "pl-3",
    active
      ? "bg-brand-subtle text-body-strong text-brand"
      : "text-text-secondary hover:bg-hover hover:text-text-primary",
    collapsed && "justify-center px-0"
  )
  const content = (
    <>
      {level === "sub" && active && (
        <span
          aria-hidden
          className="absolute top-2.5 left-6.5 h-4 w-[3px] rounded-[2px] bg-brand"
        />
      )}
      {Icon && <Icon className="size-5 shrink-0" />}
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!collapsed && badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-subtle-hover px-1.5 text-overline tracking-normal text-brand">
          {formatBadge(badge)}
        </span>
      ) : null}
      {collapsed && badge ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-2.5 size-2 rounded-full bg-brand"
        />
      ) : null}
    </>
  )

  const node = (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={className}
    >
      {content}
    </Link>
  )

  if (!collapsed) return node
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

/** Groupe repliable (Figma · NavGroup) : ouvert quand une de ses pages est active. */
function NavGroup({
  group,
  open,
  onToggle,
  activeHref,
  collapsed,
  onNavigate,
}: {
  group: ShellNavGroup
  open: boolean
  onToggle: () => void
  activeHref?: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = group.icon
  const hasActive = group.items.some((c) => c.href === activeHref)
  const pending = group.items.reduce((sum, c) => sum + (c.badge ?? 0), 0)
  const Chevron = open ? ChevronDown : ChevronRight

  if (collapsed) {
    const trigger = (
      <button
        type="button"
        onClick={onToggle}
        aria-label={group.title}
        className={cn(
          "relative flex h-9 w-full items-center justify-center rounded-md text-left outline-none transition-colors focus-visible:shadow-focus-ring",
          hasActive
            ? "bg-brand-subtle text-brand"
            : "text-text-secondary hover:bg-hover hover:text-text-primary"
        )}
      >
        <Icon className="size-5 shrink-0" />
        {pending > 0 && (
          <span
            aria-hidden
            className="absolute top-1.5 right-2.5 size-2 rounded-full bg-brand"
          />
        )}
      </button>
    )
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side="right">{group.title}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center gap-2.5 rounded-md pr-2 pl-3 text-left text-body outline-none transition-colors hover:bg-hover focus-visible:shadow-focus-ring",
          open ? "text-body-strong text-text-primary" : "text-text-secondary"
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{group.title}</span>
        {!open && pending > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-subtle-hover px-1.5 text-overline tracking-normal text-brand">
            {formatBadge(pending)}
          </span>
        )}
        <Chevron aria-hidden className="size-4 shrink-0 text-text-tertiary" />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              label={item.title}
              href={item.href}
              badge={item.badge}
              level="sub"
              active={item.href === activeHref}
              onClick={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Sidebar V2 (Figma · Sidebar) : 256 px déployée, 72 px repliée (sous 1024 px,
 * infobulles au survol des icônes). Le profil vit dans la TopBar.
 */
export function Sidebar({
  groups,
  loading,
  collapsed,
  onExpand,
  onNavigate,
  className,
}: {
  groups: ShellNavGroup[]
  loading?: boolean
  collapsed: boolean
  onExpand?: () => void
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()
  const activeHref = findActiveHref(groups, pathname)
  const activeGroup = groups.find((g) =>
    g.items.some((i) => i.href === activeHref)
  )
  const [openGroup, setOpenGroup] = React.useState<string | null>(
    activeGroup?.id ?? null
  )

  // Suit la navigation : le groupe de la page active s'ouvre.
  React.useEffect(() => {
    if (activeGroup) setOpenGroup(activeGroup.id)
  }, [activeGroup?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      aria-label="Navigation principale"
      className={cn(
        "flex h-full flex-col border-r border-border-default bg-surface transition-[width] duration-200",
        collapsed ? "w-18" : "w-64",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center pt-3.5 pb-3",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        <Link href="/tableau-de-bord" onClick={onNavigate} className="outline-none focus-visible:shadow-focus-ring">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={collapsed ? "/logo-icon.svg" : "/logo.svg"}
            alt="CreApp"
            className="h-8 w-auto"
          />
        </Link>
      </div>

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto py-2",
          collapsed ? "items-stretch px-2" : "px-3"
        )}
      >
        {loading
          ? [...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))
          : groups.map((group) => {
              if (group.items.length === 1) {
                const item = group.items[0]
                return (
                  <NavItem
                    key={group.id}
                    label={item.title}
                    icon={item.icon ?? group.icon}
                    href={item.href}
                    badge={item.badge}
                    active={item.href === activeHref}
                    collapsed={collapsed}
                    onClick={onNavigate}
                  />
                )
              }
              return (
                <NavGroup
                  key={group.id}
                  group={group}
                  open={openGroup === group.id}
                  onToggle={() => {
                    if (collapsed) onExpand?.()
                    setOpenGroup((g) => (g === group.id ? null : group.id))
                  }}
                  activeHref={activeHref}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              )
            })}
      </nav>
    </aside>
  )
}
