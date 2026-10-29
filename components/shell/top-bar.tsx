"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, LockIcon, LogOutIcon, PanelLeft, UserRoundIcon } from "lucide-react"
import NavigationBreadcrumb from "@/components/navigation/breadcrumb-main"
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

/**
 * Barre supérieure 60 px (Figma · TopBar) : bascule de la sidebar, fil
 * d'Ariane et menu utilisateur (avatar + nom + poste).
 */
export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useStore()
  const router = useRouter()
  const name = user ? `${user.lastName} ${user.firstName}`.trim() : "Utilisateur"

  const signOut = () => {
    logout()
    router.replace("/connexion")
  }

  return (
    <header
      data-slot="top-bar"
      className="sticky top-0 z-30 flex h-15 shrink-0 items-center gap-3 border-b border-border-default bg-surface px-4 sm:gap-4 sm:px-6"
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
      <div className="min-w-0 flex-1 overflow-hidden">
        <NavigationBreadcrumb />
      </div>

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
