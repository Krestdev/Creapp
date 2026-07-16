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
import { ArrowUpDown, CheckCheckIcon, Ellipsis, EyeIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { Category, RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
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
import { DetailBesoin } from "./detail-besoin";

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
  isHome?: boolean;
}

export function BesoinsTraiter({
  data,
  selected,
  setSelected,
  categories,
  isHome,
}: BesoinsTraiterTableProps) {
  // const { user } = useStore();

  const projectsData = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const usersData = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  // const isUserLastValidatorForRequest = (request: RequestModelT): boolean => {
  //   const rank = request.validators.find((v) => v.userId === user?.id)?.rank;
  //   return !!rank && !request.validators.some((x) => x.rank > rank);
  // };

  // const getValidationInfo = (request: RequestModelT) => {
  //   const userPosition = request.validators.find(
  //     (v) => v.userId === user?.id,
  //   )?.rank;
  //   const isLastValidator = isUserLastValidatorForRequest(request);
  //   const categoryName = getCategoryName(String(request.categoryId));

  //   const totalValidators = request.validators.length;
  //   const validatedCount = request.validators.filter(
  //     (v) => v.validated === true,
  //   ).length;

  //   return {
  //     userPosition,
  //     isLastValidator,
  //     categoryName,
  //     totalValidators,
  //     validatedCount,
  //     progress:
  //       totalValidators > 0 ? (validatedCount / totalValidators) * 100 : 0,
  //     canValidate:
  //       request.state === "pending" &&
  //       request.validators.find((v) => v.rank === userPosition)?.validated ===
  //         false,
  //   };
  // };

  const [isOpenModal, setIsModalOpen] = React.useState(false);
  const [isOpenModalView, setIsModalOpenView] = React.useState(false);
  const [select, setSelect] = React.useState<RequestModelT>();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
      createdAt: false,
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
    [internalSelectedIds, requestMap, convertToRequest, setSelected],
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
    [data, convertToRequest, setSelected],
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

  const qteunt = (qte: number, unt: string) => `${qte} ${unt}`;

  const columns: ColumnDef<RequestModelT>[] = [
    {
      id: "select",
      header: () => {
        const allSelected =
          data.length > 0 && internalSelectedIds.size === data.length;
        const someSelected = internalSelectedIds.size > 0 && !allSelected;

        return (
          !isHome && (
            <Checkbox
              checked={allSelected || (someSelected && "indeterminate")}
              onCheckedChange={(value) => handleSelectAllChange(!!value)}
              aria-label="Select all"
            />
          )
        );
      },
      cell: ({ row }) => {
        const requestId = row.original.id;
        const isSelected = internalSelectedIds.has(requestId);

        {
          return (
            !isHome && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(value) =>
                  handleCheckboxChange(requestId, !!value)
                }
                aria-label="Select row"
                className="border-gray-500"
              />
            )
          );
        }
      },
      enableSorting: false,
      enableHiding: false,
    },
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
      cell: ({ row }) => (
        <p className="max-w-[300px] truncate">{row.getValue("label")}</p>
      ),
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="tablehead"
        >
          {"Catégorie"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId");
        return getCategoryName(categoryId as string | number);
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
      id: "fullName",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Quantité"}
          <ArrowUpDown />
        </span>
      ),

      accessorFn: (row) => qteunt(row.quantity, row.unit),

      cell: ({ row }) => {
        const fullName = row.getValue("fullName") as string;
        return fullName;
      },

      sortingFn: (rowA, rowB) => {
        const nameA = qteunt(rowA.original.quantity, rowA.original.unit);
        const nameB = qteunt(rowB.original.quantity, rowB.original.unit);

        return nameA.localeCompare(nameB, "fr", {
          sensitivity: "base",
        });
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="tablehead"
        >
          {"Date de création"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <p className="normal-case">
          {format(row.getValue("createdAt"), "PPP", { locale: fr })}
        </p>
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="tablehead"
        >
          {"Date Limite"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <p className="normal-case">
          {format(row.getValue("dueDate"), "PPP", { locale: fr })}
        </p>
      ),
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
            <DropdownMenuContent>
              <DropdownMenuItem
                variant={"destructive"}
                onClick={() => {
                  setSelect(item);
                  setIsModalOpen(true);
                }}
              >
                <CheckCheckIcon />
                {"Déstocker le besoin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelect(item);
                  setIsModalOpenView(true);
                }}
              >
                <EyeIcon />
                {"Voir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
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
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 py-2 px-4 text-xs font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = internalSelectedIds.has(row.original.id);
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary-50 hover:bg-primary-50/80"
                        : "hover:bg-gray-50",
                    )}
                    onClick={() =>
                      handleCheckboxChange(row.original.id, !isSelected)
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2 px-4"
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest(
                              'button[role="checkbox"]',
                            ) ||
                            (e.target as HTMLElement).closest(
                              "[data-radix-collection-item]",
                            )
                          ) {
                            e.stopPropagation();
                          }
                        }}
                      >
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination table={table} />

      {select &&
        projectsData.isSuccess &&
        usersData.isSuccess &&
        getReceptions.isSuccess &&
        getPurchases.isSuccess && (
          <>
            <ModalDestockage
              open={isOpenModal}
              onOpenChange={setIsModalOpen}
              data={select}
            />
            <DetailBesoin
              open={isOpenModalView}
              onOpenChange={setIsModalOpenView}
              data={select}
              projects={projectsData.data.data}
              users={usersData.data.data}
              receptions={getReceptions.data.data}
              purchaseOrders={getPurchases.data.data}
            />
          </>
        )}
    </div>
  );
}
