"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ds/empty-state"
import { cn } from "@/lib/utils"

export type DataColumn<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  /** Valeur de tri ; sans elle la colonne n'est pas triable. */
  sortValue?: (row: T) => string | number
  align?: "left" | "right"
  className?: string
}

/**
 * Tableau de données du DS : colonnes déclaratives, tri au clic sur
 * l'en-tête, sélection multiple (case d'en-tête indéterminée si partielle)
 * à coupler avec `BulkActionBar`.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  selectable,
  selectedIds,
  onSelectedIdsChange,
  onRowClick,
  emptyState,
  className,
}: {
  columns: DataColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  selectable?: boolean
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  className?: string
}) {
  const [sort, setSort] = React.useState<{
    key: string
    dir: "asc" | "desc"
  } | null>(null)
  const [internalSelected, setInternalSelected] = React.useState<string[]>([])
  const selected = selectedIds ?? internalSelected
  const setSelected = onSelectedIdsChange ?? setInternalSelected

  const sorted = React.useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key)
    if (!sort || !column?.sortValue) return rows
    const value = column.sortValue
    const factor = sort.dir === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const va = value(a)
      const vb = value(b)
      if (va === vb) return 0
      return (va > vb ? 1 : -1) * factor
    })
  }, [rows, columns, sort])

  const ids = rows.map(getRowId)
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id))
  const someSelected = !allSelected && ids.some((id) => selected.includes(id))

  function toggleSort(key: string) {
    setSort((current) =>
      current?.key !== key
        ? { key, dir: "asc" }
        : current.dir === "asc"
          ? { key, dir: "desc" }
          : null
    )
  }

  function toggleRow(id: string, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter((s) => s !== id))
  }

  if (rows.length === 0 && emptyState) return <>{emptyState}</>
  if (rows.length === 0)
    return <EmptyState title="Aucun résultat" description="Modifiez vos filtres." />

  return (
    <div
      data-slot="data-table"
      className={cn(
        "overflow-hidden rounded-lg border border-border-default bg-surface",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-t-0 hover:bg-transparent">
            {selectable && (
              <TableHead>
                <Checkbox
                  aria-label="Tout sélectionner"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v === true ? ids : [])}
                />
              </TableHead>
            )}
            {columns.map((c) => {
              const sortable = Boolean(c.sortValue)
              const active = sort?.key === c.key
              return (
                <TableHead
                  key={c.key}
                  aria-sort={
                    active
                      ? sort?.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(c.align === "right" && "text-right", c.className)}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-xs outline-none hover:text-text-primary focus-visible:shadow-focus-ring",
                        active && "text-text-primary",
                        c.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {c.header}
                      {active ? (
                        sort?.dir === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-60" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => {
            const id = getRowId(row)
            const isSelected = selected.includes(id)
            return (
              <TableRow
                key={id}
                data-state={isSelected ? "selected" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      aria-label={`Sélectionner ${id}`}
                      checked={isSelected}
                      onCheckedChange={(v) => toggleRow(id, Boolean(v))}
                    />
                  </TableCell>
                )}
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    className={cn(c.align === "right" && "text-right", c.className)}
                  >
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
