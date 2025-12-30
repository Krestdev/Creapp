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
  ArrowUpDown,
  ChevronDown,
  Eye,
  Flag,
  LucideCheck,
  LucideDollarSign,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
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
import { cn, company } from "@/lib/utils";
import { Pagination } from "../base/pagination";
import { BonsCommande, PaymentRequest } from "@/types/types";
import { DetailTicket } from "../modals/detail-ticket";
import { ApproveTicket } from "../modals/ApproveTicket";
import { PurchaseOrder } from "@/queries/purchase-order";
import { useFetchQuery } from "@/hooks/useData";
import { QuotationQueries } from "@/queries/quotation";
import { CommandRqstQueries } from "@/queries/commandRqstModule";
import { PaymentQueries } from "@/queries/payment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TicketsTableProps {
  data: PaymentRequest[];
  isAdmin: boolean;
  isManaged?: boolean;
}

const priorityConfig = {
  low: {
    label: "Basse",
    badgeClassName: "bg-gray-500 text-white hover:bg-gray-600",
    rowClassName:
      "bg-gray-50 hover:bg-gray-100 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
  },
  medium: {
    label: "Moyenne",
    badgeClassName: "bg-blue-500 text-white hover:bg-blue-600",
    rowClassName:
      "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  },
  high: {
    label: "Haute",
    badgeClassName: "bg-orange-500 text-white hover:bg-orange-600",
    rowClassName:
      "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/30",
  },
  urgent: {
    label: "Urgente",
    badgeClassName: "bg-red-500 text-white hover:bg-red-600",
    rowClassName:
      "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30",
  },
};

const statusConfig = {
  pending: {
    label: "En attente",
    badgeClassName: "bg-[#FEF3C7] border-[#FEE685] text-[#E17100]",
  },
  validated: {
    label: "Approuvé",
    badgeClassName: "bg-purple-100 border-purple-500 text-purple-500",
  },
  paid: {
    label: "Payé",
    badgeClassName: "bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]",
  },
};

export function TicketsTable({ data, isAdmin, isManaged }: TicketsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [openDetailModal, setOpenDetailModal] = React.useState(false);
  const [openValidationModal, setOpenValidationModal] = React.useState(false);
  const [openPaiementModal, setOpenPaiementModal] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState<PaymentRequest>();
  const [commands, setCommands] = React.useState<BonsCommande>();
  const queryClient = useQueryClient();
  const [message, setMessage] = React.useState<string>("");

  const purchaseOrderQuery = new PurchaseOrder();
  const { data: bons } = useFetchQuery(
    ["purchaseOrders"],
    purchaseOrderQuery.getAll
  );

  const payementQuery = new PaymentQueries();
  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<PaymentRequest>;
    }) => {
      return payementQuery.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payments"],
        refetchType: "active",
      });
      toast.success(message);
      message.includes("payé")
        ? setOpenPaiementModal(false)
        : setOpenValidationModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const quotationQuery = new QuotationQueries();
  const { data: devis } = useFetchQuery(["quotations"], quotationQuery.getAll);

  const command = new CommandRqstQueries();
  const { data: cotation } = useFetchQuery(["commands"], command.getAll);

  // Récupérer les statuts uniques présents dans les données
  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item.status) {
        statuses.add(item.status);
      }
    });
    return Array.from(statuses);
  }, [data]);

  // Récupérer les priorités uniques présentes dans les données
  const uniquePriorities = React.useMemo(() => {
    const priorities = new Set<string>();
    data.forEach((item) => {
      if (item.priority) {
        priorities.add(item.priority);
      }
    });
    return Array.from(priorities);
  }, [data]);

  // État pour suivre la valeur sélectionnée dans le Select
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  // État pour suivre la priorité sélectionnée dans le Select
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");

  const columns: ColumnDef<PaymentRequest>[] = [
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
      accessorKey: "reference",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Référence"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
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
        return(
        <div className="uppercase">{bon?.provider.name || company.name}</div>
      )},
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
        const priorite = row.getValue(
          "priority"
        ) as keyof typeof priorityConfig;
        const config = priorityConfig[priorite] || priorityConfig.medium;

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Flag className="h-3 w-3" />
            {config.label}
          </Badge>
        );
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
        const statut = row.getValue("status") as keyof typeof statusConfig;
        const config = statusConfig[statut] || {
          label: statut,
          badgeClassName: "bg-gray-100 text-gray-800",
        };

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Flag className="h-3 w-3" />
            {config.label}
          </Badge>
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

  // Fonction pour obtenir le libellé à afficher dans le SelectValue pour les statuts
  const getStatusDisplayValue = () => {
    if (selectedStatus === "all") {
      return "Tous les statuts";
    }
    const config = statusConfig[selectedStatus as keyof typeof statusConfig];
    return config?.label || selectedStatus;
  };

  // Fonction pour obtenir le libellé à afficher dans le SelectValue pour les priorités
  const getPriorityDisplayValue = () => {
    if (selectedPriority === "all") {
      return "Toutes les priorités";
    }
    const config =
      priorityConfig[selectedPriority as keyof typeof priorityConfig];
    return config?.label || selectedPriority;
  };

  // Mettre à jour le filtre quand selectedStatus change
  React.useEffect(() => {
    const statusColumn = table.getColumn("status");
    if (statusColumn) {
      if (selectedStatus === "all") {
        statusColumn.setFilterValue(undefined);
      } else {
        statusColumn.setFilterValue(selectedStatus);
      }
    }
  }, [selectedStatus, table]);

  // Mettre à jour le filtre quand selectedPriority change
  React.useEffect(() => {
    const priorityColumn = table.getColumn("priority");
    if (priorityColumn) {
      if (selectedPriority === "all") {
        priorityColumn.setFilterValue(undefined);
      } else {
        priorityColumn.setFilterValue(selectedPriority);
      }
    }
  }, [selectedPriority, table]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={getPriorityDisplayValue()}>
              {getPriorityDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les priorités</SelectItem>
            {uniquePriorities.map((priority) => {
              const config =
                priorityConfig[priority as keyof typeof priorityConfig];
              return (
                <SelectItem key={priority} value={priority}>
                  {config?.label || priority}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {isAdmin && (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={getStatusDisplayValue()}>
                {getStatusDisplayValue()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tous les statuts"}</SelectItem>
              {uniqueStatuses.map((status) => {
                const config =
                  statusConfig[status as keyof typeof statusConfig];
                return (
                  <SelectItem key={status} value={status}>
                    {config?.label || status}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

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
                    {column.id}
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
                const priorite = row.original
                  .priority as keyof typeof priorityConfig;
                const config =
                  priorityConfig[priorite] || priorityConfig.medium;

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
          paymentMutation.mutate({
            id: selectedTicket?.id!,
            data: { status: "validated" },
          })
        }
        buttonTexts={"Approuver"}
      />

      <ApproveTicket
        open={openPaiementModal}
        onOpenChange={setOpenPaiementModal}
        title={selectedTicket?.reference || "Ticket"}
        subTitle={"Payer le ticket"}
        description={"Voulez-vous payer ce ticket ?"}
        action={() =>
          paymentMutation.mutate({
            id: selectedTicket?.id!,
            data: { status: "paid" },
          })
        }
        buttonTexts={"Payer"}
      />
    </div>
  );
}
