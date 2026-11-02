"use client"

import * as React from "react"
import { ChevronDown, ListFilter, Search, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/** Rangée de filtres d'une liste (Figma · FilterBar) : recherche, puces, « Filtres avancés ». */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="filter-bar"
      className={cn("flex flex-wrap items-center gap-2.5", className)}
    >
      {children}
    </div>
  )
}

/** Pousse les éléments suivants (« Filtres avancés ») à droite de la rangée. */
export function FilterSpacer() {
  return <div aria-hidden className="hidden min-w-px flex-1 sm:block" />
}

export function FilterSearch({
  value,
  onChange,
  placeholder = "Rechercher…",
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label
      className={cn(
        "flex h-[38px] w-full items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-text-tertiary transition-[border-color,box-shadow] focus-within:border-border-focus focus-within:shadow-focus-ring sm:w-80",
        className
      )}
    >
      <Search aria-hidden className="size-[18px] shrink-0" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body text-text-primary outline-none placeholder:text-text-placeholder [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  )
}

/**
 * Puce de filtre « Libellé : valeur » ouvrant la liste des choix. La première
 * option est la valeur neutre (« Tous ») ; tout autre choix colore la puce.
 */
export function FilterChip({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  className?: string
}) {
  const current = options.find((o) => o.value === value) ?? options[0]
  const active = current !== undefined && current.value !== options[0]?.value
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "h-[38px] w-auto cursor-pointer gap-1.5 rounded-lg border bg-surface pr-2.5 pl-3 text-body outline-none transition-colors hover:bg-hover focus-visible:shadow-focus-ring data-[state=open]:bg-hover",
          active
            ? "border-brand bg-brand-subtle"
            : "border-border-default",
          className
        )}
      >
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-secondary">{":"}</span>
        <span className="max-w-40 truncate text-body-medium text-text-primary">
          {current?.label}
        </span>
        <ChevronDown aria-hidden className="size-4 text-text-tertiary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 min-w-48">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              {o.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Filtre actif à retirer (ex. venu d'un indicateur) : « Filtre : Sans paiement ✕ ». */
export function FilterTag({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove: () => void
}) {
  return (
    <span className="flex h-[38px] items-center gap-1.5 rounded-lg border border-brand bg-brand-subtle pr-1.5 pl-3 text-body text-text-primary">
      {children}
      <button
        type="button"
        aria-label="Retirer ce filtre"
        onClick={onRemove}
        className="flex size-6 cursor-pointer items-center justify-center rounded-md text-text-secondary outline-none hover:bg-hover focus-visible:shadow-focus-ring"
      >
        <X aria-hidden className="size-4" />
      </button>
    </span>
  )
}

/**
 * Bouton « Filtres avancés » avec le nombre de filtres actifs. À poser dans un
 * `SheetTrigger asChild`.
 */
export function FilterButton({
  count = 0,
  className,
  children = "Filtres avancés",
  ...props
}: React.ComponentProps<"button"> & { count?: number }) {
  return (
    <button
      type="button"
      data-slot="filter-button"
      className={cn(
        "flex h-[38px] cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface px-3.5 text-body-medium text-text-primary outline-none transition-colors hover:bg-hover focus-visible:shadow-focus-ring",
        className
      )}
      {...props}
    >
      <ListFilter aria-hidden className="size-5" />
      {children}
      {count > 0 && (
        <span className="rounded-full bg-brand px-1.5 py-px text-caption text-text-on-brand">
          {count}
        </span>
      )}
    </button>
  )
}
