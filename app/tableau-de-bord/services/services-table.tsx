"use client";
import { Pagination } from "@/components/base/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { subText } from "@/lib/utils";
import { Service, User } from "@/types/types";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowUpDown,
  Ellipsis,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import React from "react";
import DeleteService from "./delete-service";
import EditService from "./edit-service";
import ViewService from "./view-service";

interface Props {
  services: Service[];
  users: User[];
}

function ServicesTable({ services, users }: Props) {
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
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<Service>();
  const [view, setView] = React.useState<boolean>(false);
  const [deleteDialog, setDeleteDialog] = React.useState<boolean>(false);
  const [editDialog, setEditDialog] = React.useState(false);

  const [userFilter, setUserFilter] = React.useState<"all" | string>("all");
  const [searchFilter, setSearchFilter] = React.useState<string>("");

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setGlobalFilter("");
    setUserFilter("all");
  };

  const filteredServices = React.useMemo(() => {
    return services.filter((service) => {
      const search = searchFilter.toLowerCase().trim();
      const matchUser =
        userFilter === "all" ? true : service.headId === Number(userFilter);
      const matchSearch =
        search === ""
          ? true
          : service.id.toString().includes(search) ||
            service.label.toLowerCase().includes(search) ||
            service.headId?.toString().includes(search) ||
            service.users.some((u) =>
              u.firstName.toLowerCase().includes(search),
            ) ||
            service.users.some((u) =>
              u.lastName.toLowerCase().includes(search),
            );
      return matchUser && matchSearch;
    });
  }, [services, userFilter, searchFilter]);

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Service
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <div>{row.getValue("label")}</div>,
    },
    {
      accessorKey: "head",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Chef de service"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const value = row.original.head;
        const name = !!value
          ? value.firstName.concat(" ", value.lastName)
          : "N/A";
        return (
          <p className="normal-case">{subText({ text: name, length: 21 })}</p>
        );
      },
    },
    {
      accessorKey: "users",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Employés"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const amount = row.original.users.length;
        return `${amount} employé(s)`;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Date de création"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        const formatted = format(date, "dd/MM/yyyy, p", { locale: fr });

        return <p className="normal-case">{formatted}</p>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Date de mise à jour"}
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
        const formatted = format(date, "dd/MM/yyyy, p", { locale: fr });

        return <p className="normal-case">{formatted}</p>;
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setView(true);
                }}
              >
                <EyeIcon />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setEditDialog(true);
                }}
              >
                <PencilIcon />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setDeleteDialog(true);
                }}
              >
                <Trash2Icon />
                {"Supprimer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredServices,
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
      const searchableColumns = ["id", "label", "headId"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toLowerCase().includes(searchValue);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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

      <Pagination table={table} />
      {selected && (
        <>
          {/**View */}
          <ViewService
            open={view}
            openChange={setView}
            service={selected}
            users={users}
          />
          {/**Edit */}
          <EditService
            open={editDialog}
            openChange={setEditDialog}
            service={selected}
            users={users}
          />
          {/**Delete */}
          <DeleteService
            open={deleteDialog}
            openChange={setDeleteDialog}
            service={selected}
          />
        </>
      )}
    </div>
  );
}

export default ServicesTable;
