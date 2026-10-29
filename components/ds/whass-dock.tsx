"use client"

import * as React from "react"
import { ArrowUp, Mic, Plus } from "lucide-react"
import { WhassLogo } from "@/components/ds/whass-logo"
import { cn } from "@/lib/utils"

const roundButton =
  "flex size-10 shrink-0 items-center justify-center rounded-[26px] border border-white/90 bg-white/90 text-text-primary outline-none transition-colors hover:bg-white focus-visible:shadow-focus-ring"

/**
 * Assistant Whass IA (Figma · WhassAI). Dock de saisie ancré en bas du right
 * rail : champ « Dites-moi en quoi je peux vous aider… », pièce jointe, micro,
 * envoi.
 *
 * - `closed` (défaut, dans le rail) : champ seul, une seule ligne de contrôles.
 * - `open` : en-tête « Demandez à Whass », suggestions et champ en verre.
 *
 * Brancher l'assistant via `onSend` ; sans lui le dock reste inerte.
 */
export function WhassDock({
  variant = "closed",
  suggestions,
  onSend,
  className,
}: {
  variant?: "closed" | "open"
  suggestions?: string[]
  onSend?: (message: string) => void
  className?: string
}) {
  const inputId = React.useId()
  const [value, setValue] = React.useState("")
  const open = variant === "open"

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const message = value.trim()
    if (!message) return
    onSend?.(message)
    setValue("")
  }

  const field = (
    <>
      <label className="sr-only" htmlFor={inputId}>
        Message pour Whass IA
      </label>
      <input
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Dites-moi en quoi je peux vous aider ..."
        autoComplete="off"
        className={cn(
          "w-full bg-transparent text-text-secondary outline-none placeholder:text-text-secondary/80",
          open ? "text-body" : "text-body-large"
        )}
      />
      <div className="flex w-full items-center justify-between">
        <button type="button" aria-label="Joindre un fichier" className={roundButton}>
          <Plus className="size-4" />
        </button>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Dicter un message" className={roundButton}>
            <Mic className="size-5" />
          </button>
          <button
            type="submit"
            aria-label="Envoyer"
            disabled={!value.trim()}
            className={cn(roundButton, "disabled:opacity-100")}
          >
            <ArrowUp className="size-5" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <form
      onSubmit={submit}
      data-slot="whass-dock"
      data-variant={variant}
      className={cn(
        "flex flex-col gap-8 overflow-hidden rounded-[32px] border border-border-default bg-gradient-whass-dock p-6",
        className
      )}
    >
      {open && (
        <div className="flex items-center gap-1">
          <WhassLogo size={32} />
          <span className="text-body-strong text-text-primary">
            Demandez à Whass
          </span>
        </div>
      )}
      {open && suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend?.(s)}
              className="rounded-[26px] border border-white/60 bg-white/50 px-3 py-3 text-left text-body text-text-secondary outline-none transition-colors hover:bg-white/90 focus-visible:shadow-focus-ring"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {open ? (
        <div className="flex flex-col gap-6 rounded-3xl bg-white/25 px-4 pt-6 pb-4 shadow-[0_4px_14px_rgb(158_19_81/0.05)] backdrop-blur-[7px]">
          {field}
        </div>
      ) : (
        field
      )}
    </form>
  )
}
