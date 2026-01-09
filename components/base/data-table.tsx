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
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  LucideBan,
  LucidePen,
  Paperclip,
  Settings2,
  XCircle
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
import { useStore } from "@/providers/datastore";
import { CategoryQueries } from "@/queries/categoryModule";
import { PaymentQueries } from "@/queries/payment";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";
import { DateFilter, PAYMENT_TYPES, RequestModelT } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DetailBesoin } from "../besoin/detail-besoin";
import UpdateRequest from "../besoin/UpdateRequest";
import UpdateRequestFac from "../besoin/UpdateRequestFac";
import { ModalWarning } from "../modals/modal-warning";
import { Badge, badgeVariants } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Label } from "../ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import Empty from "./empty";
import { Pagination } from "./pagination";

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
  store: {
    label: "Store",
    icon: AlertCircle,
    badgeClassName: "bg-blue-200 text-blue-500 outline outline-blue-600 ",
    rowClassName: "bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30",
  },
  cancel: {
    label: "Cancel",
    icon: Ban,
    badgeClassName: "bg-gray-200 text-gray-500 outline outline-gray-600",
    rowClassName: "bg-gray-50 dark:bg-gray-950/20 dark:hover:bg-gray-950/30",
  },
};

interface Props {
  data: Array<RequestModelT>
}

export function DataTable({
  data
}: Props) {
  const { user } = useStore();
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
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdateFacModalOpen, setIsUpdateFacModalOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const queryClient = useQueryClient();

  const projects = new ProjectQueries();
  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projects.getAll();
    },
  });

  const payments = new PaymentQueries();
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => payments.getAll(),
  });

  const category = new CategoryQueries();
  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return category.getCategories();
    },
  });

  const request = new RequestQueries();
  const requestMutation = useMutation({
    mutationKey: ["requests"],
    mutationFn: async (data: Partial<RequestModelT>) => {
      const id = selectedItem?.id;
      if (!id) throw new Error("ID de besoin manquant");
      await request.update(Number(id), data);
    },
    onSuccess: () => {
      toast.success("Besoin annulé avec succès !");
      // Rafraîchir les données après une annulation réussie
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
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

  const uniqueCategories = React.useMemo(() => {
    if (!data || !categoryData.data?.data) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoryData.data.data.find(
        (cat) => cat.id === Number(categoryId)
      );
      return {
        id: categoryId,
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [data, categoryData.data]);

  const uniqueProjects = React.useMemo(() => {
    if (!data || !projectsData.data?.data) return [];

    const projectIds = [...new Set(data.map((req) => req.projectId))];

    return projectIds.map((projectId) => {
      const project = projectsData.data?.data.find(
        (proj) => proj.id === Number(projectId)
      );
      return {
        id: projectId,
        label: project?.label || `Projet ${projectId}`,
      };
    });
  }, [data, projectsData.data]);

  const uniqueStatuses = React.useMemo(() => {
    if (!data) return [];

    const statuses = [...new Set(data.map((req) => req.state))];

    return statuses.map((status) => {
      const config = getStatusConfig(status);
      return {
        id: status,
        name: config.label,
        icon: config.icon,
        badgeClassName: config.badgeClassName,
        rowClassName: config.rowClassName,
      };
    });
  }, [data]);

  const getProjectName = (projectId: string) => {
    const project = projectsData.data?.data?.find(
      (proj) => proj.id === Number(projectId)
    );
    return project?.label || projectId;
  };

  // Réinitialiser tous les filtres
  const resetAllFilters = () => {
    setDateFilter(undefined);
    setCustomDateRange(undefined);
    setGlobalFilter("");
    setProjectFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // Fonction pour filtrer les données avec TOUS les filtres
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtrer par statut local
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.state === statusFilter
      );
    }

    // Filtrer par catégorie locale
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(
        (item) =>
          String(item.categoryId) === String(categoryFilter)
      );
    }

    // Filtrer par recherche globale locale
    if (globalFilter) {
      const searchValue = globalFilter.toLowerCase();
      filtered = filtered.filter((item) => {
        const searchText = [
          item.label || "",
          item.ref || "",
          getProjectName(String(item.projectId)) || "",
        ]
          .join(" ")
          .toLowerCase();
        return searchText.includes(searchValue);
      });
    }

    // Filtre par projet local
    if (projectFilter && projectFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.projectId) === String(projectFilter)
      );
    }

    return filtered;
  }, [data, projectFilter, categoryFilter, statusFilter, globalFilter]);

  function getTypeBadge(type: "SPECIAL" | "RH" | "FAC" | "PURCHASE" | undefined): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
    const typeData = PAYMENT_TYPES.find(t => t.value === type);
    const label = typeData?.name ?? "Inconnu"
    switch (type) {
      case "FAC":
        return { label, variant: "lime" };
      case "PURCHASE":
        return { label, variant: "sky" };
      case "SPECIAL":
        return { label, variant: "purple" };
      case "RH":
        return { label, variant: "blue" };
      default:
        return { label: type || "Inconnu", variant: "outline" };
    }
  };

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
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate uppercase">
          {row.getValue("label")}
        </div>
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
        const project = projectsData.data?.data?.find(
          (proj) => proj.id === Number(projectId)
        );
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
          return categoryData.data?.data.find((x) => x.id === id)?.label || id;
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
        const paiement = paymentsData.data?.data.find(
          (x) => x.requestId === item?.id
        );
        const isAttach = (item.type === "FAC" || item.type === "RH") && paiement?.proof !== null;

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
                  <Eye className="mr-2 h-4 w-4" />
                  {"Voir"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(item);
                    console.log(item.type);

                    item.type === "FAC" ? setIsUpdateFacModalOpen(true) : setIsUpdateModalOpen(true);
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
                  disabled={
                    item.state !== "pending" ||
                    (item.revieweeList?.length ?? 0) > 0
                  }
                >
                  <LucideBan className="mr-2 h-4 w-4 text-red-500" />
                  {"Annuler"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAttach ? <Paperclip /> : ""}
          </div>
        );
      },
    },
  ];

  const table = useReactTable<RequestModelT>({
    data: filteredData || [],
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
      const searchValue = filterValue.toLowerCase();
      const reference = row.getValue("ref") as string;
      if (reference.toLocaleLowerCase().includes(searchValue)) return true;
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
              <div className="grid gap-1.5">
                <Label htmlFor="search">{"Rechercher"}</Label>
                <Input
                  placeholder="Titre, référence, ou projet"
                  name="search"
                  type="search"
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className="w-full"
                />
              </div>
              {/* Category filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="category">{"Catégorie"}</Label>
                <Select
                  name="category"
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes"}</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="project">{"Projet"}</Label>
                <Select
                  name="project"
                  value={projectFilter}
                  onValueChange={(v) => setProjectFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={String(project.id)}>
                        {project.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status filter */}
              <div className="grid gap-1.5">
                <Label htmlFor="status">{"Statut"}</Label>
                <Select
                  name="status"
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(String(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Tous"}</SelectItem>
                    {uniqueStatuses.map((state) => (
                      <SelectItem key={state.id} value={String(state.id)}>
                        {getTranslatedLabel(state.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filtre par période */}
              <div className="grid gap-1.5">
                <Label>{"Période"}</Label>
                <Select
                  onValueChange={(v) => {
                    if (v !== "custom") {
                      setCustomDateRange(undefined);
                      setIsCustomDateModalOpen(false);
                    }
                    if (v === "all") return setDateFilter(undefined);
                    setDateFilter(v as Exclude<DateFilter, undefined>);
                    setIsCustomDateModalOpen(v === "custom");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{"Toutes les périodes"}</SelectItem>
                    <SelectItem value="today">{"Aujourd'hui"}</SelectItem>
                    <SelectItem value="week">{"Cette semaine"}</SelectItem>
                    <SelectItem value="month">{"Ce mois"}</SelectItem>
                    <SelectItem value="year">{"Cette année"}</SelectItem>
                    <SelectItem value="custom">{"Personnalisé"}</SelectItem>
                  </SelectContent>
                </Select>
                <Collapsible
                  open={isCustomDateModalOpen}
                  onOpenChange={setIsCustomDateModalOpen}
                  disabled={dateFilter !== "custom"}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {"Plage personnalisée"}
                      <span className="text-muted-foreground text-xs">
                        {customDateRange?.from && customDateRange.to
                          ? `${format(
                            customDateRange.from,
                            "dd/MM/yyyy"
                          )} → ${format(customDateRange.to, "dd/MM/yyyy")}`
                          : "Choisir"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 pt-4">
                    <Calendar
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) =>
                        setCustomDateRange(range as { from: Date; to: Date })
                      }
                      numberOfMonths={1}
                      className="rounded-md border w-full"
                    />
                    <div className="space-y-1">
                      <Button
                        className="w-full"
                        onClick={() => {
                          setCustomDateRange(undefined);
                          setDateFilter(undefined);
                          setIsCustomDateModalOpen(false);
                        }}
                      >
                        {"Annuler"}
                      </Button>
                      <Button
                        className="w-full"
                        variant={"outline"}
                        onClick={() => {
                          setIsCustomDateModalOpen(false);
                        }}
                      >
                        {"Réduire"}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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

        {/* Colonne de visibilité */}
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

      {/* Modals existants */}
      {
        selectedItem &&
        <>
          <DetailBesoin
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            data={selectedItem}
            actionButton="Modifier"
            action={() => {
              setIsModalOpen(false);
              { selectedItem?.type === "FAC" ? setIsUpdateFacModalOpen(true) : setIsUpdateModalOpen(true) };
            }}
          />
          <UpdateRequest
            open={isUpdateModalOpen}
            setOpen={setIsUpdateModalOpen}
            requestData={selectedItem}
          />
          <UpdateRequestFac
            open={isUpdateFacModalOpen}
            setOpen={setIsUpdateFacModalOpen}
            requestData={selectedItem}
          />
        </>
      }
      <ModalWarning
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        title="Annuler le besoin"
        description="Êtes-vous sûr de vouloir annuler ce besoin ?"
        actionText="Annuler"
        onAction={() => handleCancel()
        }
        name={selectedItem?.label}
        variant="error"
      />
    </div>
  );
}
