"use client";

import * as React from "react";
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
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideBan,
  LucidePen,
  ChevronDown,
} from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DetailBesoin } from "../modals/detail-besoin";
import { Badge } from "../ui/badge";
import { ValidationModal } from "../modals/ValidationModal";
import { RequestQueries } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useStore } from "@/providers/datastore";
import { RequestModelT, TableData } from "@/types/types";
import UpdateRequest from "../pages/besoin/UpdateRequest";
import { toast } from "sonner";
import Empty from "./empty";
import { Pagination } from "./pagination";
import { ProjectQueries } from "@/queries/projectModule";
import { UserQueries } from "@/queries/baseModule";

// Define the data type


const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName:
      "bg-yellow-200 text-yellow-500 outline outline-yellow-600 hover:bg-yellow-600",
    rowClassName:
      "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName:
      "bg-green-200 text-green-500 outline outline-green-600 hover:bg-green-600",
    rowClassName:
      "bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName:
      "bg-red-200 text-red-500 outline outline-red-600 hover:bg-red-600",
    rowClassName:
      "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30",
  },
  "in-review": {
    label: "In Review",
    icon: AlertCircle,
    badgeClassName:
      "bg-blue-200 text-blue-500 outline outline-blue-600 hover:bg-blue-600",
    rowClassName:
      "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  },
};

export function DataTable() {
  const { user, isHydrated } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // modal spesific states
  const [selectedItem, setSelectedItem] = React.useState<TableData | null>(
    null
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projects.getAll();
    },
  });

  const users = new UserQueries();
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return users.getAll();
    },
  });

  const request = new RequestQueries();
  const requestData = useQuery({
    queryKey: ["requests", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("ID utilisateur non disponible");
      }
      return request.getMine(user.id);
    },
    enabled: !!user?.id && isHydrated,
  });

  const requestMutation = useMutation({
    mutationKey: ["requests"],
    mutationFn: async (data: Partial<RequestModelT>) => {
      const id = selectedItem?.id;
      if (!id) throw new Error("ID de besoin manquant");
      await request.update(Number(id), data);
    },
    onSuccess: () => {
      toast.success("Besoin annulé avec succès !");
    },
    onError: () => {
      toast.error("Une erreur est survenue.");
    },
  });

  // useEffect pour recharger les données
  React.useEffect(() => {
    requestData.refetch();
  }, [requestData.data?.data]);

  const mapApiStatusToTableStatus = (
    apiStatus: string
  ): TableData["status"] => {
    const statusMap: Record<string, TableData["status"]> = {
      pending: "pending",
      validated: "validated",
      rejected: "rejected",
      "in-review": "in-review",
    };
    return statusMap[apiStatus] || "pending";
  };

  // Fonctions utilitaires

  const mapApiPriorityToTablePriority = (
    apiPriority: string
  ): TableData["priorite"] => {
    const priorityMap: Record<string, TableData["priorite"]> = {
      low: "low",
      medium: "medium",
      high: "high",
      urgent: "urgent",
    };
    return priorityMap[apiPriority] || "medium";
  };

  const formatDate = (date: Date | string): string => {
    if (!date) return "Non définie";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("fr-FR");
  };

  const handleCancel = async () => {
    try {
      await requestMutation.mutateAsync({ state: "cancel" });
      return true;
    } catch (e) {
      return false;
    }
  };

  const data = React.useMemo(() => {
    // Accédez à requestData.data.data (le tableau de données)
    if (!requestData.data?.data || !Array.isArray(requestData.data.data)) {
      return [];
    }

    console.log(requestData.data.data);
    

    return requestData.data.data.map((item: RequestModelT) => ({
      id: item.id.toString(),
      reference: item.ref || "N/A",
      title: item.label,
      project: item.projectId?.toString(),
      category: item.categoryId!.toString(),
      status: mapApiStatusToTableStatus(item.state),
      emeteur: user?.name || "Utilisateur",
      beneficiaires: item.beneficiary,
      benef: item.beficiaryList!.flatMap(x => x.id),
      description: item.description || "Aucune description",
      limiteDate: item.dueDate,
      priorite: mapApiPriorityToTablePriority(item.proprity),
      quantite: item.quantity,
      unite: item.unit,
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
    }));
  }, [requestData.data, user, usersData.data, projectsData.data]);

  // Define columns
  const columns: ColumnDef<TableData>[] = [
    {
      accessorKey: "reference",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Reférences"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("reference")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titres"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "project",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("project")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Catégories"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statuts"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusConfig;
        const config = statusConfig[status];
        const Icon = config.icon;

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Icon className="h-3 w-3" />
            {config.label === "Validated" ? "Validé" : config.label === "Rejected" ? "Refusé" : config.label === "Pending" ? "En attente" : config.label === "Cancel" ? "Annulé" : config.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                {"Actions"}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{"Actions"}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsUpdateModalOpen(true);
                }}
                disabled={item.status !== "pending"}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsCancelModalOpen(true);
                }}
                disabled={item.status !== "pending"}
              >
                <LucideBan className="mr-2 h-4 w-4 text-red-500" />
                {"Annuler"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable<TableData>({
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
      const searchableColumns = ["reference", "title", "project"];
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
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-4 py-4">
        {/* Global search */}
        <Input
          placeholder="Rechercher par titre, reférence, ou project..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Category filter */}
        <Select
          value={
            (table.getColumn("category")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("category")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Toutes les catégories"}</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Security">Security</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les statuts"}</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="validated">Validated</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
          </SelectContent>
        </Select>

        {/* Column visibility */}
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
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    statusConfig[
                      row.original.status as keyof typeof statusConfig
                    ].rowClassName
                  )}
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty message={"Aucun besoin enrégistré"} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
        actionButton= "Modifier"
        action={
          () => {
            setIsModalOpen(false)
            setIsUpdateModalOpen(true)
          }
        }
      />
      <UpdateRequest
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        requestData={selectedItem}
      />
      <ValidationModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        type="reject"
        title="Annuler le besoin"
        description="Êtes-vous sûr de vouloir annuler ce besoin ?"
        successConfirmation={{
          title: "Succès ✅",
          description: "Le besoin a eété annulé avec succès.",
        }}
        errorConfirmation={{
          title: "Erreur ❌",
          description: "Une erreur est survenue lors de l'annulation.",
        }}
        buttonTexts={{
          approve: "Annuler",
          reject: "Rejeter",
          cancel: "Annuler",
          close: "Fermer",
          retry: "Réessayer",
          processing: "Traitement...",
        }}
        labels={{
          rejectionReason: "Motif de l'annulation",
          rejectionPlaceholder: "Expliquez la raison de l'annulation...",
          rejectionError: "Veuillez fournir un motif",
        }}
        onSubmit={() => handleCancel()}
      />
    </div>
  );
}
