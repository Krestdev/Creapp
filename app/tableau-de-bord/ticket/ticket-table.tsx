"use client";

import { Pagination } from "@/components/base/pagination";
import { TabBar } from "@/components/base/TabBar";
import { ApproveTicket } from "@/components/modals/ApproveTicket";
import { DetailTicket } from "@/components/modals/detail-ticket";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useFetchQuery } from "@/hooks/useData";
import { cn, company } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import {} from "@/queries/commandRqstModule";
import { UpdatePayment, paymentQ } from "@/queries/payment";
import { purchaseQ } from "@/queries/purchase-order";
import {
  BonsCommande,
  PAYMENT_TYPES,
  PAY_STATUS,
  PRIORITIES,
  PaymentRequest,
  RequestType,
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
  Settings2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface TicketsTableProps {
  data: PaymentRequest[];
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

export function TicketTable({ data, requestTypeData }: TicketsTableProps) {
  const [searchFilter, setSearchFilter] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<
    "all" | PaymentRequest["type"]
  >("all");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | PaymentRequest["status"]
  >("all");
  const [priorityFilter, setPriorityFilter] = React.useState<
    "all" | PaymentRequest["priority"]
  >("all");
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    { id: 0, title: "En attentes d'approbation" },
    { id: 1, title: "Tickets traités" },
  ];

  const filteredData = React.useMemo(() => {
    return data.filter((c) => {
      //selectTab
      const matchTab =
        selectedTab === 0
          ? c.status === "accepted"
          : c.status === "paid" || c.status === "validated";
      //searchFilter
      const matchSearch =
        searchFilter === ""
          ? true
          : c.id === Number(searchFilter) ||
            c.price === Number(searchFilter) ||
            c.account
              ?.toLocaleLowerCase()
              .includes(searchFilter.toLocaleLowerCase()) ||
            c.title
              .toLocaleLowerCase()
              .includes(searchFilter.toLocaleLowerCase()) ||
            c.description
              ?.toLocaleLowerCase()
              .includes(searchFilter.toLocaleLowerCase()) ||
            c.reference
              .toLocaleLowerCase()
              .includes(searchFilter.toLocaleLowerCase());
      //TypeFilter
      const matchType = typeFilter === "all" ? true : c.type === typeFilter;
      //StatusFilter
      const matchStatus =
        statusFilter === "all" ? true : c.status === statusFilter;
      //PriorityFilter
      const matchPriority =
        priorityFilter === "all" ? true : c.priority === priorityFilter;

      return (
        matchPriority && matchStatus && matchType && matchSearch && matchTab
      );
    });
  }, [
    data,
    typeFilter,
    statusFilter,
    priorityFilter,
    searchFilter,
    selectedTab,
  ]);

  const resetAllFilters = () => {
    setSearchFilter("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
  };

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

  const validateMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: ({ id, data }: { id: number; data: UpdatePayment }) => {
      return paymentQ.vaidate(id, data);
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
              <DropdownMenuItem
                onClick={() => {
                  setMessage("Ticket approuvé avec succès");
                  setSelectedTicket(item);
                  setOpenValidationModal(true);
                }}
                disabled
              >
                <LucideCheck className="text-[#16A34A] mr-2 h-4 w-4" />
                {"Approuver"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData.sort((a, b) => a.reference.localeCompare(b.reference)),
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
        <TabBar
          tabs={tabs}
          setSelectedTab={setSelectedTab}
          selectedTab={selectedTab}
        />
        <div className="flex gap-4 items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les fitres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <div className="px-5 grid gap-5">
                {/**Search */}
                <div className="grid gap-1.5">
                  <Label>{"Recherche"}</Label>
                  <Input
                    placeholder="Rechercher par titre"
                    value={searchFilter}
                    onChange={(v) => setSearchFilter(v.target.value)}
                    className="w-full"
                  />
                </div>
                {/**Priority */}
                <div className="grid gap-1.5">
                  <Label>{"Priorité"}</Label>
                  <Select
                    value={priorityFilter}
                    onValueChange={(v) =>
                      setPriorityFilter(v as "all" | PaymentRequest["priority"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/** Status */}
                <div className="grid gap-1.5">
                  <Label>{"Statut"}</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) =>
                      setStatusFilter(v as "all" | PaymentRequest["status"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {PAY_STATUS.filter(
                        (c) => c.value === "accepted" || c.value === "validated"
                      ).map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {getStatusVariant(status.value).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/** */}
                <div className="grid gap-1.5">
                  <Label>{"Type"}</Label>
                  <Select
                    value={typeFilter}
                    onValueChange={(v) =>
                      setTypeFilter(v as "all" | PaymentRequest["type"])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrer par type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous les types"}</SelectItem>
                      {PAYMENT_TYPES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Bouton pour réinitialiser les filtres */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetAllFilters}
                    className="w-full"
                  >
                    {"Réinitialiser"}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
