"use client";

import { Pagination } from "@/components/base/pagination";
import { ModalWarning } from "@/components/modals/modal-warning";
import { Badge, badgeVariants } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XAF, cn, getRequestTypeBadge, subText } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {} from "@/queries/commandRqstModule";
import { UpdatePayment, paymentQ } from "@/queries/payment";
import {
  PRIORITIES,
  PayType,
  PaymentRequest,
  ProjectT,
  RequestType,
  User,
} from "@/types/types";
import { useMutation } from "@tanstack/react-query";
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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import {
  ArrowUpDown,
  BanIcon,
  ChevronDown,
  Ellipsis,
  Eye,
  Flag,
  LucideCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ViewExpense from "../(volt)/depenses/view-expense";
import CardTicket from "./card-ticket";
import RejectTicket from "./reject-ticket";

interface TicketsTableProps {
  data: PaymentRequest[];
  requestTypeData: RequestType[];
  users: Array<User>;
  projects: Array<ProjectT>;
  payTypes: Array<PayType>;
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
}

const getPriorityBadge = (
  priority: PaymentRequest["priority"],
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
  rowClassName?: string;
} => {
  const label = PRIORITIES.find((c) => c.value === priority)?.name ?? "Inconnu";
  switch (priority) {
    case "low":
      return {
        label,
        variant: "amber",
        rowClassName:
          "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30",
      };
    case "medium":
      return {
        label,
        variant: "success",
        rowClassName:
          "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30",
      };
    case "high":
      return {
        label,
        variant: "destructive",
        rowClassName:
          "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30",
      };
    case "urgent":
      return {
        label,
        variant: "primary",
        rowClassName:
          "bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/30",
      };
    default:
      return {
        label: "Inconnu",
        variant: "outline",
        rowClassName:
          "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
      };
  }
};
const getStatusVariant = (
  status: PaymentRequest["status"],
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  switch (status) {
    case "accepted":
      return { label: "En attente", variant: "amber" };
    case "paid":
      return { label: "Payé", variant: "purple" };
    case "pending":
      return { label: "En attente", variant: "amber" };
    case "rejected":
      return { label: "Rejeté", variant: "destructive" };
    default:
      return { label: "Approuvé", variant: "success" };
  }
};

export function TicketTable({
  data,
  requestTypeData,
  users,
  projects,
  payTypes,
  pagination,
  paginationOptions,
}: TicketsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openValidationModal, setOpenValidationModal] = useState(false);
  const [openPaiementModal, setOpenPaiementModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<PaymentRequest>();

  const [message, setMessage] = useState<string>("");

  const { user } = useStore();

  const paymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.update(id, data);
    },
    onSuccess: () => {
      toast.success(message);
      message.includes("payé")
        ? setOpenPaiementModal(false)
        : setOpenValidationModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const validateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.vaidate(id, data);
    },
    onSuccess: () => {
      toast.success(message);
      message.includes("payé")
        ? setOpenPaiementModal(false)
        : setOpenValidationModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const columns: ColumnDef<PaymentRequest>[] = [
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
          requestTypes: requestTypeData,
        });
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "fournisseur",
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
        const invoice = value.facture;
        return invoice?.command.provider.name ?? "N/A";
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
        // Afficher la référence ou l'ID
        return (
          <div>{subText({ text: row.getValue("title"), length: 21 })}</div>
        );
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
        const amount = row.original.price;

        return <p className="normal-case">{XAF.format(amount)}</p>;
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Priorité"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as PaymentRequest["status"];
        if (
          status !== "paid" &&
          !user?.role.flatMap((r) => r.label).includes("VOLT")
        ) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-fit h-fit">
                <Badge
                  variant={getPriorityBadge(row.original.priority).variant}
                >
                  <Flag className="h-3 w-3" />
                  {getPriorityBadge(row.original.priority).label}
                  <ChevronDown />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PRIORITIES.map((level) => {
                  return (
                    <DropdownMenuItem
                      key={level.value}
                      onClick={() => {
                        paymentMutation.mutate({
                          id: row.original.id!,
                          data: {
                            priority: level.value,
                            price: row.original.price,
                          },
                        });
                      }}
                    >
                      <Badge variant={getPriorityBadge(level.value).variant}>
                        <Flag className="h-3 w-3" />
                        {level.name}
                      </Badge>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          return (
            <Badge variant={getPriorityBadge(row.original.priority).variant}>
              <Flag className="h-3 w-3" />
              {getPriorityBadge(row.original.priority).label}
            </Badge>
          );
        }
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
        const status = row.original.status;
        const { label, variant } = getStatusVariant(status);

        return <Badge variant={variant}>{label}</Badge>;
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
            {"Date de creation"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <p className="normal-case">
            {format(row.getValue("createdAt"), "dd/MM/yyyy")}
          </p>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="tablehead">{"Actions"}</span>,
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        const invoice = item.facture;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedTicket(item);
                  setOpenDetailModal(true);
                }}
              >
                <Eye />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setMessage("Ticket approuvé avec succès");
                  setSelectedTicket(item);
                  setOpenValidationModal(true);
                }}
                disabled={
                  item.status === "validated" ||
                  item.status === "signed" ||
                  item.status === "simple_signed" ||
                  item.status === "unsigned" ||
                  item.status === "paid" ||
                  item.status === "rejected"
                }
              >
                <LucideCheck className="text-green-600" />
                {"Approuver"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMessage("Ticket approuvé avec succès");
                  setSelectedTicket(item);
                  setOpenRejectModal(true);
                }}
                disabled={
                  item.status === "validated" ||
                  item.status === "signed" ||
                  item.status === "simple_signed" ||
                  item.status === "unsigned" ||
                  item.status === "paid" ||
                  item.status === "rejected"
                }
              >
                <BanIcon />
                {"Rejeter"}
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

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchableColumns = ["reference", "fournisseur", "price", "title"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toString().toLowerCase().includes(searchValue);
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
    <div className="content">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
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
                      {column.id === "createdAt"
                        ? "Date de creation"
                        : column.id === "priority"
                          ? "Priorité"
                          : column.id === "status"
                            ? "Statut"
                            : column.id === "type"
                              ? "Type"
                              : column.id === "amount"
                                ? "Montant"
                                : column.id === "description"
                                  ? "Description"
                                  : column.id === "reference"
                                    ? "Reference"
                                    : column.id === "createdAt"
                                      ? "Date de creation"
                                      : column.id === "updatedAt"
                                        ? "Date de modification"
                                        : column.id === "actions"
                                          ? "Actions"
                                          : column.id === "title"
                                            ? "Titre"
                                            : column.id === "category"
                                              ? "Categorie"
                                              : column.id === "price"
                                                ? "Montant"
                                                : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <section className="hidden @min-[760px]:grid gap-6">
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
                  const config = getPriorityBadge(row.original.priority);
                  //

                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(config?.rowClassName || "")}
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
                    {"Aucun résultat"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination table={table} />
      </section>
      <section className="grid grid-cols-1 @min-[740px]:grid-cols-2 gap-4 @min-[760px]:hidden">
        {data.map((e) => (
          <CardTicket key={e.id} data={e} requestTypeData={requestTypeData} />
        ))}
      </section>

      {!!selectedTicket && (
        <ViewExpense
          open={openDetailModal}
          openChange={setOpenDetailModal}
          payment={selectedTicket}
          users={users}
          requestTypes={requestTypeData}
          projects={projects}
          payTypes={payTypes}
        />
      )}

      <ModalWarning
        open={openValidationModal}
        variant="success"
        onOpenChange={setOpenValidationModal}
        title={
          "Approbation" +
          " - " +
          selectedTicket?.title +
          " - " +
          selectedTicket?.reference
        }
        description={"Voulez-vous valider ce ticket ?"}
        onAction={() =>
          validateMutation.mutate({
            id: selectedTicket?.id!,
            data: {
              invoiceId: selectedTicket?.invoiceId,
              price: selectedTicket?.price,
              status: "validated",
            },
          })
        }
        actionText={"Approuver"}
      />

      {selectedTicket && (
        <RejectTicket
          payment={selectedTicket}
          open={openRejectModal}
          openChange={setOpenRejectModal}
        />
      )}
    </div>
  );
}
