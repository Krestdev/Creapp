"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Eye } from "lucide-react";
import * as React from "react";

import { DetailBesoin } from "@/components/besoin/detail-besoin";
import Empty from "@/components/base/empty";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { queryKeys } from "@/lib/query-keys";
import {
  cn,
  getRequestStatusBadge,
  getRequestTypeBadge,
  getUserName,
  subText,
  XAF,
} from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { purchaseQ } from "@/queries/purchase-order";
import { receptionQ } from "@/queries/reception";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = ({ params }: PageProps) => {
  const { id } = use(params);
  const userId = Number(id);

  // ─── UI state (hooks must be before any early returns) ────────────────────────
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ createdAt: false });
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // ─── Data fetching ────────────────────────────────────────────────────────────
  const lastRequestsData = useQuery({
    queryKey: ["lastRequests", userId],
    queryFn: () => requestQ.lastrequests(userId),
    enabled: !!userId && !isNaN(userId),
  });

  const usersData = useQuery({
    queryKey: queryKeys.users,
    queryFn: userQ.getAll,
  });

  const projectsData = useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectQ.getAll,
  });

  const categoriesData = useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryQ.getCategories,
  });

  const requestTypeData = useQuery({
    queryKey: queryKeys.requestTypes,
    queryFn: requestTypeQ.getAll,
  });

  const getPurchases = useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseQ.getAll,
  });

  const getReceptions = useQuery({
    queryKey: queryKeys.receptions,
    queryFn: receptionQ.getAll,
  });

  // ─── Derived data (safe defaults so hooks below always run) ───────────────────
  const users = usersData.data?.data ?? [];
  const projects = projectsData.data?.data ?? [];
  const categories = categoriesData.data?.data ?? [];
  const requestTypes = requestTypeData.data?.data ?? [];

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === Number(projectId))?.label ?? projectId;

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === Number(categoryId))?.label ?? categoryId;

  // ─── Columns (useMemo must be before early returns) ───────────────────────────
  const columns: ColumnDef<RequestModelT>[] = React.useMemo(
    () => [
      {
        accessorKey: "label",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titres"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => (
          <p className="max-w-[200px] truncate">{row.getValue("label")}</p>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Type"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => {
          const type = getRequestTypeBadge({
            type: row.original.type,
            requestTypes,
          });
          return <Badge variant={type.variant}>{type.label}</Badge>;
        },
      },
      {
        accessorKey: "state",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statuts"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => {
          const state = getRequestStatusBadge(row.getValue("state"));
          const Icon = state.icon;
          return (
            <Badge variant={state.variant} className="text-xs">
              {Icon && <Icon />}
              {state.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Montant"}
            <ArrowUpDown />
          </span>
        ),
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
                amount === "Aucun" ? "text-muted-foreground" : "font-medium",
              )}
            >
              {amount}
            </p>
          );
        },
      },
      {
        accessorKey: "projectId",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => {
          const projectId = row.getValue("projectId");
          const projectName = projectId
            ? getProjectName(projectId as string)
            : "N/A";
          return (
            <p
              className={cn(
                "normal-case",
                projectName === "N/A"
                  ? "text-muted-foreground"
                  : "first-letter:uppercase lowercase",
              )}
            >
              {subText({ text: projectName, length: 21 })}
            </p>
          );
        },
      },
      {
        accessorKey: "categoryId",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Cat\u00e9gories"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => getCategoryName(row.getValue("categoryId")),
      },
      {
        accessorKey: "userId",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"\u00c9metteurs"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => (
          <p className="normal-case">
            {getUserName(users, row.getValue("userId"))}
          </p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Date d'\u00e9mission"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => (
          <p className="normal-case">
            {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
              locale: fr,
            })}
          </p>
        ),
      },
      {
        accessorKey: "beneficiary",
        header: ({ column }) => (
          <span
            className="tablehead cursor-pointer flex items-center"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"B\u00e9n\u00e9ficiaires"}
            <ArrowUpDown />
          </span>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const list = item.beficiaryList;
          const beneficiary = item.beneficiary;
          return (
            <p className="max-w-[200px] truncate normal-case">
              {beneficiary.toLocaleLowerCase() === "me"
                ? getUserName(users, item.userId)
                : beneficiary.length > 0
                  ? getUserName(users, Number(beneficiary))
                  : item.type?.toLocaleLowerCase().includes("facili")
                    ? item.benFac?.list
                        .map((li) => li.name)
                        .join(", ")
                        .substring(0, 21)
                    : !!list && list.length > 0
                      ? list
                          .map((u) => u.firstName.concat(" ", u.lastName))
                          .join(", ")
                          .substring(0, 21)
                      : "Aucun b\u00e9n\u00e9ficiaire"}
            </p>
          );
        },
      },
      {
        accessorKey: "actions",
        enableHiding: false,
        header: () => <span className="tablehead">{"Actions"}</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-1"
              id={`detail-btn-${item.id}`}
              onClick={() => {
                setSelectedItem(item);
                setIsModalOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
              {"Voir les d\u00e9tails"}
            </Button>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users, projects, categories, requestTypes],
  );

  const data: RequestModelT[] = React.useMemo(() => {
    if (!lastRequestsData.data) return [];
    return Array.isArray(lastRequestsData.data)
      ? lastRequestsData.data
      : ((lastRequestsData.data as any)?.data ?? []);
  }, [lastRequestsData.data]);

  // ─── Table instance (hook, must be before early returns) ─────────────────────
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnVisibility },
  });

  // ─── Loading / Error ──────────────────────────────────────────────────────────
  if (
    lastRequestsData.isPending ||
    usersData.isPending ||
    projectsData.isPending ||
    categoriesData.isPending ||
    requestTypeData.isPending ||
    getPurchases.isPending ||
    getReceptions.isPending
  ) {
    return <LoadingPage />;
  }

  if (
    lastRequestsData.isError ||
    usersData.isError ||
    projectsData.isError ||
    categoriesData.isError ||
    requestTypeData.isError ||
    getPurchases.isError ||
    getReceptions.isError
  ) {
    return (
      <ErrorPage
        error={
          lastRequestsData.error ||
          usersData.error ||
          projectsData.error ||
          categoriesData.error ||
          requestTypeData.error ||
          getPurchases.error ||
          getReceptions.error ||
          undefined
        }
      />
    );
  }

  const emitterName = getUserName(users, userId) ?? `Utilisateur #${userId}`;

  return (
    <div className="content">
      <PageTitle
        title={`Derniers besoins - ${emitterName}`}
        subtitle="Consultez les 5 derniers besoins soumis par cet utilisateur."
        color="red"
      />

      {/* Visibility toggle */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id === "label"
                    ? "Titres"
                    : col.id === "projectId"
                      ? "Projets"
                      : col.id === "categoryId"
                        ? "Cat\u00e9gories"
                        : col.id === "userId"
                          ? "\u00c9metteurs"
                          : col.id === "beneficiary"
                            ? "B\u00e9n\u00e9ficiaires"
                            : col.id === "createdAt"
                              ? "Date d'\u00e9mission"
                              : col.id === "state"
                                ? "Statuts"
                                : col.id === "amount"
                                  ? "Montant"
                                  : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {data.length > 0 ? (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {table.getRowModel().rows.map((row) => {
                const statusConfig = getRequestStatusBadge(row.original.state);
                return (
                  <TableRow
                    key={row.id}
                    className={cn("hover:bg-gray-50", statusConfig.className)}
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
        <Empty message={`Aucun besoin trouv\u00e9 pour ${emitterName}`} />
      )}

      {/* Detail modal */}
      {selectedItem && (
        <DetailBesoin
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={selectedItem}
          users={users}
          projects={projects}
          receptions={getReceptions.data?.data ?? []}
          purchaseOrders={getPurchases.data?.data ?? []}
        />
      )}
    </div>
  );
};

export default Page;
