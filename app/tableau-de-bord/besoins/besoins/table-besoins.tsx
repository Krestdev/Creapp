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
    AlertCircle,
    ArrowUpDown,
    Ban,
    CheckCircle,
    Clock,
    Eye,
    XCircle
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
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn, subText } from "@/lib/utils";
import {
    Category,
    PaymentRequest,
    ProjectT,
    REQUEST_STATUS,
    RequestModelT,
    RequestType,
    User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ViewRequest from "./view-request";


interface Props {
  data: Array<RequestModelT>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  payments: Array<PaymentRequest>;
  requestTypes: Array<RequestType>;
  users : Array<User>;
}

export function RequestsTable({
  data,
  categories,
  projects,
  payments,
  requestTypes,
  users
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

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [view, setView] = React.useState(false);


  // Fonction sécurisée pour obtenir la configuration du statut
  const getStatusBadge = (status :RequestModelT["state"]): {label: string; variant:VariantProps<typeof badgeVariants>["variant"], className?: HTMLButtonElement["className"]} => {
    const label = REQUEST_STATUS.find(s => s.value === status)?.name ?? status;
    switch(status){
        case "cancel":
            return {label, variant: "outline"};
        case "in-review":
            return {label, variant: "sky", className: "bg-sky-50 hover:bg-sky-100"};
        case "pending":
            return {label, variant: "amber", className: "bg-amber-50 hover:bg-amber-100"};
        case "rejected":
            return {label, variant: "destructive", className: "bg-red-50 hover:bg-red-100"};
        case "store":
            return {label, variant: "blue", className: "bg-blue-50 hover:bg-blue-100"};
        case "validated":
            return {label, variant: "success", className: "bg-green-50 hover:bg-green-100"};
    }
  }


  function getTypeBadge(
    type:
      | "achat"
      | "ressource_humaine"
      | "facilitation"
      | "speciaux"
      | undefined,
  ): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
    const typeData = requestTypes.find((t) => t.type === type);
    const label = typeData?.label ?? "Inconnu";
    switch (type) {
      case "facilitation":
        return { label, variant: "lime" };
      case "achat":
        return { label, variant: "sky" };
      case "speciaux":
        return { label, variant: "purple" };
      case "ressource_humaine":
        return { label, variant: "blue" };
      default:
        return { label: type || "Inconnu", variant: "outline" };
    }
  }

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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("ref")}</div>
      ),
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
        return (
          <div className="flex items-center gap-1.5 uppercase">
            {subText({ text: original.label })}
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
        const type = getTypeBadge(value.type);
        return <Badge variant={type.variant}>{type.label}</Badge>;
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
        const projectId = row.getValue("projectId") as string;
        const project = projects.find((proj) => proj.id === Number(projectId));
        return (
          <div className="first-letter:uppercase lowercase">
            {project?.label || projectId}
          </div>
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
        return (
          <div className="first-letter:uppercase lowercase">
            {getCategoryName(Number(categoryId))}
          </div>
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
        <div className="max-w-[200px] truncate first-letter:uppercase">
          {format(new Date(row.getValue("createdAt")), "PP", { locale: fr })}
        </div>
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
        const {label, variant} = getStatusBadge(status);

        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;
        const paiement = payments.find((x) => x.requestId === item?.id);
        const isAttach =
          (item.type === "facilitation" || item.type === "ressource_humaine") &&
          paiement?.proof !== null;

        return (
          <Button variant={"outline"} onClick={()=>{setSelectedItem(item);
                    setView(true);}}><Eye/>{"Voir"}</Button>
        );
      },
    },
  ];

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="content">
      <div className="flex flex-wrap justify-between gap-4">
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
                                : column.id === "createdAt"
                                  ? "Date d'émission"
                                  : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Besoins (${data.length})`}</h3>

      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
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
                const {className} = getStatusBadge(status);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(className)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r last:border-r-0"
                      >
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
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}
      {selectedItem && <ViewRequest open={view} openChange={setView} payments={payments} users={users} categories={categories} request={selectedItem} projects={projects} />}

    </div>
  );
}
