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
import { ArrowUpDown, ChevronDown, Eye, LucidePackage } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "../base/pagination";
import { ModalDestockage } from "../modals/modal-Destockage";
import { Label } from "../ui/label";
import { DetailBesoin } from "./detail-besoin";

interface BesoinsTraiterTableProps {
  data: RequestModelT[];
}

export function BesoinsTraiterTable({ data }: BesoinsTraiterTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
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
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalDestockage, setModalDestockage] = React.useState(false);

  const projects = new ProjectQueries();
  const category = new CategoryQueries();
  const users = new UserQueries();

  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => category.getCategories(),
  });

  const getProjectName = (projectId: string) => {
    const project = projectsData.data?.data?.find(
      (proj) => proj.id === Number(projectId)
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.data?.data?.find(
      (cat) => cat.id === Number(categoryId)
    );
    return category?.label || categoryId;
  };

  const getUserName = (userId: string) => {
    const user = usersData.data?.data?.find((u) => u.id === Number(userId));
    return user?.lastName + " " + user?.firstName || userId;
  };

  const getBeneficiaryDisplay = (request: RequestModelT) => {
    if (request.beneficiary === "me") {
      return getUserName(String(request.userId));
    } else if (request.beficiaryList && request.beficiaryList.length > 0) {
      return request.beficiaryList
        .map((ben) => getUserName(String(ben.name)))
        .join(", ");
    }
    return "Aucun bénéficiaire";
  };

  // const getSelectedRequestIds = () => {
  //   return table.getSelectedRowModel().rows.map((row) => row.original.id);
  // };

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
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Titre"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <div>{row.getValue("label")}</div>,
    },
    {
      accessorKey: "projectId",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Projet"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <div>{getProjectName(row.getValue("projectId"))}</div>,
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Catégorie"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <div>{getCategoryName(row.getValue("categoryId"))}</div>
      ),
    },
    {
      accessorKey: "userId",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Émetteur"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <div>{getUserName(row.getValue("userId"))}</div>,
    },
    {
      accessorKey: "beneficiary",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Bénéficiaire"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {getBeneficiaryDisplay(row.original)}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center justify-center w-full"
              asChild
            >
              <Button variant="outline" className="w-fit">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setModalDestockage(true);
                }}
              >
                <LucidePackage className="mr-2 h-4 w-4" />
                {"Destocker"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();

      // Recherche dans toutes les colonnes principales avec conversion des IDs en noms
      const searchableColumns = [
        "label",
        "projectId",
        "categoryId",
        "userId",
        "beneficiary",
      ];

      return searchableColumns.some((columnId) => {
        const rawValue = row.getValue(columnId);
        let displayValue = rawValue;

        // Convertir les IDs en noms pour la recherche
        if (columnId === "projectId") {
          displayValue = getProjectName(String(rawValue));
        } else if (columnId === "categoryId") {
          displayValue = getCategoryName(String(rawValue));
        } else if (columnId === "userId") {
          displayValue = getUserName(String(rawValue));
        } else if (columnId === "beneficiary") {
          displayValue = getBeneficiaryDisplay(row.original);
        }

        return String(displayValue).toLowerCase().includes(searchValue);
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Préparer les données pour les filtres avec mapping ID -> nom
  const uniqueCategories = React.useMemo(() => {
    const categoryMap = new Map();
    data.forEach((item) => {
      const categoryName = getCategoryName(String(item.categoryId));
      categoryMap.set(item.categoryId, categoryName);
    });
    return Array.from(categoryMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data, categoriesData.data]);

  const uniqueProjets = React.useMemo(() => {
    const projectMap = new Map();
    data.forEach((item) => {
      const projectName = getProjectName(String(item.projectId));
      projectMap.set(item.projectId, projectName);
    });
    return Array.from(projectMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [data, projectsData.data]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <div className="grid gap-1.5">
          <Label htmlFor="searchNeed">{"Rechercher"}</Label>
          <Input
            id="searchNeed"
            type="search"
            placeholder="Rechercher par titre, projet, catégorie, émetteur..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="categoryNeed">{"Catégorie"}</Label>
          <Select
            name="categoryNeed"
            value={
              (table.getColumn("categoryId")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("categoryId")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tous"}</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="project">{"Projet"}</Label>
          <Select
            name="project"
            value={
              (table.getColumn("projectId")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("projectId")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par projet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tous"}</SelectItem>
              {uniqueProjets.map((proj) => (
                <SelectItem key={proj.id} value={proj.id}>
                  {proj.name}
                </SelectItem>
              ))}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="border-r last:border-r-0"
                    >
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border-r last:border-r-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
        action={function (): void {
          throw new Error("Function not implemented.");
        }}
        actionButton={"Approuver"}
      />
      <ModalDestockage
        open={modalDestockage}
        onOpenChange={setModalDestockage}
        data={selectedItem}
      />
    </div>
  );
}
