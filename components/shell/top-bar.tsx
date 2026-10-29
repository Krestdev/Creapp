"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  LockIcon,
  LogOutIcon,
  PanelLeft,
  Search,
  UserRoundIcon,
} from "lucide-react"
import { useNavGroups } from "@/components/navigation/use-nav-groups"
import { UserAvatar } from "@/components/ds/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStore } from "@/providers/datastore"
import { breadcrumbFor } from "./nav-utils"
import { SearchPalette } from "./search-palette"

/**
 * Barre supérieure 60 px (Figma · TopBar) : bascule de la sidebar, fil
 * d'Ariane « Parent › Page », recherche globale ⌘K et menu utilisateur
 * (avatar + nom + poste). La cloche de notifications du Figma n'est pas
 * affichée tant que les notifications ne sont pas branchées.
 */
export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useStore()
  const router = useRouter()
  const pathname = usePathname()
  const { groups } = useNavGroups()
  const breadcrumb = breadcrumbFor(groups, pathname)
  const name = user ? `${user.lastName} ${user.firstName}`.trim() : "Utilisateur"

  const [searchOpen, setSearchOpen] = React.useState(false)
  const [shortcut, setShortcut] = React.useState("⌘K")

  React.useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("Ctrl K")
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const signOut = () => {
    logout()
    router.replace("/connexion")
  }

  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-30 flex h-15 shrink-0 items-center gap-4 border-b border-border-default bg-surface px-4 sm:px-6"
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Afficher ou masquer la navigation"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-secondary outline-none hover:bg-hover hover:text-text-primary focus-visible:shadow-focus-ring"
      >
        <PanelLeft className="size-5" />
      </button>
      <span aria-hidden className="h-5 w-px shrink-0 bg-border-strong" />
      <nav aria-label="Fil d’Ariane" className="shrink-0">
        <ol className="flex items-center gap-1.5 text-body">
          {breadcrumb.parent && (
            <>
              <li className="hidden truncate text-text-tertiary sm:block">
                {breadcrumb.parent}
              </li>
              <ChevronRight
                aria-hidden
                className="hidden size-3.5 shrink-0 text-text-tertiary sm:block"
              />
            </>
          )}
          <li
            aria-current="page"
            className="truncate text-body-medium text-text-primary"
          >
            {breadcrumb.page}
          </li>
        </ol>
      </nav>

      <span className="flex-1" />

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="hidden h-9 w-95 min-w-40 shrink-[4] cursor-pointer items-center gap-2 rounded-md bg-surface-muted pr-2 pl-3 text-left outline-none hover:bg-neutral-100 focus-visible:shadow-focus-ring md:flex"
      >
        <Search aria-hidden className="size-4 shrink-0 text-text-tertiary" />
        <span className="min-w-0 flex-1 truncate text-body text-text-placeholder">
          Rechercher une page…
        </span>
        <kbd className="rounded-sm border border-border-strong bg-surface px-1.5 py-0.5 font-sans text-caption text-text-tertiary">
          {shortcut}
        </kbd>
      </button>
      <SearchPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        groups={groups}
      />

      <span aria-hidden className="hidden h-5 w-px shrink-0 bg-border-strong md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-auto w-auto cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent py-1 pr-2 pl-1 text-left outline-none hover:bg-hover focus-visible:shadow-focus-ring aria-expanded:bg-hover"
          >
            <UserAvatar name={name} />
            <span className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-body-medium text-text-primary capitalize">
                {name}
              </span>
              {user?.post && (
                <span className="truncate text-caption text-text-tertiary">
                  {user.post}
                </span>
              )}
            </span>
            <ChevronDown aria-hidden className="hidden size-4 text-text-tertiary sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span>Mon Compte</span>
            <span className="text-caption font-normal text-text-tertiary">
              {user?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/tableau-de-bord/profil">
              <UserRoundIcon />
              Mon profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/tableau-de-bord/changer-mot-de-passe">
              <LockIcon />
              Changer de mot de passe
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={signOut}>
            <LogOutIcon />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
