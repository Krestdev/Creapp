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
import { ArrowUpDown } from "lucide-react";
import * as React from "react";

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
import { Category, RequestModelT } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Pagination } from "../base/pagination";
import { ModalDestockage } from "../modals/modal-Destockage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Request {
  id: number;
  name: string;
  dueDate?: Date;
}

interface BesoinsTraiterTableProps {
  data: RequestModelT[];
  selected?: Request[];
  setSelected?: React.Dispatch<React.SetStateAction<Request[]>>;
  categories: Category[];
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

  // Convertir les données RequestModelT en format Request pour la sélection
  const convertToRequest = React.useCallback(
    (requestModel: RequestModelT): Request => ({
      id: requestModel.id,
      name: requestModel.label,
      dueDate: requestModel.dueDate
        ? new Date(requestModel.dueDate)
        : undefined,
    }),
    []
  );

  // Créer un mapping ID -> Request pour un accès rapide
  const requestMap = React.useMemo(() => {
    const map = new Map<number, RequestModelT>();
    data.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [data]);

  // Synchroniser la sélection interne avec les props externes
  const [internalSelectedIds, setInternalSelectedIds] = React.useState<
    Set<number>
  >(new Set());

  // Mettre à jour internalSelectedIds quand selected change
  React.useEffect(() => {
    if (selected) {
      const newIds = new Set<number>();
      selected.forEach((item) => {
        newIds.add(item.id);
      });
      setInternalSelectedIds(newIds);
    } else {
      setInternalSelectedIds(new Set());
    }
  }, [selected]);

  // Gérer le changement de sélection via les checkboxes
  const handleCheckboxChange = React.useCallback(
    (requestId: number, isChecked: boolean) => {
      const newIds = new Set(internalSelectedIds);

      if (isChecked) {
        newIds.add(requestId);
      } else {
        newIds.delete(requestId);
      }

      setInternalSelectedIds(newIds);

      // Mettre à jour la sélection externe si setSelected est fourni
      if (setSelected) {
        const selectedRequests = Array.from(newIds)
          .map((id) => requestMap.get(id))
          .filter((item): item is RequestModelT => item !== undefined)
          .map(convertToRequest);
        setSelected(selectedRequests);
      }
    },
    [internalSelectedIds, requestMap, convertToRequest, setSelected]
  );

  // Gérer la sélection/désélection de toutes les lignes
  const handleSelectAllChange = React.useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        // Sélectionner toutes les lignes
        const allIds = new Set<number>();
        data.forEach((item) => {
          allIds.add(item.id);
        });

        setInternalSelectedIds(allIds);

        // Mettre à jour la sélection externe
        if (setSelected) {
          const allRequests = data.map(convertToRequest);
          setSelected(allRequests);
        }
      } else {
        // Désélectionner toutes les lignes
        setInternalSelectedIds(new Set());

        // Mettre à jour la sélection externe
        if (setSelected) {
          setSelected([]);
        }
      }
    },
    [data, convertToRequest, setSelected]
  );

  const getCategoryName = (categoryId: string | number) => {
    const id = typeof categoryId === "string" ? Number(categoryId) : categoryId;
    const category = categories.find((cat) => cat.id === id);
    return category?.label || String(categoryId);
  };

  const uniqueCategories = React.useMemo(() => {
    if (!data.length || !categories) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];
    return categoryIds.map((categoryId) => {
      const id =
        typeof categoryId === "string" ? Number(categoryId) : categoryId;
      const category = categories.find((cat) => cat.id === id);
      return {
        id: String(categoryId),
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [data, categories]);

  const columns: ColumnDef<RequestModelT>[] = [
    {
      id: "select",
      header: () => {
        const allSelected =
          data.length > 0 && internalSelectedIds.size === data.length;
        const someSelected = internalSelectedIds.size > 0 && !allSelected;

        return (
          <Checkbox
            checked={allSelected || (someSelected && "indeterminate")}
            onCheckedChange={(value) => handleSelectAllChange(!!value)}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => {
        const requestId = row.original.id;
        const isSelected = internalSelectedIds.has(requestId);

        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) =>
              handleCheckboxChange(requestId, !!value)
            }
            aria-label="Select row"
            className="border-gray-500"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "label",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="bg-transparent text-black hover:bg-transparent"
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
          className="bg-transparent text-black hover:bg-transparent"
        >
          {"Catégorie"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId");
        return <div>{getCategoryName(categoryId as string | number)}</div>;
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
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="bg-transparent text-black hover:bg-transparent"
        >
          {"Date Limite"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{format(row.getValue("dueDate"), "PPP", { locale: fr })}</div>
      ),
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
    data: data, // NE PAS utiliser reversedData ici
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
      <div className="w-full flex flex-wrap gap-1.5 py-4">
        <Input
          placeholder="Rechercher un besoin"
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-[320px] w-full"
        />
        {/* Category filter */}
        <Select
          value={
            (table.getColumn("categoryId")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) => {
            table
              .getColumn("categoryId")
              ?.setFilterValue(value === "all" ? "" : value);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="md:ml-auto bg-transparent">
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
                      : column.id === "dueDate"
                      ? "Date limite"
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
