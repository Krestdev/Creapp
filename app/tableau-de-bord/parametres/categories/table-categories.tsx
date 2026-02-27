"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  AsteriskIcon,
  ChevronDown,
  LucideEye,
  LucidePen,
  LucideTrash2
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryQ } from "@/queries/categoryModule";
import { Category, RequestType, User } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteCategory } from "./delete-category";
import { ViewCategory } from "./view-category";
import { UpdateCategory } from "./update-category";
import { Badge } from "@/components/ui/badge";


interface CategoriesTableProps {
  data: Category[];
  users: Array<User>;
  types: Array<RequestType>;
}

export function TableCategories({ data, users, types }: CategoriesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<Category | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const categoryData = useMutation({
    mutationFn: (id: number) => categoryQ.deleteCategory(id),
    onError: (error) => {
      toast.error(
        "Une erreur est survenue lors de la suppression de la categorie.",
      );
      console.error(error);
    },
  });

  const columns = React.useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Nom de la catégorie"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          return(
          <div className="font-medium uppercase flex items-center gap-1.5">{row.getValue("label")}</div>
        )},
      },
      {
        accessorKey: "description",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Description"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div
              className={`${row.getValue("description") ? "" : "italic"
                } first-letter:uppercase lowercase`}
            >
              {row.getValue("description")
                ? row.getValue("description")
                : "aucune description"}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Type de catégorie"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
            const value = row.original.type;
          return (
            <Badge variant={value.type === "achat" ? "blue" : value.type === "others" ? "purple" : "outline"}>{value.label}</Badge>
          );
        },
      },
      {
        id: "actions",
        header: ()=><span className="tablehead">{"Actions"}</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const categories = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"}>
                  {"Actions"}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(categories);
                    setShowDetail(true);
                  }}
                >
                  <LucideEye/>
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(categories);
                    setIsUpdateModalOpen(true);
                  }}
                >
                  <LucidePen />
                  {"Modifier"}
                </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setSelectedItem(categories);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <LucideTrash2 />
                    {"Supprimer"}
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const name = row.getValue("label") as string;

      return name.toLowerCase().includes(search);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Rechercher par nom de la catégorie..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              {"Colonnes"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const text =
                  column.id == "label"
                    ? "Nom catégorie"
                    : column.id == "description"
                      ? "Description"
                      : "";
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {text}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        index < headerGroup.headers.length - 1 ? "border-r" : ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                // className={getRowClassName(row.original.status)}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={
                        index < row.getVisibleCells().length - 1
                          ? "border-r"
                          : ""
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {"Aucun résultat."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft/>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight/>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
      {
        selectedItem &&
        <>
        <DeleteCategory open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} category={selectedItem} />
        <ViewCategory open={showDetail} onOpenChange={setShowDetail} category={selectedItem} users={users} />
        <UpdateCategory open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen} category={selectedItem} users={users} types={types} />
        </>
      }
    </div>
  );
}
