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
import { AsteriskIcon, Eye, EllipsisVertical } from "lucide-react";
import * as React from "react";

import Empty from "@/components/base/empty";
import { Pagination } from "@/components/base/pagination";
import { FilterButton, FilterSearch } from "@/components/ds/filter-bar";
import { UserAvatar } from "@/components/ds/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Category,
  ProjectT,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import {
  REQUEST_COLUMN_CLASS,
  RequestCell,
  RequestStatusPill,
  RequestTypePill,
  requestRowClass,
} from "@/components/besoin/request-table-ui";
import Filters, { RequestFiltersProps } from "./filters";
// TEMPORAIRE : à retirer avec le bouton "Modifier la date" ci-dessous.
import EditDueDateTemp from "./edit-due-date-temp";
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

const COLUMN_LABELS: Record<string, string> = {
  besoin: "Besoin",
  userId: "Demandeur",
  type: "Type",
  projectId: "Projet",
  categoryId: "Catégorie",
  amount: "Montant (XAF)",
  createdAt: "Date d'émission",
  state: "Statut",
};

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
  // TEMPORAIRE : à retirer avec le bouton "Modifier la date" ci-dessous.
  const [editDate, setEditDate] = React.useState(false);

  const advancedCount = [
    filters.customFilters.user,
    filters.customFilters.category,
    filters.customFilters.project,
    filters.customFilters.status,
    filters.customFilters.type,
  ].filter((v) => v !== "all").length +
    (filters.customFilters.date ? 1 : 0);

  const submitSearch = () =>
    filters.setCustomFilters({ ...filters.customFilters, search: searchText });

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = [
    {
      id: "besoin",
      accessorKey: "label",
      enableHiding: false,
      header: () => "Besoin",
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
          <RequestCell
            reference={original.ref}
            label={original.label}
            marker={
              !!modified && (
                <span
                  title="Besoin modifié"
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm border border-amber-200 bg-amber-600 text-white"
                >
                  <AsteriskIcon size={14} />
                </span>
              )
            }
          />
        );
      },
    },
    {
      accessorKey: "userId",
      header: () => "Demandeur",
      cell: ({ row }) => {
        const author = users.find((u) => u.id === row.original.userId);
        const name = author
          ? `${author.firstName} ${author.lastName}`
          : `${row.original.user?.firstName ?? "--"} ${row.original.user?.lastName ?? ""}`.trim();
        return (
          <div className="flex items-center gap-2">
            <UserAvatar name={name} size="sm" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body-medium text-text-primary">
                {name}
              </span>
              {author?.service?.label && (
                <span className="truncate text-caption text-text-tertiary">
                  {author.service.label}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: () => "Type",
      cell: ({ row }) => (
        <RequestTypePill type={row.original.type} requestTypes={requestTypes} />
      ),
    },
    {
      accessorKey: "projectId",
      header: () => "Projet",
      cell: ({ row }) => {
        const projectId = row.original.projectId;
        const project = projects.find((proj) => proj.id === Number(projectId));
        return (
          <span className="line-clamp-1 text-body text-text-secondary">
            {projectId ? (project?.label ?? projectId.toString()) : "--"}
          </span>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: () => "Catégorie",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-body text-text-secondary">
          {categories.find((x) => x.id === Number(row.original.categoryId))
            ?.label ?? "--"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <span className="block text-right">{"Montant (XAF)"}</span>,
      cell: ({ row }) => {
        const value = row.original;
        const amount =
          value.type !== "facilitation"
            ? value.amount
            : value.benFac?.list?.reduce(
                (acc, item) => acc + item.amount,
                0,
              );
        return (
          <span className="block text-right text-body whitespace-nowrap text-text-secondary">
            {amount ? formatNumber(amount) : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => "Date d'émission",
      cell: ({ row }) => (
        <span className="text-body whitespace-nowrap text-text-secondary">
          {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "state",
      header: () => "Statut",
      cell: ({ row }) => <RequestStatusPill state={row.original.state} />,
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="block text-right">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions pour ${item.ref}`}
              className="size-8 h-8 w-8 cursor-pointer justify-center gap-0 border-0 bg-transparent p-0 text-text-secondary hover:bg-hover hover:text-text-primary data-[state=open]:bg-hover [&_svg]:size-[18px] [&_svg]:text-current"
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setView(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              {/* TEMPORAIRE : masqué (cf. demande). Décommenter pour
                  réactiver la correction manuelle de la date limite. */}
              {/* <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setEditDate(true);
                }}
              >
                <CalendarCog />
                {"Modifier la date (temp.)"}
              </DropdownMenuItem> */}
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSearch
            value={searchText}
            onChange={(value) => {
              setSearchText(value);
              if (value === "") {
                filters.setCustomFilters({
                  ...filters.customFilters,
                  search: "",
                });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitSearch();
            }}
            placeholder="Rechercher un besoin, un demandeur…"
          />
          <Button variant="primary" onClick={submitSearch}>
            {"Rechercher"}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <FilterButton count={advancedCount} />
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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
          <Table className="min-w-[1240px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "besoin" &&
                          cn("pl-5", REQUEST_COLUMN_CLASS),
                        (header.column.id === "projectId" ||
                          header.column.id === "categoryId") &&
                          "min-w-[170px]",
                        header.column.id === "actions" && "pr-5",
                      )}
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={requestRowClass(row.original.state)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3 whitespace-normal normal-case",
                        cell.column.id === "besoin" && "pl-5",
                        cell.column.id === "actions" && "pr-5 text-right",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            table={table}
            noun="besoins"
            className="border-t border-border-default"
          />
        </div>
      ) : (
        <Empty message={"Aucun besoin enregistré"} />
      )}

      {selectedItem && (
        <ViewRequest
          open={view}
          openChange={setView}
          users={users}
          reqId={selectedItem.id}
        />
      )}
      {/* TEMPORAIRE : à retirer avec le bouton "Modifier la date" ci-dessus. */}
      <EditDueDateTemp
        open={editDate}
        onOpenChange={setEditDate}
        request={selectedItem}
      />
    </div>
  );
}
