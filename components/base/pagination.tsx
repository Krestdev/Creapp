// components/pagination.tsx
import { TablePagination } from "@/components/ds/table-pagination";
import { Table } from "@tanstack/react-table";

interface PaginationProps<TData> {
  table: Table<TData>;
  /** Conservé pour compatibilité : la page courante est toujours indiquée. */
  showPageInfo?: boolean;
  className?: string;
  /** Pluriel de l'objet listé (« factures », « comptes »…). */
  noun?: string;
}

/**
 * Pagination d'un tableau TanStack, au design du DS (Figma · Pagination) :
 * « 1–10 sur 95 résultats », lignes par page et pages numérotées.
 */
export function Pagination<TData>({
  table,
  className = "",
  noun = "résultats",
}: PaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  return (
    <TablePagination
      // Pagination serveur : le total vient de `rowCount`, pas de la page chargée.
      total={
        table.options.manualPagination
          ? table.getRowCount()
          : table.getFilteredRowModel().rows.length
      }
      page={pageIndex + 1}
      pageSize={pageSize}
      onPageChange={(page) => table.setPageIndex(page - 1)}
      onPageSizeChange={(size) => table.setPageSize(size)}
      noun={noun}
      className={className}
    />
  );
}
