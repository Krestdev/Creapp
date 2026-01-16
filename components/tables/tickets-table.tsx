"use client";

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
import { useFetchQuery } from "@/hooks/useData";
import { cn, company } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { } from "@/queries/commandRqstModule";
import { UpdatePayment, paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import {
  BonsCommande,
  PRIORITIES,
  PaymentRequest,
  RequestType
} from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Flag,
  LucideCheck,
  LucideDollarSign
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Pagination } from "../base/pagination";
import { ApproveTicket } from "../modals/ApproveTicket";
import { DetailTicket } from "../modals/detail-ticket";

interface TicketsTableProps {
  data: PaymentRequest[];
  isAdmin: boolean;
  isManaged?: boolean;
  requestTypeData: RequestType[];
}

const getPriorityBadge = (
  priority: PaymentRequest["priority"]
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
  status: PaymentRequest["status"]
): {
  label: string;
  variant: VariantProps<typeof badgeVariants>["variant"];
} => {
  switch (status) {
    case "accepted":
      return { label: "En attente", variant: "amber" };
    case "validated":
      return { label: "Approuvé", variant: "success" };
    default:
      return { label: "Payé", variant: "purple" };
  }
};

export function TicketsTable({
  data,
  isAdmin,
  isManaged,
  requestTypeData,
}: TicketsTableProps) {
  function getTypeBadge(type: PaymentRequest["type"]): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } {
    const typeData = requestTypeData.find((t) => t.type === type);
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
      case "CURRENT":
        return { label, variant: "secondary" };
      default:
        return { label: type, variant: "outline" };
    }
  }

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openValidationModal, setOpenValidationModal] = React.useState(false);
  const [openPaiementModal, setOpenPaiementModal] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<PaymentRequest>();
  const [commands, setCommands] = React.useState<BonsCommande>();
  const queryClient = useQueryClient();
  const [message, setMessage] = React.useState<string>("");

  const { user } = useStore();

  const { data: bons } = useFetchQuery(["purchaseOrders"], purchaseQ.getAll);

  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.update(id, data);
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ["payments"],
      //   refetchType: "active",
      // });
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
    mutationKey: ["payment"],
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.vaidate(id, data);
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ["payments"],
      //   refetchType: "active",
      // });
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
      accessorKey: "fournisseur",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Fournisseur"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const commandId = row.original.commandId;
        // Trouver le bon correspondant
        const bon = bons?.data?.find((item) => item.id === Number(commandId));
        return (
          <div className="uppercase">{bon?.provider.name || company.name}</div>
        );
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        // Afficher la référence ou l'ID
        return <div>{row.getValue("title")}</div>;
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const montant = Number.parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(montant);

        return <div className="font-medium">{formatted}</div>;
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {format(row.getValue("createdAt"), "dd/MM/yyyy")}
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

        const commandId = row.original.commandId;
        // Trouver le bon correspondant
        const bon = bons?.data?.find((item) => item.id === Number(commandId));
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
                  setCommands(bon);
                  setSelectedTicket(item);
                  setOpenDetailModal(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAdmin ? (
                <DropdownMenuItem
                  onClick={() => {
                    setMessage("Ticket approuvé avec succès");
                    setSelectedTicket(item);
                    setOpenValidationModal(true);
                  }}
                  disabled={isManaged}
                >
                  <LucideCheck className="text-[#16A34A] mr-2 h-4 w-4" />
                  {"Approuver"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setMessage("Ticket payé avec succès");
                    setSelectedTicket(item);
                    setOpenPaiementModal(true);
                  }}
                >
                  <LucideDollarSign className="mr-2 h-4 w-4" />
                  {"Payer"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data.sort((a, b) => a.reference.localeCompare(b.reference)),
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
      const searchableColumns = ["reference", "fournisseur", "price", "title"];
      const searchValue = filterValue.toLowerCase();

      return searchableColumns.some((column) => {
        const value = row.getValue(column) as string;
        return value?.toString().toLowerCase().includes(searchValue);
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
    <div className="content">
      <div className="flex gap-4 items-center justify-between">
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
                          cell.getContext()
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

      <DetailTicket
        open={openDetailModal}
        onOpenChange={setOpenDetailModal}
        data={selectedTicket}
        commands={commands}
        action={() =>
          paymentMutation.mutate({
            id: selectedTicket?.id!,
            data: { status: "paid" },
          })
        }
      />

      <ApproveTicket
        open={openValidationModal}
        onOpenChange={setOpenValidationModal}
        title={selectedTicket?.reference || "Ticket"}
        subTitle={"Valider le ticket"}
        description={"Voulez-vous valider ce ticket ?"}
        action={() =>
          validateMutation.mutate({
            id: selectedTicket?.id!,
            data: {
              commandId: selectedTicket?.commandId,
              price: selectedTicket?.price,
              status: "validated",
            },
          })
        }
        buttonTexts={"Approuver"}
      />
    </div>
  );
}
