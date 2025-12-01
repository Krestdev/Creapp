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
import { ModalDestockage } from "../modals/modal-Destockage";
import { CategoryT } from "@/queries/requestModule";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface BesoinsTraiterTableProps {
  data: RequestModelT[];
  selected?: Request[];
  setSelected?: React.Dispatch<React.SetStateAction<Request[]>>;
  categories: CategoryT[];
}

export function BesoinsTraiter({
  data,
  selected,
  setSelected,
  categories,
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

  const getCategoryName = (categoryId: string | number) => {
    const id = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
    const category = categories.find((cat) => cat.id === id);
    return category?.label || String(categoryId);
  };

  const uniqueCategories = React.useMemo(() => {
    if (!data.length || !categories) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];
    return categoryIds.map((categoryId) => {
      const id = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
      const category = categories.find((cat) => cat.id === id);
      return {
        id: String(categoryId), // Toujours stocker en string pour la compatibilité
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [data, categories]);

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
          className="border-gray-500"
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
          className="text-white hover:bg-gray-500"
        >
          {"Titre"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("label")}</div>,
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-white hover:bg-gray-500"
        >
          {"Catégorie"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId");
        return <div>{getCategoryName(categoryId as string | number)}</div>;
      },
      // Fonction de filtrage corrigée
      filterFn: (row, columnId, filterValue) => {
        
        if (!filterValue || filterValue === "all" || filterValue === "") {
          return true;
        }
        
        const rowValue = row.getValue(columnId);
        // Normaliser les deux côtés en string pour la comparaison
        const rowValueStr = String(rowValue);
        const filterValueStr = String(filterValue);
        
        return rowValueStr === filterValueStr;
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-white hover:bg-gray-500"
        >
          {"Date Limite"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{format(row.getValue("dueDate"), "PPP", { locale: fr })}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className=" flex justify-end gap-2">
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
    data: data.reverse() ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
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
      rowSelection: internalRowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="w-full flex flex-row gap-1.5">
          <Input
            placeholder="Rechercher un besoin"
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-[320px] w-full"
          />
          {/* Category filter */}
          <Select
            value={
              (table.getColumn("categoryId")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) => {
              // Définir le filtre avec la valeur sélectionnée
              table.getColumn("categoryId")?.setFilterValue(
                value === "all" ? "" : value
              );
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {uniqueCategories?.map((category) => {
                return (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="capitalize"
                  >
                    {category.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
                            header.getContext()
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
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-none ${
                      index % 2 === 1 ? "bg-gray-200" : ""
                    }`}
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