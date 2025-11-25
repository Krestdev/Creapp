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
  Ban, // Ajout de l'icône pour le statut cancel
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
import { RequestModelT } from "@/types/types";
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
    badgeClassName: "bg-yellow-200 text-yellow-500 outline outline-yellow-600",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName: "bg-green-200 text-green-500 outline outline-green-600",
    rowClassName: "bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName: "bg-red-200 text-red-500 outline outline-red-600",
    rowClassName: "bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30",
  },
  "in-review": {
    label: "In Review",
    icon: AlertCircle,
    badgeClassName: "bg-blue-200 text-blue-500 outline outline-blue-600 ",
    rowClassName: "bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  },
  cancel: { // Ajout du statut cancel manquant
    label: "Cancel",
    icon: Ban,
    badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
    rowClassName: "bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
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
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [data, setData] = React.useState<RequestModelT[]>()

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

  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return request.getCategories();
    },
  });

  React.useEffect(() => {
    if(requestData.data) setData(requestData.data.data)
  }, [requestData.data])

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
  }, [requestData, requestData.data?.data]);


  // Fonctions utilitaires

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

  // Fonction sécurisée pour obtenir la configuration du statut
  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    // Retourne une configuration par défaut si le statut n'est pas trouvé
    return config || {
      label: status,
      icon: AlertCircle,
      badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
      rowClassName: "bg-gray-50 dark:bg-gray-950/20",
    };
  };

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = [
    {
      accessorKey: "ref", // Changé de "reference" à "ref" pour correspondre à votre type RequestModelT
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Références"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("ref")}</div>
      ),
    },
    {
      accessorKey: "label", // Changé de "title" à "label" pour correspondre à votre type RequestModelT
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
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.getValue("label")}</div>
      ),
    },
    {
      accessorKey: "projectId",
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
      cell: ({ row }) => {
        const projectId = row.getValue("projectId") as string;
        const project = projectsData.data?.data?.find(proj => proj.id === Number(projectId));
        return <div>{project?.label || projectId}</div>;
      },
    },
    {
      accessorKey: "categoryId",
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
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        const getCategoryName = (id: number) => {
          return categoryData.data?.data.find(x => x.id === id)?.label || id;
        }
        return <div>{getCategoryName(Number(categoryId))}</div>;
      },
    },
    {
      accessorKey: "state",
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
        const status = row.getValue("state") as string;
        const config = getStatusConfig(status);
        const Icon = config.icon;

        const getTranslatedLabel = (label: string) => {
          const translations: Record<string, string> = {
            "Pending": "En attente",
            "Validated": "Validé", 
            "Rejected": "Refusé",
            "In Review": "En révision",
            "Cancel": "Annulé"
          };
          return translations[label] || label;
        };

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Icon className="h-3 w-3" />
            {getTranslatedLabel(config.label)}
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
                disabled={item.state !== "pending"}
              >
                <LucidePen className="mr-2 h-4 w-4" />
                {"Modifier"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsCancelModalOpen(true);
                }}
                disabled={item.state !== "pending"}
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

  const table = useReactTable<RequestModelT>({
    data: data || [],
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
      const searchableColumns = ["ref", "label", "projectId"];
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
          placeholder="Rechercher par titre, référence, ou projet..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Category filter */}
        <Select
          value={
            (table.getColumn("categoryId")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("categoryId")
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
            (table.getColumn("state")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("state")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"Tous les statuts"}</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="validated">Validé</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="in-review">En révision</SelectItem>
            <SelectItem value="cancel">Annulé</SelectItem>
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
              {table.getRowModel().rows.map((row) => {
                const status = row.original.state;
                const config = getStatusConfig(status);
                
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
                          cell.getContext()
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
        <Empty message={"Aucun besoin enregistré"} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
        actionButton="Modifier"
        action={() => {
          setIsModalOpen(false);
          setIsUpdateModalOpen(true);
        }}
      />
      {/* <UpdateRequest
        open={isUpdateModalOpen}
        setOpen={setIsUpdateModalOpen}
        requestData={selectedItem}
      /> */}
      <ValidationModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        type="reject"
        title="Annuler le besoin"
        description="Êtes-vous sûr de vouloir annuler ce besoin ?"
        successConfirmation={{
          title: "Succès ✅",
          description: "Le besoin a été annulé avec succès.",
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