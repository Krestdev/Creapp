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
import { ArrowUpDown, Ellipsis, Eye, Pen } from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestModelT, RequestType } from "@/types/types";
import { ShowRequestType } from "./ShowRequestType";
import { UpdateRequestType } from "./UpdateRequestType";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface BesoinsTraiterTableProps {
  data: RequestType[];
}

export function TypeTable({ data }: BesoinsTraiterTableProps) {
  const [isOpenModal, setIsModalOpen] = React.useState(false);
  const [isOpenModalEdit, setIsModalOpenEdit] = React.useState(false);
  const [select, setSelect] = React.useState<RequestType>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      titre: true,
      projet: true,
      category: true,
      emetteur: true,
      beneficiaires: true,
    });
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Convertir les données RequestModelT en format Request pour la sélection
  const convertToRequest = React.useCallback(
    (requestModel: RequestModelT): Request => ({
      id: requestModel.id,
      name: requestModel.label,
      dueDate: requestModel.dueDate
        ? new Date(requestModel.dueDate)
        : undefined,
    }),
    [],
  );

  const qteunt = (qte: number, unt: string) => `${qte} ${unt}`;

  const columns: ColumnDef<RequestType>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="tablehead"
        >
          {"Titre"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <p className="normal-case">{row.getValue("label")}</p>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="tablehead"
        >
          {"Description"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        return <div>{row.getValue("description")}</div>;
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all" || filterValue === "") {
          return true;
        }

        const rowValue = row.getValue(columnId);
        const rowValueStr = String(rowValue);
        const filterValueStr = String(filterValue);

        return rowValueStr === filterValueStr;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelect(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelect(item);
                  setIsModalOpenEdit(true);
                }}
              >
                <Pen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const searchableColumns = ["label"];
      return searchableColumns.some((columnId) => {
        const rawValue = row.getValue(columnId);
        return String(rawValue).toLowerCase().includes(searchValue);
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md">
        <Table>
          <TableHeader className="bg-gray-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="border-none">
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
          <TableBody className="border shadow bg-white">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => {
                return (
                  <TableRow
                    key={row.id}
                    className={`border-none ${
                      index % 2 === 1 ? "bg-gray-200" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="border-none">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-none">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center border-none"
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && <Pagination table={table} />}

      <ShowRequestType
        open={isOpenModal}
        onOpenChange={setIsModalOpen}
        data={select}
      />
      <UpdateRequestType
        open={isOpenModalEdit}
        onOpenChange={setIsModalOpenEdit}
        data={select}
      />
    </div>
  );
}
