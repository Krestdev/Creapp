"use client";

import * as React from "react";
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
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { RequestModelT } from "@/types/types";
import { Pagination } from "../base/pagination";
import { Label } from "../ui/label";
import { ModalDestockage } from "../modals/modal-Destockage";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface BesoinsTraiterTableProps {
  data: RequestModelT[];
  selected?: Request[];
  setSelected?: React.Dispatch<React.SetStateAction<Request[]>>;
}

export function BesoinsTraiter({
  data,
  selected,
  setSelected,
}: BesoinsTraiterTableProps) {
  const [isOpenModal, setIsModalOpen] = React.useState(false);
  const [select, setSelect] = React.useState<RequestModelT>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
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

  // Synchroniser la sélection interne avec les props externes
  const [internalRowSelection, setInternalRowSelection] = React.useState<
    Record<string, boolean>
  >({});

  // Convertir les données RequestModelT en format Request pour la sélection
  const convertToRequest = (requestModel: RequestModelT): Request => ({
    id: requestModel.id,
    name: requestModel.label,
    dueDate: requestModel.dueDate ? new Date(requestModel.dueDate) : undefined,
  });

  // Synchroniser la sélection externe vers l'interne
  React.useEffect(() => {
    if (selected && setSelected) {
      const externalSelection: Record<string, boolean> = {};
      data.forEach((item, index) => {
        const isSelected = selected.some(
          (selectedItem) => selectedItem.id === item.id
        );
        if (isSelected) {
          externalSelection[index] = true;
        }
      });
      setInternalRowSelection(externalSelection);
    }
  }, [selected, data, setSelected]);

  // Synchroniser la sélection interne vers l'externe
  const handleRowSelectionChange = React.useCallback(
    (updater: any) => {
      const newSelection =
        typeof updater === "function" ? updater(internalRowSelection) : updater;
      setInternalRowSelection(newSelection);

      // Mettre à jour la sélection externe si setSelected est fourni
      if (setSelected) {
        const selectedRows = Object.keys(newSelection)
          .filter((key) => newSelection[key])
          .map((key) => {
            const rowIndex = parseInt(key);
            return data[rowIndex];
          })
          .filter(Boolean)
          .map(convertToRequest);

        setSelected(selectedRows);
      }
    },
    [internalRowSelection, data, setSelected]
  );

  const getSelectedRequestIds = () => {
    return Object.keys(internalRowSelection)
      .filter((key) => internalRowSelection[key])
      .map((key) => {
        const rowIndex = parseInt(key);
        return data[rowIndex]?.id;
      })
      .filter(Boolean);
  };

  const columns: ColumnDef<RequestModelT>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "label",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Titre"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("label")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className=" flex justify-end gap-2">
            {/* Container avec largeur fixe */}
            <Button
              onClick={() => {
                setSelect(item);
                setIsModalOpen(true);
              }}
              className="bg-[#013E7B]"
            >
              {"Déstocker"}
            </Button>
          </div>
        );
      },
    },
  ];

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
    onRowSelectionChange: handleRowSelectionChange, // Utiliser le handler personnalisé
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
      rowSelection: internalRowSelection, // Utiliser l'état interne synchronisé
      globalFilter,
    },
  });

  // Debug: afficher la sélection actuelle
  React.useEffect(() => {
    console.log("Sélection interne:", internalRowSelection);
    console.log("Sélection externe:", selected);
  }, [internalRowSelection, selected]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="w-full flex flex-col gap-1.5">
          <Label htmlFor="search">Rechercher un besoin</Label>
          <Input
            placeholder="Rechercher un besoin"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-[320px] w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              {"Colonnes"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "label"
                      ? "Titre"
                      : column.id === "projectId"
                      ? "Projet"
                      : column.id === "categoryId"
                      ? "Catégorie"
                      : column.id === "userId"
                      ? "Emetteur"
                      : column.id === "beneficiary"
                      ? "Beneficiaire"
                      : null}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="border-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                  className="border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border-none">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}

      <ModalDestockage
        open={isOpenModal}
        onOpenChange={setIsModalOpen}
        data={select!}
      />
    </div>
  );
}
