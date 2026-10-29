"use client"

import * as React from "react"
import { FileText, Paperclip, TriangleAlert, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

/**
 * Zone de dépôt des pièces jointes (Figma · FileDropzone) : glisser-déposer,
 * parcours et — selon le poste — numérisation.
 */
export function FileDropzone({
  onFiles,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = true,
  hint,
  dropLabel,
  className,
}: {
  onFiles?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  hint?: string
  dropLabel?: string
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  function handle(list: FileList | null) {
    if (list && list.length > 0) onFiles?.(Array.from(list))
  }

  return (
    <div
      data-slot="file-dropzone"
      data-drag-over={dragOver || undefined}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handle(e.dataTransfer.files)
      }}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed p-6 text-center transition-colors",
        dragOver
          ? "border-brand bg-brand-subtle"
          : "border-border-strong bg-surface-muted",
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-surface text-brand">
        <Paperclip aria-hidden className="size-5" />
      </span>
      <p className="text-body text-text-primary">
        {dragOver ? (
          (dropLabel ?? "Déposez pour joindre")
        ) : (
          <>
            Glissez vos fichiers ici ou{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xs text-body-strong text-brand underline outline-none focus-visible:shadow-focus-ring"
            >
              parcourir
            </button>
          </>
        )}
      </p>
      <p className="text-caption text-text-tertiary">{hint ?? "PDF, JPG ou PNG · 10 Mo max par fichier"}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

/**
 * Pièce jointe (Figma · FileItem) : `uploading` = barre de progression,
 * `error` = raison claire et remède.
 */
export function FileItem({
  name,
  size,
  state = "done",
  progress = 0,
  error,
  onRemove,
  className,
}: {
  name: string
  size?: string
  state?: "uploading" | "done" | "error"
  /** 0–100, pour `uploading`. */
  progress?: number
  error?: string
  onRemove?: () => void
  className?: string
}) {
  const isError = state === "error"
  return (
    <div
      data-slot="file-item"
      data-state={state}
      className={cn(
        "flex items-center gap-3 rounded-lg border py-2.5 pr-2 pl-3",
        isError
          ? "border-status-danger-border bg-status-danger-bg"
          : "border-border-default bg-surface",
        className
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          isError ? "bg-surface text-status-danger-fg" : "bg-brand-subtle text-brand"
        )}
      >
        {isError ? (
          <TriangleAlert aria-hidden className="size-5" />
        ) : (
          <FileText aria-hidden className="size-5" />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-body-medium text-text-primary">{name}</p>
        {state === "uploading" && (
          <>
            <Progress value={progress} className="gap-0" />
            <p className="text-caption text-text-tertiary">
              {size && `${size} · `}
              {Math.round(progress)} %
            </p>
          </>
        )}
        {state === "done" && size && (
          <p className="text-caption text-text-tertiary">{size}</p>
        )}
        {isError && (
          <p className="text-caption text-status-danger-fg">{error}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${name}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-tertiary outline-none hover:bg-hover hover:text-text-primary focus-visible:shadow-focus-ring"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
