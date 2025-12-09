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
import { cn } from "@/lib/utils";
import { Pagination } from "../base/pagination";
import { TicketsData } from "@/types/types";
import { DetailTicket } from "../modals/detail-ticket";
import { ApproveTicket } from "../modals/ApproveTicket";

interface TicketsTableProps {
  data: TicketsData[];
  isAdmin: boolean;
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
  approved: {
    label: "Approuvé",
    badgeClassName: "bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]",
  },
  paid: {
    label: "Payé",
    badgeClassName: "bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]",
  },
};

export function TicketsTable({ data, isAdmin }: TicketsTableProps) {
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
  const [selectedTicket, setSelectedTicket] = React.useState<TicketsData>();

  // Récupérer les statuts uniques présents dans les données
  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item.state) {
        statuses.add(item.state);
      }
    });
    return Array.from(statuses);
  }, [data]);

  // Récupérer les priorités uniques présentes dans les données
  const uniquePriorities = React.useMemo(() => {
    const priorities = new Set<string>();
    data.forEach((item) => {
      if (item.priorite) {
        priorities.add(item.priorite);
      }
    });
    return Array.from(priorities);
  }, [data]);

  // Valeur par défaut du filtre de statut
  const defaultStatusFilter = isAdmin ? "pending" : "approved";

  // État pour suivre la valeur sélectionnée dans le Select
  const [selectedStatus, setSelectedStatus] =
    React.useState<string>(defaultStatusFilter);

  // État pour suivre la priorité sélectionnée dans le Select
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");

  // Mettre à jour le filtre quand selectedStatus change
  React.useEffect(() => {
    const statusColumn = table.getColumn("state");
    if (statusColumn) {
      if (selectedStatus === "all") {
        // Pour "Tous les statuts", on supprime le filtre
        statusColumn.setFilterValue(undefined);
      } else {
        // Sinon on applique le filtre avec la valeur sélectionnée
        statusColumn.setFilterValue(selectedStatus);
      }
    }
  }, [selectedStatus]);

  // Mettre à jour le filtre quand selectedPriority change
  React.useEffect(() => {
    const priorityColumn = table.getColumn("priorite");
    if (priorityColumn) {
      if (selectedPriority === "all") {
        // Pour "Toutes les priorités", on supprime le filtre
        priorityColumn.setFilterValue(undefined);
      } else {
        // Sinon on applique le filtre avec la valeur sélectionnée
        priorityColumn.setFilterValue(selectedPriority);
      }
    }
  }, [selectedPriority]);

  // Initialiser le filtre de statut avec la valeur par défaut
  React.useEffect(() => {
    setSelectedStatus(defaultStatusFilter);
  }, [defaultStatusFilter]);

  const columns: ColumnDef<TicketsData>[] = [
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
            Référence
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
            Fournisseur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("fournisseur")}</div>,
    },
    {
      accessorKey: "bonDeCommande",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Bon de Commande
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => <div>{row.getValue("bonDeCommande")}</div>,
    },
    {
      accessorKey: "montant",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Montant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const montant = Number.parseFloat(row.getValue("montant"));
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(montant);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "priorite",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priorité
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const priorite = row.getValue(
          "priorite"
        ) as keyof typeof priorityConfig;
        const config = priorityConfig[priorite];

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Flag className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "state",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </span>
        );
      },
      cell: ({ row }) => {
        const statut = row.getValue("state") as keyof typeof statusConfig;
        const config = statusConfig[statut];

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
                    setSelectedTicket(item);
                    setOpenValidationModal(true);
                  }}
                >
                  <LucideCheck className="text-[#16A34A] mr-2 h-4 w-4" />
                  {"Approuver"}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
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
      const searchableColumns = ["reference", "fournisseur", "bonDeCommande"];
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

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={getStatusDisplayValue()}>
              {getStatusDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {uniqueStatuses.map((status) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              return (
                <SelectItem key={status} value={status}>
                  {config?.label || status}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-transparent">
              Columns
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
                  .priorite as keyof typeof priorityConfig;
                const config = priorityConfig[priorite];

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
                  No results.
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
      />

      <ApproveTicket
        open={openValidationModal}
        onOpenChange={setOpenValidationModal}
        title={selectedTicket?.bonDeCommande!}
        subTitle={"Valider le ticket"}
        description={"Voulez-vous valider ce ticket ?"}
        action={function (): void {
          throw new Error("Function not implemented.");
        }}
        buttonTexts={"Approuver"}
      />

      <ApproveTicket
        open={openPaiementModal}
        onOpenChange={setOpenPaiementModal}
        title={selectedTicket?.bonDeCommande!}
        subTitle={"Payer le ticket"}
        description={"Voulez-vous payer ce ticket ?"}
        action={function (): void {
          throw new Error("Function not implemented.");
        }}
        buttonTexts={"Payer"}
      />
    </div>
  );
}
