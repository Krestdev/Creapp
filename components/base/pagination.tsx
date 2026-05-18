// components/pagination.tsx
import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps<TData> {
  table: Table<TData>;
  showPageInfo?: boolean;
  className?: string;
}

export function Pagination<TData>({
  table,
  showPageInfo = true,
  className = "",
}: PaginationProps<TData>) {

  return (
    <div className={`flex items-center justify-end px-2 py-4 gap-2 ${className}`}>
      {/* Info de page */}
      {showPageInfo && (
        <div className="flex items-center justify-center text-sm font-medium">
          {`Page ${
            table.getState().pagination.pageIndex + 1
          }/${table.getPageCount()}`}
        </div>
      )}
      {/* Boutons de navigation */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
        aria-label="Première page"
      >
        <ChevronsLeft />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        aria-label="Page précédente"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        aria-label="Page suivante"
      >
        <ChevronRight />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
        aria-label="Dernière page"
      >
        <ChevronsRight />
      </Button>
    </div>
  );
}
