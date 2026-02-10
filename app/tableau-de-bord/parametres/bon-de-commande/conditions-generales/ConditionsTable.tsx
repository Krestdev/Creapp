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
import { ArrowUpDown, ChevronDown, EyeIcon, Pencil, Trash2 } from "lucide-react";
import * as React from "react";

import { ModalWarning } from "@/components/modals/modal-warning";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { CommandConditionQ } from "@/queries/commandsConditions";
import { CommandCondition } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import UpdateCondition from "./update-condition";
import ViewCondition from "./view-condition";

interface ConditionsTableProps {
  data: CommandCondition[];
}

export function ConditionsTable({ data }: ConditionsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [selectedItem, setSelectedItem] = React.useState<CommandCondition>();
  const [view, setView] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [remove, setRemove] = React.useState(false);

  const deleteCondition = useMutation({
    mutationFn: (id: number) => CommandConditionQ.delete(id),
    onError: (error) => {
      toast.error(
        "Une erreur est survenue lors de la suppression de la condition.",
      );
      console.error(error);
    },
  });

  const columns = React.useMemo<ColumnDef<CommandCondition>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Titre"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium uppercase flex items-center gap-1.5">
              {row.getValue("title")}
            </div>
          );
        },
      },
      {
        accessorKey: "content",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Contenu"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="max-w-[50vw] truncate">
              {row.getValue("content")}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        size: 50,
        cell: ({ row }) => {
          const conditions = row.original;

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
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(conditions);
                    setView(true);
                  }}
                >
                  <EyeIcon />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(conditions);
                    setEdit(true);
                  }}
                >
                  <Pencil />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setSelectedItem(conditions);
                    setRemove(true);
                  }}
                >
                  <Trash2 />
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
          placeholder="Rechercher par nom"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
          type="search"
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
                    ? "Nom de la condition"
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
            <ChevronsLeft />
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
            <ChevronRight />
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
      {selectedItem && (
        <>
          <ViewCondition
            open={view}
            openChange={setView}
            condition={selectedItem}
          />
          <UpdateCondition
            open={edit}
            openChange={setEdit}
            data={selectedItem}
          />
          <ModalWarning
            open={remove}
            onOpenChange={setRemove}
            title={`Supprimer ${selectedItem.title}`}
            description="Êtes-vous sûr de vouloir supprimer cette condition ?"
            message={`Vous êtes sur le point de supprimer ${selectedItem.title}. Cette action est irreversible`}
            onAction={() => deleteCondition.mutate(selectedItem.id)}
            actionText="Supprimer"
            variant="error"
          />
        </>
      )}
    </div>
  );
}
