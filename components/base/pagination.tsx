// components/pagination.tsx
import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";

interface PaginationProps<TData> {
  table: Table<TData>;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageInfo?: boolean;
  className?: string;
}

export function Pagination<TData>({
  table,
  pageSize = 15, // Valeur par défaut à 15
  showPageInfo = true,
  className = "",
}: PaginationProps<TData>) {
  // Initialiser la taille de page au montage
  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div className={`flex items-center justify-between px-2 py-4 ${className}`}>
      {/* Contrôles de pagination */}
      <div className="w-full flex items-center justify-end space-x-6">
        {/* Boutons de navigation */}
        <div className="flex items-center space-x-2">
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
          {/* Info de page */}
          {showPageInfo && (
            <div className="flex items-center justify-center text-sm font-medium">
              {`Page ${
                table.getState().pagination.pageIndex + 1
              }/${table.getPageCount()}`}
            </div>
          )}
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
      </div>
    </div>
  );
}
