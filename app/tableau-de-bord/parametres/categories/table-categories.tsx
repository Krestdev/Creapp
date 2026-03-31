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
  ChevronDown,
  Filter,
  LucideEye,
  LucidePen,
  LucideTrash2,
  Search,
  Settings2,
  X,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { getRequestTypeBadge } from "@/lib/utils";
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
import { UpdateCategory } from "./update-category";
import { ViewCategory } from "./view-category";
import { useRouter } from "next/navigation";

interface CategoriesTableProps {
  data: Category[];
  users: Array<User>;
  types: Array<RequestType>;
}

export function TableCategories({ data, users, types }: CategoriesTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // États pour les filtres
  const [searchFilter, setSearchFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [typeSearch, setTypeSearch] = React.useState("");
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const [selectedItem, setSelectedItem] = React.useState<Category | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Récupérer les types uniques pour le filtre
  const uniqueTypes = React.useMemo(() => {
    const typesMap = new Map();
    data.forEach((category) => {
      const typeId = category.type.id;
      if (!typesMap.has(typeId)) {
        typesMap.set(typeId, {
          id: typeId,
          label: getRequestTypeBadge({
            type: category.type.type,
            requestTypes: types,
          }).label,
          type: category.type.type,
        });
      }
    });
    return Array.from(typesMap.values());
  }, [data, types]);

  // Filtrer les données
  const filteredData = React.useMemo(() => {
    return data.filter((category) => {
      // Filtre par recherche
      const matchesSearch =
        searchFilter === "" ||
        category.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchFilter.toLowerCase()));

      // Filtre par type
      const matchesType =
        typeFilter === "all" || category.type.id === parseInt(typeFilter);

      return matchesSearch && matchesType;
    });
  }, [data, searchFilter, typeFilter]);

  // Filtrer les types pour la recherche
  const filteredTypes = React.useMemo(() => {
    if (!typeSearch) return uniqueTypes;
    return uniqueTypes.filter((t) =>
      t.label.toLowerCase().includes(typeSearch.toLowerCase()),
    );
  }, [uniqueTypes, typeSearch]);

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchFilter("");
    setTypeFilter("all");
    setTypeSearch("");
  };

  // Compter le nombre de filtres actifs
  const activeFiltersCount =
    (typeFilter !== "all" ? 1 : 0) + (searchFilter ? 1 : 0);

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
              className="tablehead cursor-pointer flex items-center gap-1"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Nom de la catégorie"}
              <ArrowUpDown className="h-3 w-3" />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium uppercase flex items-center gap-1.5">
              {row.getValue("label")}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center gap-1"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Description"}
              <ArrowUpDown className="h-3 w-3" />
            </span>
          );
        },
        cell: ({ row }) => {
          return (
            <div
              className={`${
                row.getValue("description") ? "" : "italic"
              } first-letter:uppercase lowercase max-w-[400px] truncate`}
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
              className="tablehead cursor-pointer flex items-center gap-1"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Type de catégorie"}
              <ArrowUpDown className="h-3 w-3" />
            </span>
          );
        },
        cell: ({ row }) => {
          const value = row.original.type;
          return (
            <Badge
              variant={
                getRequestTypeBadge({ type: value.type, requestTypes: types })
                  .variant
              }
            >
              {
                getRequestTypeBadge({ type: value.type, requestTypes: types })
                  .label
              }
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="tablehead">{"Actions"}</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const category = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} size="sm">
                  {"Actions"}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(category);
                    setShowDetail(true);
                  }}
                >
                  <LucideEye className="mr-2 h-4 w-4" />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`./categories/${category.id}`);
                  }}
                >
                  <LucidePen className="mr-2 h-4 w-4" />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setSelectedItem(category);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  <LucideTrash2 className="mr-2 h-4 w-4" />
                  {"Supprimer"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, types],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <Settings2 className="mr-2 h-4 w-4" />
              {"Filtres"}
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{"Filtres"}</SheetTitle>
              <SheetDescription>
                {"Filtrer les catégories par type et par recherche"}
              </SheetDescription>
            </SheetHeader>
            <div className="px-5 grid gap-5 mt-6">
              {/* Filtre par type */}
              <div className="grid gap-1.5">
                <Label>{"Type de catégorie"}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {typeFilter === "all"
                          ? "Tous les types"
                          : uniqueTypes.find(
                              (t) => t.id.toString() === typeFilter,
                            )?.label || "Sélectionner"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-[300px] overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-popover z-10 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un type..."
                          className="h-8 pl-8"
                          value={typeSearch}
                          onChange={(e) => setTypeSearch(e.target.value)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        {typeSearch && (
                          <button
                            onClick={() => setTypeSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setTypeFilter("all");
                        setTypeSearch("");
                      }}
                      className={typeFilter === "all" ? "bg-accent" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <span>Tous les types</span>
                      </div>
                    </DropdownMenuItem>
                    {filteredTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.id}
                        onClick={() => {
                          setTypeFilter(type.id.toString());
                          setTypeSearch("");
                        }}
                        className={
                          typeFilter === type.id.toString() ? "bg-accent" : ""
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{type.label}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {filteredTypes.length === 0 && (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Aucun type trouvé
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtre par recherche */}
              <div className="grid gap-1.5">
                <Label>{"Recherche"}</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nom ou description..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-8"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bouton réinitialiser */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0}
                >
                  {"Réinitialiser les filtres"}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-transparent">
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
                      : column.id == "type"
                        ? "Type"
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

      {/* Indicateur de filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            Filtres actifs :
          </span>
          {typeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type:{" "}
              {uniqueTypes.find((t) => t.id.toString() === typeFilter)?.label}
              <button
                onClick={() => setTypeFilter("all")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchFilter && (
            <Badge variant="secondary" className="gap-1">
              Recherche: {searchFilter}
              <button
                onClick={() => setSearchFilter("")}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 text-xs"
          >
            Tout effacer
          </Button>
        </div>
      )}

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
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} catégorie(s)
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedItem && (
        <>
          <DeleteCategory
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            category={selectedItem}
          />
          <ViewCategory
            open={showDetail}
            onOpenChange={setShowDetail}
            category={selectedItem}
            users={users}
          />
          <UpdateCategory
            open={isUpdateModalOpen}
            onOpenChange={setIsUpdateModalOpen}
            category={selectedItem}
            users={users}
            types={types}
          />
        </>
      )}
    </div>
  );
}
