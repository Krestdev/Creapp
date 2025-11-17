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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  X,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  LucideBan,
  LucidePen,
} from "lucide-react";

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
import { RejectModal } from "./reject-modal";
import { ApproveModal } from "./approuver-modal";
import { ValidationModal } from "../modals/ValidationModal";
import { BesoinLastVal } from "../modals/BesoinLastVal";
import { RequestQueries } from "@/queries/requestModule";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useStore } from "@/providers/datastore";
import { RequestModelT } from "@/types/types";
import UpdateRequest from "../pages/besoin/UpdateRequest";
import { toast } from "sonner";

// Define the data type
export type TableData = {
  id: string;
  reference: string;
  title: string;
  project: string;
  category: string;
  status: "pending" | "approved" | "rejected" | "in-review";
  emeteur: string;
  beneficiaires: string;
  limiteDate: string;
  priorite: "low" | "medium" | "high" | "urgent";
  quantite: number;
  unite: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName:
      "bg-yellow-200 text-yellow-500 outline outline-yellow-600 hover:bg-yellow-600",
    rowClassName:
      "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30",
  },
  approved: {
    label: "Approved",
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

// Status color mapping
const statusColors = {
  pending: "bg-yellow-50 dark:bg-yellow-950/20",
  approved: "bg-green-50 dark:bg-green-950/20",
  rejected: "bg-red-50 dark:bg-red-950/20",
  "in-review": "bg-blue-50 dark:bg-blue-950/20",
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

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);

  const [isApprobationModalOpen, setIsApprobationModalOpen] =
    React.useState(false);

    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  const [modalProp, setModalProp] = React.useState({
    open: false,
    type: "approve" as "approve" | "reject",
    title: "",
    description: "",
    selectedItem: null as TableData | null,
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

  const mapApiStatusToTableStatus = (
    apiStatus: string
  ): TableData["status"] => {
    const statusMap: Record<string, TableData["status"]> = {
      pending: "pending",
      approved: "approved",
      rejected: "rejected",
      "in-review": "in-review",
      // Ajoutez d'autres mappings selon vos statuts réels
    };
    return statusMap[apiStatus] || "pending";
  };
  // Transformation des données RequestModelT vers TableData
  // Transformation des données RequestModelT vers TableData

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

  const openModal = (type: "approve" | "reject") => {
    setModalProp({
      open: true,
      type,
      title: type === "approve" ? "Approuver la demande" : "Rejeter la demande",
      description:
        type === "approve"
          ? "Êtes-vous sûr de vouloir approuver cette demande ?"
          : "Êtes-vous sûr de vouloir rejeter cette demande ?",
      selectedItem: selectedItem,
    });
  };

  const handleValidate = async (motif?: string): Promise<boolean> => {
    if (modalProp.type === "approve") {
      console.log("✅ Demande approuvée !");
      return true;
    } else {
      console.log("❌ Demande rejetée avec motif :", motif);
      return true;
    }
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

    return requestData.data.data.map((item: RequestModelT) => ({
      id: item.id.toString(),
      reference: `REF-${item.id.toString().padStart(3, "0")}`,
      title: item.label,
      project: item.projectId ? `${item.projectId}` : "Non assigné",
      category: "Général",
      status: mapApiStatusToTableStatus(item.state),
      emeteur: user?.name || "Utilisateur",
      beneficiaires: item.beneficiary || "Non spécifié",
      description: item.description || "Aucune description",
      limiteDate: formatDate(item.dueDate),
      priorite: mapApiPriorityToTablePriority(item.proprity),
      quantite: item.quantity,
      unite: item.unit || "Unité",
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
    }));
  }, [requestData.data, user]); // ⬅️ Dépendance sur requestData.data

  // Define columns
  const columns: ColumnDef<TableData>[] = [
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reference
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
            Title
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
            Project
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
            Category
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
            Status
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
            {config.label}
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  // setIsApprobationModalOpen(true);
                  openModal("approve");
                }}
              >
                <Check className="mr-2 h-4 w-4" />
                Validate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  // setIsRejectModalOpen(true);
                  openModal("reject");
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  // setIsApprobationModalOpen(true);
                  setIsUpdateModalOpen(true);
                }}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  // setIsRejectModalOpen(true);
                  setIsCancelModalOpen(true);
                }}
              >
                <LucideBan className="mr-2 h-4 w-4 text-red-500" />
                Annuler
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

  // Debug complet
  console.log("=== DEBUG COMPLET ===");
  console.log("requestData:", requestData);
  console.log("requestData.data:", requestData.data);
  console.log("requestData.isLoading:", requestData.isLoading);
  console.log("requestData.error:", requestData.error);
  console.log("user:", user);
  console.log("isHydrated:", isHydrated);
  console.log("data transformée:", data);
  console.log("=== FIN DEBUG ===");

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 py-4">
        {/* Global search */}
        <Input
          placeholder="Search by title, reference, or project..."
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
            <SelectItem value="all">All Categories</SelectItem>
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
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
          </SelectContent>
        </Select>

        {/* Column visibility */}
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

      {/* Table */}
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
              table.getRowModel().rows.map((row) => (
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
              ))
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

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
      />
      <UpdateRequest
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        data={selectedItem}
      />
      <RejectModal
        open={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        data={selectedItem}
      />
      <ApproveModal
        open={isApprobationModalOpen}
        onOpenChange={setIsApprobationModalOpen}
        data={selectedItem}
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
      {true || modalProp.type === "reject" ? (
        <ValidationModal
          open={modalProp.open}
          onOpenChange={(v) => setModalProp({ ...modalProp, open: v })}
          type={modalProp.type}
          title="Rejeter la demande"
          description="Êtes-vous sûr de vouloir rejeter cette demande ?"
          successConfirmation={{
            title: "Succès ✅",
            description: "La demande a été rejetée avec succès.",
          }}
          errorConfirmation={{
            title: "Erreur ❌",
            description: "Une erreur est survenue lors du rejet.",
          }}
          buttonTexts={{
            approve: "Approuver",
            reject: "Rejeter",
            cancel: "Annuler",
            close: "Fermer",
            retry: "Réessayer",
            processing: "Traitement...",
          }}
          labels={{
            rejectionReason: "Motif du rejet",
            rejectionPlaceholder: "Expliquez la raison du rejet...",
            rejectionError: "Veuillez fournir un motif",
          }}
          onSubmit={(motif) => handleValidate(motif)}
          // isMotifRequired={true}
        />
      ) : (
        <BesoinLastVal
          open={modalProp.open}
          onOpenChange={(v) => setModalProp({ ...modalProp, open: v })}
          data={selectedItem}
          titre={selectedItem?.title}
          description={modalProp.title}
          onSubmit={async (data) => {
            console.log("submit", data);
            return true;
          }}
        />
      )}
    </div>
  );
}
