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
  Settings2,
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
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { requestTypeQ } from "@/queries/requestType";
import { DateFilter, RequestModelT } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Empty from "./empty";
import { Pagination } from "./pagination";
import UpdateRHRequest from "../besoin/UpdateRequestRH";

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
}

export function DataTable({ data }: Props) {
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
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // modal specific states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
  const [isUpdateFacModalOpen, setIsUpdateFacModalOpen] = React.useState(false);
  const [isUpdateRHModalOpen, setIsUpdateRHModalOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();

  const getRequestType = useQuery({
    queryKey: ["requestType"],
    queryFn: requestTypeQ.getAll,
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projectQ.getAll();
    },
  });

  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });

  const categoryData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return categoryQ.getCategories();
    },
  });

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

  const uniqueCategories = React.useMemo(() => {
    if (!data || !categoryData.data?.data) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoryData.data.data.find(
        (cat) => cat.id === Number(categoryId),
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
        (proj) => proj.id === Number(projectId),
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
      (proj) => proj.id === Number(projectId),
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
    return data.filter(item => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      //Status Filter
      const matchStatus = statusFilter === "all" ? true : item.state === statusFilter;
      //Category Filter
      const matchCategory = categoryFilter === "all" ? true : item.categoryId === Number(categoryFilter);
      //Project Filter
      const matchProject = projectFilter === "all" ? true : item.projectId === Number(projectFilter);
      // Date Filter
      let matchDate = true;
      if (dateFilter) {
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
            );
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          case "custom":
            if (customDateRange?.from && customDateRange?.to) {
              startDate = customDateRange.from;
              endDate = customDateRange.to;
            }
            break;
        }

        if (
          dateFilter !== "custom" ||
          (customDateRange?.from && customDateRange?.to)
        ) {
          matchDate =
            new Date(item.createdAt) >= startDate &&
            new Date(item.createdAt) <= endDate;
        }
      }
      return matchCategory && matchProject && matchStatus && matchDate;
    })
  }, [data, projectFilter, categoryFilter, statusFilter, globalFilter, dateFilter, customDateRange]);

  function getTypeBadge(
    type:
      | "achat"
      | "ressource_humaine"
      | "facilitation"
      | "speciaux"
      | undefined,
  ): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
    const typeData = getRequestType.data?.data.find((t) => t.type === type);
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
      default:
        return { label: type || "Inconnu", variant: "outline" };
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
        const modified = original.requestOlds?.some(x => x.userId !== user?.id);
        return (
          <div className="flex items-center gap-1.5 max-w-[200px] truncate uppercase">
            {!!modified && <span className="bg-amber-600 border border-amber-200 text-white flex items-center justify-center size-5 rounded-sm text-xs"><AsteriskIcon size={16} /></span>}
            {row.getValue("label")}
          </div>
        )
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
        const project = projectsData.data?.data?.find(
          (proj) => proj.id === Number(projectId),
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
          (x) => x.requestId === item?.id,
        );
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
                      : item.type === "ressource_humaine" ?
                        setIsUpdateRHModalOpen(true) :
                        setIsUpdateModalOpen(true);
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
                    item.validators.some(v => v.validated === true)
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
      if (!filterValue || filterValue === '') return true;

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
      const categoryName = categoryData.data?.data?.find(
        cat => cat.id === Number(item.categoryId)
      )?.label?.toLowerCase() || '';
      if (categoryName.includes(searchValue)) return true;

      // 5. Recherche dans le statut
      const statusConfig = getStatusConfig(item.state || '');
      const statusLabel = getTranslatedLabel(statusConfig.label).toLowerCase();
      if (statusLabel.includes(searchValue)) return true;

      // 6. Recherche dans le type
      const typeBadge = getTypeBadge(item.type);
      if (typeBadge.label.toLowerCase().includes(searchValue)) return true;

      // 7. Recherche dans la date (formatée)
      const formattedDate = format(new Date(item.createdAt), "PP", { locale: fr }).toLowerCase();
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
                            "dd/MM/yyyy",
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
            setOpen={setIsUpdateFacModalOpen}
            requestData={selectedItem}
          />
          <UpdateRHRequest
            open={isUpdateRHModalOpen}
            setOpen={setIsUpdateRHModalOpen}
            requestData={selectedItem}
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
