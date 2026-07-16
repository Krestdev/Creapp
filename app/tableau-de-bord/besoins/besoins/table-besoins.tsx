"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationOptions,
  PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  AsteriskIcon,
  Ellipsis,
  Eye,
  Settings2,
} from "lucide-react";
import * as React from "react";

import Empty from "@/components/base/empty";
import { Pagination } from "@/components/base/pagination";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getRequestTypeBadge, subText, XAF } from "@/lib/utils";
import {
  Category,
  ProjectT,
  REQUEST_STATUS,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Filters, { RequestFiltersProps } from "./filters";
import ViewRequest from "./view-request";

interface Props {
  data: Array<RequestModelT>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  requestTypes: Array<RequestType>;
  users: Array<User>;
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  filters: RequestFiltersProps;
}

export function RequestsTable({
  data,
  categories,
  projects,
  requestTypes,
  users,
  paginationOptions,
  pagination,
  filters,
}: Props) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const [searchText, setSearchText] = React.useState(
    filters.customFilters.search ?? "",
  );

  React.useEffect(() => {
    setSearchText(filters.customFilters.search ?? "");
  }, [filters.customFilters.search]);

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [view, setView] = React.useState(false);

  // Fonction sécurisée pour obtenir la configuration du statut
  const getStatusBadge = (
    status: RequestModelT["state"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
    className?: HTMLButtonElement["className"];
  } => {
    const label =
      REQUEST_STATUS.find((s) => s.value === status)?.name ?? status;
    switch (status) {
      case "cancel":
        return { label, variant: "outline" };
      case "pending":
        return {
          label,
          variant: "amber",
          className: "bg-amber-50 hover:bg-amber-100",
        };
      case "rejected":
        return {
          label,
          variant: "destructive",
          className: "bg-red-50 hover:bg-red-100",
        };
      case "store":
        return {
          label,
          variant: "blue",
          className: "bg-blue-50 hover:bg-blue-100",
        };
      case "validated":
        return {
          label,
          variant: "success",
          className: "bg-green-50 hover:bg-green-100",
        };
    }
  };

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = [
    {
      accessorKey: "ref",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Références"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => row.getValue("ref"),
    },
    {
      accessorKey: "label",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titres"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const original = row.original;
        const modifier = original.requestOlds?.find(
          (r) => r.id !== original.userId,
        );
        const modified = !modifier
          ? false
          : modifier.priority !== original.priority ||
            modifier.amount !== original.amount ||
            modifier.dueDate !== original.dueDate ||
            modifier.quantity !== original.quantity ||
            modifier.unit !== original.unit;
        return (
          <div className="flex items-center gap-1.5 uppercase">
            {!!modified && (
              <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
                <AsteriskIcon size={16} />
              </span>
            )}
            <p className="first-letter:uppercase lowercase">
              {subText({ text: original.label })}
            </p>
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const type = getRequestTypeBadge({
          type: value.type,
          requestTypes: requestTypes,
        });
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Initié par"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <p className="normal-case">
            {subText({
              text: `${row.original.user?.firstName ?? "--"}`,
              length: 21,
            })}
          </p>
        );
      },
    },
    {
      accessorKey: "projectId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const projectId = row.original.projectId;
        const project = projects.find((proj) => proj.id === Number(projectId));
        const title = projectId
          ? (project?.label ?? projectId.toString())
          : "--";
        return (
          <p className="first-letter:uppercase lowercase">
            {subText({ text: title, length: 21 })}
          </p>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Catégories"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        const getCategoryName = (id: number) => {
          return categories.find((x) => x.id === id)?.label || id;
        };
        const category = getCategoryName(Number(categoryId));
        return (
          <p className="first-letter:uppercase lowercase">
            {subText({ text: category.toString(), length: 21 })}
          </p>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Montant"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const amount =
          value.type !== "facilitation"
            ? !!value.amount
              ? XAF.format(value.amount)
              : "Aucun"
            : XAF.format(
                value.benFac?.list?.reduce(
                  (acc, item) => acc + item.amount,
                  0,
                ) || 0,
              );
        return (
          <p
            className={cn(
              "normal-case",
              amount === "N/A" ? "text-muted-foreground" : "font-medium",
            )}
          >
            {amount}
          </p>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date d'émission"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <p className="normal-case">
          {format(new Date(row.getValue("createdAt")), "PP", { locale: fr })}
        </p>
      ),
    },
    {
      accessorKey: "state",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statuts"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const status = row.original.state;
        const { label, variant } = getStatusBadge(status);

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<RequestModelT>({
    data: data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    ...paginationOptions,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  return (
    <div className="content">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="titre ou référence"
            name="search"
            type="search"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              if (event.target.value === "") {
                filters.setCustomFilters({
                  ...filters.customFilters,
                  search: "",
                });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                filters.setCustomFilters({
                  ...filters.customFilters,
                  search: searchText,
                });
              }
            }}
            className="w-full sm:w-[250px] h-9"
          />
          <Button
            onClick={() => {
              filters.setCustomFilters({
                ...filters.customFilters,
                search: searchText,
              });
            }}
            className="h-9"
          >
            {"Rechercher"}
          </Button>
          <Sheet>
            <SheetTrigger asChild className="w-fit">
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent className="px-3">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <Filters
                customFilters={filters.customFilters}
                setCustomFilters={filters.setCustomFilters}
                isCustomDateModalOpen={filters.isCustomDateModalOpen}
                setIsCustomDateModalOpen={filters.setIsCustomDateModalOpen}
                setDateFilter={(filter) =>
                  filters.setCustomFilters({
                    ...filters.customFilters,
                    date: filter,
                  })
                }
                resetAllFilters={filters.resetAllFilters}
                uniqueCategories={filters.uniqueCategories}
                uniqueProjects={filters.uniqueProjects}
                users={filters.users}
                requestTypes={filters.requestTypes}
              />
            </SheetContent>
          </Sheet>
        </div>
        {/* Colonne de visibilité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
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
                    {column.id === "ref"
                      ? "Références"
                      : column.id === "label"
                        ? "Titres"
                        : column.id === "type"
                          ? "Type"
                          : column.id === "state"
                            ? "Statuts"
                            : column.id === "projectId"
                              ? "Projets"
                              : column.id === "categoryId"
                                ? "Catégories"
                                : column.id === "userId"
                                  ? "Initié par"
                                  : column.id === "createdAt"
                                    ? "Date d'émission"
                                    : column.id === "amount"
                                      ? "Montant"
                                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    // if (header.column.)
                    return (
                      <TableHead key={header.id}>
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
              {table.getRowModel().rows.map((row) => {
                const status = row.original.state;
                const { className } = getStatusBadge(status);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(className)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty message={"Aucun besoin enregistré"} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && <Pagination table={table} />}
      {selectedItem && (
        <ViewRequest
          open={view}
          openChange={setView}
          users={users}
          reqId={selectedItem.id}
          requestTypes={requestTypes}
        />
      )}
    </div>
  );
}
