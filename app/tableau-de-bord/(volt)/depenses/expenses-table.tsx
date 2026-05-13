"use client";
import {
  type ColumnDef,
  type ColumnFiltersState,
  PaginationOptions,
  PaginationState,
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
  ArrowRightToLine,
  ArrowUpDown,
  AsteriskIcon,
  Ban,
  BanIcon,
  CheckCircle,
  ChevronDown,
  Clock,
  Coins,
  DollarSign,
  Download,
  Eye,
  FilePenLineIcon,
  Signature,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { Pagination } from "@/components/base/pagination";
import DepenseDocument from "@/components/depense/depenseDoc";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { cn, getRequestTypeBadge, XAF } from "@/lib/utils";
import {
  PaymentRequest,
  PayType,
  PRIORITIES,
  ProjectT,
  Provider,
  RequestType,
  User,
} from "@/types/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AddProove from "./addProove";
import CancelTicket from "./cancel-ticket";
import CompleteGas from "./complete-gas";
import CompleteSettle from "./complete-settle";
import { DepenseFiltersProps } from "./depenseFilters";
import { NoticeFile } from "./notice";
import PayExpense from "./pay-expense";
import ShareExpense from "./share-expense";
import ViewExpense from "./view-expense";

// Configuration des couleurs pour les priorités
const priorityConfig = {
  low: {
    label: "Basse",
    rowClassName: "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20",
  },
  medium: {
    label: "Moyenne",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
  },
  high: {
    label: "Haute",
    rowClassName: "bg-red-50 hover:bg-red-100 dark:bg-red-950/20",
  },
  urgent: {
    label: "Urgente",
    rowClassName: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20",
  },
};

// Configuration des statuts (gardé pour les badges si besoin)
const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName: "bg-red-200 text-red-500 outline outline-red-600",
  },
  paid: {
    label: "paid",
    icon: Coins,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
  },
  pending_depense: {
    label: "en attente",
    icon: AlertCircle,
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600 ",
  },
  cancel: {
    label: "ghost",
    icon: Ban,
    badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
  },
};

interface Props {
  payments: Array<PaymentRequest>;
  requestTypes: Array<RequestType>;
  paymentTypes: PayType[];
  providers: Array<Provider>;
  users: Array<User>;
  projects: Array<ProjectT>;
  activeTab: DepenseFiltersProps["customFilters"]["tab"];
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
}

function getPriorityBadge(priority: PaymentRequest["priority"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const priorityData = PRIORITIES.find((p) => p.value === priority);
  const label = priorityData?.name ?? "Inconnu";

  switch (priority) {
    case "low":
      return { label, variant: "outline" };
    case "medium":
      return { label, variant: "blue" };
    case "high":
      return { label, variant: "destructive" };
    case "urgent":
      return { label, variant: "purple" };
    default:
      return { label, variant: "outline" };
  }
}

function getPriorityConfig(priority: PaymentRequest["priority"]) {
  const config = priorityConfig[priority as keyof typeof priorityConfig];
  return (
    config || {
      label: "Inconnu",
      rowClassName: "bg-gray-50 dark:bg-gray-950/20",
    }
  );
}

function getStatusBadge(status: PaymentRequest["status"]): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} {
  const label =
    status === "unsigned"
      ? "En attente de signature"
      : status === "signed"
        ? "Signé"
        : status === "paid"
          ? "Payé"
          : status === "simple_signed"
            ? "Paiement ouvert"
            : status === "cancelled"
              ? "Annulé"
              : status === "validated"
                ? "En attente"
                : status;

  switch (status) {
    case "pending_depense":
      return { label, variant: "yellow" };
    case "unsigned":
      return { label, variant: "teal" };
    case "signed":
      return { label, variant: "lime" };
    case "paid":
      return { label, variant: "success" };
    case "simple_signed":
      return { label, variant: "success" };
    case "cancelled":
      return { label, variant: "dark" };
    default:
      return { label, variant: "yellow" };
  }
}

function isGasComplete(item: PaymentRequest) {
  return (
    item.type === "gas" &&
    !!item.benefId &&
    !!item.liters &&
    !!item.price &&
    !!item.deadline
  );
}

function isSettleComplete(item: PaymentRequest) {
  return (
    item.type === "settle" && !!item.benefId && !!item.price && !!item.deadline
  );
}

function ExpensesTable({
  payments,
  requestTypes,
  paymentTypes,
  providers,
  users,
  projects,
  activeTab,
  pagination,
  paginationOptions,
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
      updatedAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selected, setSelected] = React.useState<PaymentRequest | undefined>(
    undefined,
  );
  const [showDetail, setShowDetail] = React.useState<boolean>(false);
  const [showPay, setShowPay] = React.useState<boolean>(false);
  const [showGas, setShowGas] = React.useState<boolean>(false);
  const [showSettle, setShowSettle] = React.useState<boolean>(false);
  const [showShare, setShowShare] = React.useState<boolean>(false);
  const [showAddFile, setShowAddFile] = React.useState<boolean>(false);
  const [showCancel, setShowCancel] = React.useState<boolean>(false);

  const columns: ColumnDef<PaymentRequest>[] = [
    {
      accessorKey: "reference",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
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
        const type = getRequestTypeBadge({ type: value.type, requestTypes });
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titre"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const isSelected = value.selected === true;
        const transactionStatus = isSelected
          ? value.transaction?.Type === "TRANSFER" &&
            value.transaction?.status === "APPROVED"
          : false;
        return (
          <div className="max-w-[500px] flex gap-1.5">
            {!!transactionStatus && (
              <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
                <AsteriskIcon size={16} />
              </span>
            )}
            <span className="line-clamp-1">{value.title ?? "--"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "paytype",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Moyen de paiement"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const paytype = value.method?.label;
        return (
          <span className="line-clamp-1 first-letter:uppercase">
            {paytype ?? "--"}
          </span>
        );
      },
    },
    {
      id: "beneficiary",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Bénéficiaire"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const requestItem = value.request;

        if (!requestItem) return <div>--</div>;

        // Vérifier dans beneficiary (string)
        if (requestItem.beneficiary && requestItem.beneficiary !== "me") {
          const user = users.find(
            (x) => x.id === Number(requestItem.beneficiary),
          );
          if (user) {
            return <div>{`${user.firstName} ${user.lastName}`}</div>;
          }
        }

        // Vérifier dans beneficiaryList (array)
        if (requestItem.beficiaryList && requestItem.beficiaryList.length > 0) {
          const names = requestItem.beficiaryList
            .map((b) => `${b.firstName || ""} ${b.lastName || ""}`.trim())
            .filter((name) => name)
            .join(", ");
          if (names) {
            return <div>{names}</div>;
          }
        }

        return <div>--</div>;
      },
    },
    {
      id: "provider",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        return <div>{value.facture?.command.provider.name ?? "--"}</div>;
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Montant"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("price");
        return <div className="font-medium">{XAF.format(Number(value))}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <span
            className="tablehead cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Priorité"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const priority = getPriorityBadge(value.priority);
        return <Badge variant={priority.variant}>{priority.label}</Badge>;
      },
      sortingFn: (rowA, rowB, columnId) => {
        const priorityOrder = {
          low: 1,
          medium: 2,
          high: 3,
          urgent: 4,
        };
        const priorityA =
          priorityOrder[
            rowA.getValue(columnId) as keyof typeof priorityOrder
          ] || 0;
        const priorityB =
          priorityOrder[
            rowB.getValue(columnId) as keyof typeof priorityOrder
          ] || 0;
        return priorityA - priorityB;
      },
      filterFn: (row, id, value) => {
        return value === "" || value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statut"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original;
        const status = getStatusBadge(value.status);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
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
            {"Date de création"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.createdAt;
        return (
          <div>
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Mise à jour le"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const value = row.original.updatedAt;
        return (
          <div>
            {format(new Date(value), "dd MMMM yyyy, p", { locale: fr })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-fit">
              <Button variant="ghost">
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowDetail(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              {item.status === "paid" && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelected(item);
                    setShowAddFile(true);
                  }}
                >
                  <FilePenLineIcon />
                  {"Ajouter la preuve"}
                </DropdownMenuItem>
              )}
              {(item.type === "gas" || item.type === "settle") && (
                <DropdownMenuItem
                  disabled={isGasComplete(item) || isSettleComplete(item)}
                  onClick={() => {
                    setSelected(item);
                    item.type === "gas"
                      ? setShowGas(true)
                      : setShowSettle(true);
                  }}
                >
                  <ArrowRightToLine />
                  {"Compléter le paiement"}
                </DropdownMenuItem>
              )}
              {activeTab === "processed" && (
                <>
                  <DropdownMenuItem
                    disabled={
                      item.status !== "pending_depense" &&
                      item.status !== "signed" &&
                      item.status !== "simple_signed"
                    }
                    onClick={() => {
                      setSelected(item);
                      setShowPay(true);
                    }}
                  >
                    <DollarSign />
                    {"Payer"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <PDFDownloadLink
                      document={
                        <DepenseDocument
                          getPaymentType={paymentTypes}
                          paymentRequest={item}
                          users={users}
                          requestTypes={requestTypes}
                        />
                      }
                      fileName={`recu-${item.type}-${item.reference}.pdf`}
                    >
                      {({ loading }) => (
                        <Button
                          disabled={loading}
                          variant={"ghost"}
                          className="font-normal px-0 text-gray-600 bg-transparent hover:bg-transparent h-5"
                        >
                          <Download />
                          {loading
                            ? "Génération du PDF..."
                            : "Télécharger le PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </DropdownMenuItem>
                </>
              )}
              {activeTab === "validated" && (
                <DropdownMenuItem
                  disabled={
                    item.status === "unsigned" ||
                    (item.type === "gas" && !isGasComplete(item)) ||
                    (item.type === "settle" && !isSettleComplete(item))
                  }
                  onClick={() => {
                    setSelected(item);
                    setShowShare(true);
                  }}
                >
                  <Signature />
                  {"Traiter"}
                </DropdownMenuItem>
              )}
              {!!item.invoiceId && (
                <DropdownMenuItem disabled={item.status !== "paid"}>
                  <PDFDownloadLink
                    document={<NoticeFile payment={item} />}
                    fileName={`avis-de-reglement-${item.reference}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        disabled={loading}
                        variant={"ghost"}
                        className="font-normal px-0 text-gray-600 bg-transparent hover:bg-transparent h-5"
                      >
                        <Download />
                        {loading ? "Chargement..." : "Avis de règlement"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setSelected(item);
                  setShowCancel(true);
                }}
                disabled={
                  item.type === "achat" ||
                  ["paid", "cancelled", "rejected"].includes(item.status)
                }
              >
                <BanIcon />
                {"Annulation"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: payments,
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
      const searchableColumns = ["reference", "provider", "title"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toLowerCase().includes(searchValue);
      });
    },
    manualPagination: true,
    ...paginationOptions,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                {"Colonnes"}
                <ChevronDown />
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
                      {column.id === "createdAt"
                        ? "Date de création"
                        : column.id === "updatedAt"
                          ? "Date de modification"
                          : column.id === "reference"
                            ? "Référence"
                            : column.id === "title"
                              ? "Titre"
                              : column.id === "price"
                                ? "Montant"
                                : column.id === "status"
                                  ? "Statut"
                                  : column.id === "priority"
                                    ? "Priorité"
                                    : column.id === "provider"
                                      ? "Fournisseur"
                                      : column.id === "type"
                                        ? "Type"
                                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              table.getRowModel().rows.map((row) => {
                const priority = row.original.priority;
                const config = getPriorityConfig(priority);

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(config.rowClassName)}
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
              })
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
        <ViewExpense
          open={showDetail}
          openChange={setShowDetail}
          payment={selected}
          projects={projects}
          users={users}
          payTypes={paymentTypes}
          requestTypes={requestTypes}
        />
      )}
      {selected && (
        <>
          <ShareExpense
            ticket={selected}
            open={showShare}
            onOpenChange={setShowShare}
            users={users}
            requestTypes={requestTypes}
            payTypes={paymentTypes}
            providers={providers}
          />
          <PayExpense
            ticket={selected}
            open={showPay}
            onOpenChange={setShowPay}
          />
          <CompleteGas
            ticket={selected}
            open={showGas}
            onOpenChange={setShowGas}
            users={users}
            requestTypes={requestTypes}
          />
          <CompleteSettle
            ticket={selected}
            open={showSettle}
            onOpenChange={setShowSettle}
            users={users}
            requestTypes={requestTypes}
          />
          <AddProove
            ticket={selected}
            open={showAddFile}
            onOpenChange={setShowAddFile}
          />
          <CancelTicket
            data={selected}
            open={showCancel}
            openChange={setShowCancel}
          />
        </>
      )}
    </div>
  );
}

export default ExpensesTable;
