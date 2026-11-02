"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Pages à afficher : toutes jusqu'à 7, sinon début, voisinage de la page, fin. */
function pageItems(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const items: Array<number | "gap"> = [1]
  const from = Math.max(2, page - 1)
  const to = Math.min(pageCount - 1, page + 1)
  if (from > 2) items.push("gap")
  for (let p = from; p <= to; p++) items.push(p)
  if (to < pageCount - 1) items.push("gap")
  items.push(pageCount)
  return items
}

const pageButton =
  "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-body-medium transition-colors outline-none focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:text-text-disabled"

/**
 * Pied de tableau (Figma · Pagination) : « 1–10 sur 95 factures », lignes par
 * page, pages numérotées. `noun` est le pluriel de l'objet listé.
 */
export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  noun = "résultats",
  nounSingular,
  pageSizes = [10, 20, 50, 100],
  className,
}: {
  total: number
  /** Page courante, à partir de 1. */
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  noun?: string
  /** Singulier de `noun`, utilisé quand il n'y a qu'un élément. */
  nounSingular?: string
  pageSizes?: number[]
  className?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pageCount)
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1
  const to = Math.min(total, current * pageSize)

  return (
    <div
      data-slot="table-pagination"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3",
        className
      )}
    >
      <p className="min-w-0 flex-1 text-body text-text-secondary">
        {total === 0 ? `0 ${noun}` : `${from}–${to} sur ${total} ${total === 1 && nounSingular ? nounSingular : noun}`}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-caption text-text-tertiary">
          {"Lignes par page"}
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger
            aria-label="Lignes par page"
            className="h-8 w-auto min-w-16 gap-1 rounded-md px-2.5 text-body-medium"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Page précédente"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          className={cn(
            pageButton,
            "border border-border-default bg-surface hover:bg-hover"
          )}
        >
          <ChevronLeft className="size-5" />
        </button>
        {pageItems(current, pageCount).map((item, i) =>
          item === "gap" ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="flex size-8 items-center justify-center text-text-tertiary"
            >
              {"…"}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === current ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                pageButton,
                item === current
                  ? "bg-brand text-text-on-brand"
                  : "border border-border-default bg-surface text-text-primary hover:bg-hover"
              )}
            >
              {item}
            </button>
          )
        )}
        <button
          type="button"
          aria-label="Page suivante"
          disabled={current >= pageCount}
          onClick={() => onPageChange(current + 1)}
          className={cn(
            pageButton,
            "border border-border-default bg-surface hover:bg-hover"
          )}
        >
          <ChevronRight className="size-5" />
        </button>
      </nav>
    </div>
  )
}
