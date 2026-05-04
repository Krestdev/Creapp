"use client";
import { Pagination } from "@/components/base/pagination";
import { TabBar } from "@/components/base/TabBar";
import { Button } from "@/components/ui/button";
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
import { cn, subText, XAF } from "@/lib/utils";
import {
  BonsCommande,
  Category,
  DateFilter,
  ProjectT,
  Reception,
  RequestModelT,
  RequestType,
  PaymentRequest,
  User,
} from "@/types/types";
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
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import React from "react";
import ViewRequest from "../besoins/view-request";
import TerminateRequest from "./terminate-request";

interface Props {
  requests: RequestModelT[];
  users: User[];
  categories: Category[];
  projects: ProjectT[];
  payments: PaymentRequest[];
  requestTypes: RequestType[];
  receptions: Array<Reception>;
  purchaseOrders: Array<BonsCommande>;
}

function ServiceRequestsTable({
  requests,
  users,
  categories,
  projects,
  payments,
  requestTypes,
  receptions,
  purchaseOrders,
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
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<RequestModelT>();
  const [view, setView] = React.useState<boolean>(false);
  const [decide, setDecide] = React.useState<boolean>(false);

  const [userFilter, setUserFilter] = React.useState<"all" | string>("all");
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter

  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    {
      id: 0,
      title: "En attente",
      badge: requests.filter((r) => r.decision === "PENDING").length,
    },
    {
      id: 1,
      title: "Traités",
    },
  ];

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setGlobalFilter("");
    setUserFilter("all");
  };

  const filteredRequests = React.useMemo(() => {
    return requests.filter((req) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      const search = searchFilter.toLowerCase().trim();
      const matchTab =
        selectedTab === 0
          ? req.decision === "PENDING"
          : req.decision !== "PENDING";
      const matchUser =
        userFilter === "all" ? true : req.userId === Number(userFilter);
      const matchSearch =
        search === ""
          ? true
          : req.id.toString().includes(search) ||
            req.label.toLowerCase().includes(search) ||
            req.description.toLocaleLowerCase().includes(search);
      let matchDate = true;
      if (dateFilter) {
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
            );
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "custom":
            if (customDateRange?.from && customDateRange?.to) {
              startDate = customDateRange.from;
              endDate = customDateRange.to;
            }
            break;
        }

        if (
          dateFilter !== "custom" ||
          (customDateRange?.from && customDateRange?.to)
        ) {
          matchDate =
            new Date(req.createdAt) >= startDate &&
            new Date(req.createdAt) <= endDate;
        }
      }
      return matchUser && matchSearch && matchDate && matchTab;
    });
  }, [
    requests,
    userFilter,
    searchFilter,
    dateFilter,
    customDateRange,
    selectedTab,
  ]);

  const columns: ColumnDef<RequestModelT>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => (
        <span
          className="tablehead"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Titre
          <ArrowUpDown />
        </span>
      ),
      cell: ({ row }) => <div>{row.getValue("label")}</div>,
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
              : "N/A"
            : XAF.format(
                value.benFac?.list?.reduce(
                  (acc, item) => acc + item.amount,
                  0,
                ) || 0,
              );
        return (
          <div
            className={cn(
              amount === "N/A" ? "text-muted-foreground" : "font-medium",
            )}
          >
            {amount}
          </div>
        );
      },
    },
    {
      accessorKey: "projectId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const projectId = row.original.projectId;
        const name = projects.find((p) => p.id === projectId)?.label ?? "N/A";
        return (
          <div
            className={cn(
              "text-sm first-letter:uppercase lowercase",
              name === "N/A" && "text-muted-foreground",
            )}
          >
            {subText({ text: name, length: 21 })}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Catégories"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.categoryId;
        const name = categories.find((c) => c.id === value)?.label ?? "N/A";

        return (
          <div>
            <div className="font-medium text-sm first-letter:uppercase lowercase">
              {name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "userId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Émetteur"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.userId;
        const name = users.find((u) => u.id === value)?.firstName ?? "N/A";
        return (
          <div
            className={cn(
              "text-sm first-letter:uppercase lowercase",
              name === "N/A" && "text-muted-foreground",
            )}
          >
            {subText({ text: name, length: 21 })}
          </div>
        );
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

        return <div>{formatted}</div>;
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

        return <div>{formatted}</div>;
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant={"ghost"}>
                {"Actions"}
                <ChevronDownIcon />
              </Button>
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
                  setDecide(true);
                }}
              >
                <WorkflowIcon />
                {"Traiter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredRequests,
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
      const searchableColumns = [
        "id",
        "label",
        "projectId",
        "categoryId",
        "userId",
      ];
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
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <TabBar
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
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
          <ViewRequest
            open={view}
            openChange={setView}
            request={selected}
            payments={payments}
            users={users}
            projects={projects}
            categories={categories}
            requestTypes={requestTypes}
            receptions={receptions}
            purchaseOrders={purchaseOrders}
          />
          <TerminateRequest
            open={decide}
            onOpenChange={setDecide}
            data={selected}
          />
        </>
      )}
    </div>
  );
}

export default ServiceRequestsTable;
