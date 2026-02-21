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
  AlertCircle,
  ArrowUpDown,
  AsteriskIcon,
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  LucideBan,
  LucidePen,
  Paperclip,
  XCircle,
} from "lucide-react";
import * as React from "react";

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
import { cn, subText } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import {
  Category,
  PaymentRequest,
  ProjectT,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DetailBesoin } from "../besoin/detail-besoin";
import UpdateRequest from "../besoin/UpdateRequest";
import UpdateRequestFac from "../besoin/UpdateRequestFac";
import UpdateRHRequest from "../besoin/UpdateRequestRH";
import { ModalWarning } from "../modals/modal-warning";
import { Badge, badgeVariants } from "../ui/badge";
import Empty from "./empty";
import { Pagination } from "./pagination";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    badgeClassName: "bg-amber-100 text-amber-600 border border-amber-200",
    rowClassName: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/20",
  },
  validated: {
    label: "Validated",
    icon: CheckCircle,
    badgeClassName: "bg-green-100 text-green-600 border border-green-200",
    rowClassName: "bg-green-50 dark:bg-green-950/20 dark:hover:bg-green-950/30",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    badgeClassName: "bg-red-100 text-red-600 border border-red-200",
    rowClassName: "bg-red-50 dark:bg-red-950/20 dark:hover:bg-red-950/30",
  },
  "in-review": {
    label: "In Review",
    icon: AlertCircle,
    badgeClassName: "bg-sky-100 text-sky-600 border border-sky-200 ",
    rowClassName: "bg-sky-50 dark:bg-bluesky/20 dark:hover:bg-sky-950/30",
  },
  store: {
    label: "Store",
    icon: AlertCircle,
    badgeClassName: "bg-blue-100 text-blue-600 border border-blue-200 ",
    rowClassName: "bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  },
  cancel: {
    label: "Cancel",
    icon: Ban,
    badgeClassName: "bg-gray-100 text-gray-600 border border-gray-200",
    rowClassName: "bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
  },
};

interface Props {
  data: Array<RequestModelT>;
  categories: Array<Category>;
  projects: Array<ProjectT>;
  payments: Array<PaymentRequest>;
  requestTypes: Array<RequestType>;
  users: Array<User>;
}

export function DataTable({
  data,
  categories,
  projects,
  payments,
  requestTypes,
  users
}: Props) {
  const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdateFacModalOpen, setIsUpdateFacModalOpen] = React.useState(false);
  const [isUpdateRHModalOpen, setIsUpdateRHModalOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  const requestMutation = useMutation({
    mutationFn: async (data: Partial<RequestModelT>) => {
      const id = selectedItem?.id;
      if (!id) throw new Error("ID de besoin manquant");
      await requestQ.update(Number(id), data);
    },
    onSuccess: () => {
      toast.success("Besoin annulé avec succès !");
    },
    onError: () => {
      toast.error("Une erreur est survenue.");
    },
  });

  const handleCancel = async () => {
    try {
      await requestMutation.mutateAsync({ state: "cancel" });
      return true;
    } catch {
      return false;
    }
  };

  // Fonction sécurisée pour obtenir la configuration du statut
  const getStatusConfig = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      config || {
        label: status,
        icon: AlertCircle,
        badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
        rowClassName: "bg-gray-50 dark:bg-gray-950/20",
      }
    );
  };

  const getTranslatedLabel = (label: string) => {
    const translations: Record<string, string> = {
      Pending: "En attente",
      Validated: "Approuvé",
      Rejected: "Refusé",
      "In Review": "En révision",
      Cancel: "Annulé",
      Store: "Déstocké",
    };
    return translations[label] || label;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((proj) => proj.id === Number(projectId));
    return project?.label || projectId;
  };

  function getTypeBadge(
      type: RequestModelT["type"],
    ): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
      const typeData = requestTypes.find((t) => t.type === type);
      const label = typeData?.label ?? type;
      switch (type) {
        case "facilitation":
          return { label, variant: "lime" };
        case "achat":
          return { label, variant: "sky" };
        case "speciaux":
          return { label, variant: "purple" };
        case "ressource_humaine":
          return { label, variant: "blue" };
        case "gas":
          return {label, variant: "teal"};
        case "transport":
          return {label, variant: "primary"};
        case "others" :
          return {label, variant: "dark"};
        default:
          return { label, variant: "outline" };
      }
    }

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = [
    {
      accessorKey: "ref",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Références"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("ref")}</div>
      ),
    },
    {
      accessorKey: "label",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Titres"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const original = row.original;
        const modifier = original.requestOlds?.find((r) => r.id !== user?.id);
        const modified = !modifier
          ? false
          : modifier.priority !==original.priority ||
            modifier.amount !== original.amount ||
            modifier.dueDate !==original.dueDate ||
            modifier.quantity !==original.quantity ||
            modifier.unit !==original.unit;
        return (
          <div className="flex items-center gap-1.5 uppercase">
            {!!modified && (
              <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-sm text-xs">
                <AsteriskIcon size={16} />
              </span>
            )}
            {subText({ text: row.getValue("label") })}
          </div>
        );
      },
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
        const type = getTypeBadge(value.type);
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: "projectId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Projets"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const projectId = row.getValue("projectId") as string;
        const project = projects.find((proj) => proj.id === Number(projectId));
        return (
          <div className="first-letter:uppercase lowercase">
            {project?.label || projectId}
          </div>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Catégories"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const categoryId = row.getValue("categoryId") as string;
        const getCategoryName = (id: number) => {
          return categories.find((x) => x.id === id)?.label || id;
        };
        return (
          <div className="first-letter:uppercase lowercase">
            {getCategoryName(Number(categoryId))}
          </div>
        );
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
            {"Date d'émission"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate first-letter:uppercase">
          {format(new Date(row.getValue("createdAt")), "PP", { locale: fr })}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: ({ column }) => {
        return (
          <span
            className="tablehead"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {"Statuts"}
            <ArrowUpDown />
          </span>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("state") as string;
        const config = getStatusConfig(status);
        const Icon = config.icon;

        return (
          <Badge className={cn("gap-1", config.badgeClassName)}>
            <Icon size={12} />
            {getTranslatedLabel(config.label)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;
        const paiement = payments.find((x) => x.requestId === item?.id);
        const isAttach =
          (item.type === "facilitation" || item.type === "ressource_humaine") &&
          paiement?.proof !== null;

        return (
          <div className="flex items-center gap-2">
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
                  <Eye />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    item.type === "facilitation"
                      ? setIsUpdateFacModalOpen(true)
                      : item.type === "ressource_humaine"
                        ? setIsUpdateRHModalOpen(true)
                        : setIsUpdateModalOpen(true);
                  }}
                  disabled={item.state !== "pending"}
                >
                  <LucidePen />
                  {"Modifier"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    setIsCancelModalOpen(true);
                  }}
                  disabled={
                    item.state !== "pending" ||
                    item.validators.some((v) => v.validated === true)
                  }
                >
                  <LucideBan className="mr-2 h-4 w-4 text-red-500" />
                  {"Annuler"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAttach ? <Paperclip size={16} /> : ""}
          </div>
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
      if (!filterValue || filterValue === "") return true;

      const searchValue = filterValue.toLowerCase().trim();
      const item = row.original;

      // 1. Recherche dans la référence
      if (item.ref?.toLowerCase().includes(searchValue)) return true;

      // 2. Recherche dans le label/titre
      if (item.label?.toLowerCase().includes(searchValue)) return true;

      // 3. Recherche dans le projet
      const projectName = getProjectName(String(item.projectId)).toLowerCase();
      if (projectName.includes(searchValue)) return true;

      // 4. Recherche dans la catégorie
      const categoryName =
        categories
          .find((cat) => cat.id === Number(item.categoryId))
          ?.label?.toLowerCase() || "";
      if (categoryName.includes(searchValue)) return true;

      // 5. Recherche dans le statut
      const statusConfig = getStatusConfig(item.state || "");
      const statusLabel = getTranslatedLabel(statusConfig.label).toLowerCase();
      if (statusLabel.includes(searchValue)) return true;

      // 6. Recherche dans le type
      const typeBadge = getTypeBadge(item.type);
      if (typeBadge.label.toLowerCase().includes(searchValue)) return true;

      // 7. Recherche dans la date (formatée)
      const formattedDate = format(new Date(item.createdAt), "PP", {
        locale: fr,
      }).toLowerCase();
      if (formattedDate.includes(searchValue)) return true;

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilter,
    },
  });

  return (
    <div className="content">
      <div className="flex flex-wrap justify-between gap-4">
        {/* Colonne de visibilité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
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
                    {column.id === "ref"
                      ? "Références"
                      : column.id === "label"
                        ? "Titres"
                        : column.id === "type"
                          ? "Type"
                          : column.id === "state"
                            ? "Statuts"
                            : column.id === "projectId"
                              ? "Projets"
                              : column.id === "categoryId"
                                ? "Catégories"
                                : column.id === "createdAt"
                                  ? "Date d'émission"
                                  : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3>{`Besoins (${data.length})`}</h3>

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
                              header.getContext(),
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
        <Empty message={"Aucun besoin enregistré"} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}

      {/* Modals existants */}
      {selectedItem && (
        <>
          <DetailBesoin
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            data={selectedItem}
            actionButton="Modifier"
            action={() => {
              setIsModalOpen(false);
              {
                selectedItem?.type === "facilitation"
                  ? setIsUpdateFacModalOpen(true)
                  : setIsUpdateModalOpen(true);
              }
            }}
          />
          <UpdateRequest
            open={isUpdateModalOpen}
            setOpen={setIsUpdateModalOpen}
            requestData={selectedItem}
          />
          <UpdateRequestFac
            open={isUpdateFacModalOpen}
            onOpenChange={setIsUpdateFacModalOpen}
            requestData={selectedItem}
            users={users.filter(u=> !!u.verified && u.verified === true)}
            projects={projects}
          />
          <UpdateRHRequest
            open={isUpdateRHModalOpen}
            onOpenChange={setIsUpdateRHModalOpen}
            requestData={selectedItem}
            users={users}
            projects={projects}
          />
        </>
      )}
      <ModalWarning
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Annuler le besoin"
        description="Êtes-vous sûr de vouloir annuler ce besoin ?"
        actionText="Annuler"
        onAction={() => handleCancel()}
        name={selectedItem?.label}
        variant="error"
      />
    </div>
  );
}
