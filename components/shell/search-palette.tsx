"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import type { ShellNavGroup } from "./sidebar"

/**
 * Recherche globale (⌘K / Ctrl+K) : liste les pages de la navigation auxquelles
 * l'utilisateur a accès. Une recherche dans les données (besoins, BC,
 * fournisseurs) pourra s'ajouter ici sous forme de groupes supplémentaires.
 */
export function SearchPalette({
  open,
  onOpenChange,
  groups,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: ShellNavGroup[]
}) {
  const router = useRouter()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rechercher une page"
      description="Saisissez le nom d’une page pour y accéder."
      showCloseButton={false}
      className="gap-0 sm:max-w-xl"
    >
      <CommandInput placeholder="Rechercher une page…" />
      <CommandList>
        <CommandEmpty>Aucune page trouvée.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.id} heading={group.title}>
            {group.items.map((item) => {
              const Icon = item.icon ?? group.icon
              return (
                <CommandItem
                  key={item.href}
                  value={`${group.title} ${item.title} ${item.href}`}
                  onSelect={() => {
                    onOpenChange(false)
                    router.push(item.href)
                  }}
                >
                  <Icon />
                  {item.title}
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
