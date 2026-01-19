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
  CalendarDays,
  CalendarIcon,
  CheckCheck,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Hourglass,
  LucideBan,
  LucideIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { projectQ } from "@/queries/projectModule";
import { requestQ } from "@/queries/requestModule";
import { RequestModelT } from "@/types/types";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DetailBesoin } from "../besoin/detail-besoin";
import { BesoinLastVal } from "../modals/BesoinLastVal";
import { ValidationModal } from "../modals/ValidationModal";
import { Badge, badgeVariants } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Empty from "./empty";
import { Pagination } from "./pagination";
import { SearchableSelect } from "./searchableSelect";

interface DataTableProps {
  data: RequestModelT[];
  isLastValidator: boolean;
  empty: string;
  type?: "pending" | "proceed";
  dateFilter?: "today" | "week" | "month" | "year" | "custom" | undefined;
  setDateFilter?: React.Dispatch<
    React.SetStateAction<
      "today" | "week" | "month" | "year" | "custom" | undefined
    >
  >;
  customDateRange?: { from: Date; to: Date } | undefined;
  setCustomDateRange?: React.Dispatch<
    React.SetStateAction<{ from: Date; to: Date } | undefined>
  >;
}

export function DataValidation({
  data,
  isLastValidator,
  empty,
  type = "pending",
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
}: DataTableProps) {
  const { user } = useStore();
  const queryClient = useQueryClient();
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

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(customDateRange || { from: addDays(new Date(), -7), to: new Date() });

  // Utiliser un état local pour les données du tableau
  const [tableData, setTableData] = React.useState<RequestModelT[]>(data);

  // Mettre à jour les données du tableau quand les props changent
  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  // Modal states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] =
    React.useState(false);
  const [isLastValModalOpen, setIsLastValModalOpen] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      return projectQ.getAll();
    },
  });

  const usersData = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return userQ.getAll();
    },
  });

  // Ajouter le refetch automatique pour les données de validation
  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: async () => requestQ.getAll(),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    refetchOnWindowFocus: true, // Rafraîchir quand la fenêtre reprend le focus
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQ.getCategories(),
  });

  // Fonction pour obtenir le texte d'affichage du filtre de date
  const getDateFilterText = () => {
    switch (dateFilter) {
      case "today":
        return "Aujourd'hui";
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      case "custom":
        if (customDateRange?.from && customDateRange?.to) {
          return `${format(customDateRange.from, "dd/MM/yyyy")} - ${format(
            customDateRange.to,
            "dd/MM/yyyy",
          )}`;
        }
        return "Personnaliser";
      default:
        return "Toutes les périodes";
    }
  };

  // Gérer l'ouverture du modal personnalisé
  const handleCustomDateClick = () => {
    // Initialiser avec la plage actuelle ou une plage par défaut
    setTempCustomDateRange(
      customDateRange || { from: addDays(new Date(), -7), to: new Date() },
    );
    setIsCustomDateModalOpen(true);
  };

  // Appliquer la plage personnalisée
  const applyCustomDateRange = () => {
    if (tempCustomDateRange?.from && tempCustomDateRange?.to) {
      if (setDateFilter) {
        setDateFilter("custom");
      }
      if (setCustomDateRange) {
        setCustomDateRange(tempCustomDateRange);
      }
      setIsCustomDateModalOpen(false);
    } else {
      toast.error("Veuillez sélectionner une plage de dates valide");
    }
  };

  // Réinitialiser le filtre personnalisé
  const clearCustomDateRange = () => {
    if (setDateFilter) {
      setDateFilter(undefined);
    }
    if (setCustomDateRange) {
      setCustomDateRange(undefined);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projectsData.data?.data?.find(
      (proj) => proj.id === Number(projectId),
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.data?.data?.find(
      (cat) => cat.id === Number(categoryId),
    );
    return category?.label || categoryId;
  };

  const getUserName = (userId: string) => {
    const user = usersData.data?.data?.find((u) => u.id === Number(userId));
    return user?.lastName + " " + user?.firstName || userId;
  };

  const uniqueCategories = React.useMemo(() => {
    if (!tableData.length || !categoriesData.data?.data) return [];

    const categoryIds = [...new Set(tableData.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoriesData.data.data.find(
        (cat) => cat.id === Number(categoryId),
      );
      return {
        id: categoryId,
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [tableData, categoriesData.data]);

  const uniqueProjects = React.useMemo(() => {
    if (!tableData.length || !projectsData.data?.data) return [];

    const projectIds = [...new Set(tableData.map((req) => req.projectId))];

    return projectIds.map((projectId) => {
      const project = projectsData.data.data.find(
        (proj) => proj.id === Number(projectId),
      );
      return {
        id: projectId,
        name: project?.label || `Projet ${projectId}`,
      };
    });
  }, [tableData, projectsData.data]);

  const uniqueUsers = React.useMemo(() => {
    if (!tableData.length || !usersData.data?.data) return [];

    const userIds = [...new Set(tableData.map((req) => req.userId))];

    return userIds.map((userId) => {
      const user = usersData.data.data.find((u) => u.id === Number(userId));
      return {
        id: userId,
        name: user?.lastName + " " + user?.firstName || `Utilisateur ${userId}`,
      };
    });
  }, [tableData, usersData.data]);

  const getStatusConfig = (
    status: string,
  ): {
    label: string;
    icon?: LucideIcon;
    variant: VariantProps<typeof badgeVariants>["variant"];
    rowClassName?: string;
  } => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          icon: Hourglass,
          variant: "amber",
          rowClassName: "bg-amber-50/50 hover:bg-amber-50",
        };
      case "validated":
        return {
          label: "Approuvé",
          icon: CheckCircle,
          variant: "success",
          rowClassName: "bg-green-50/50 hover:bg-green-50",
        };
      case "rejected":
        return {
          label: "Rejeté",
          variant: "destructive",
          rowClassName: "bg-red-50/50 hover:bg-red-50",
        };
      case "in-review":
        return {
          label: "En révision",
          variant: "sky",
          rowClassName: "bg-sky-50/50 hover:bg-sky-50",
        };
      case "cancel":
        return { label: "Annulé", variant: "default" };
      default:
        return { label: "Inconnu", variant: "default" };
    }
  };

  const uniqueStatus = React.useMemo(() => {
    if (!tableData.length) return [];
    return [...new Set(tableData.map((req) => req.state))].map((state) => {
      const status = getStatusConfig(state);
      return {
        id: state,
        name: status.label,
        icon: status.icon,
        variant: status.variant,
        rowClassName: status.rowClassName,
      };
    });
  }, [tableData]);

  const getBeneficiaryDisplay = (request: RequestModelT) => {
    if (request.beneficiary === "me") {
      return getUserName(String(request.userId));
    } else if (
      request.beneficiary === "groupe" &&
      request.benef &&
      request.benef.length === 1
    ) {
      return request.beficiaryList![0].name;
    } else if (
      request.beneficiary === "groupe" &&
      request.beficiaryList &&
      request.beficiaryList.length > 0
    ) {
      if (request.beficiaryList.length > 1) {
        return (
          request.beficiaryList
            .slice(0, 1)
            .map((ben) => getUserName(String(ben.name)))
            .join(", ") +
          " + " +
          (request.beficiaryList.length - 1) +
          " autre" +
          (request.beficiaryList.length - 1 > 1 ? "s" : "")
        );
      }
      return request.beficiaryList
        .map((ben) => getUserName(String(ben.name)))
        .join(", ");
    }
    return "Aucun bénéficiaire";
  };

  const reviewRequest = useMutation({
    mutationFn: async ({
      id,
      validated,
      decision,
    }: {
      id: number;
      validated: boolean;
      decision?: string;
    }) => {
      await requestQ.review(id, {
        validated: validated,
        decision: decision,
        userId: user?.id ?? -1,
      });
    },
    onSuccess: () => {
      toast.success("Besoin approuvé avec succès !");
      requestData.refetch();
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  const handleValidation = async (motif?: string): Promise<boolean> => {
    try {
      if (!selectedItem) {
        setIsValidationModalOpen(false);
        return false;
      }

      if (validationType === "approve") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: true,
        });
      } else if (validationType === "reject") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: false,
          decision: motif,
        });
      }

      return true;
    } catch {
      return false;
    } finally {
      setIsValidationModalOpen(false);
    }
  };

  const openValidationModal = (
    type: "approve" | "reject",
    item: RequestModelT,
  ) => {
    setSelectedItem(item);
    setValidationType(type);
    setIsValidationModalOpen(true);
  };

  // Define columns - Seulement les champs demandés
  const columns: ColumnDef<RequestModelT>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<RequestModelT>[] = [
      // Checkbox
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomeRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Sélectionner toutes les lignes"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner cette ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Titres"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
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
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Projets"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div>{getProjectName(row.getValue("projectId"))}</div>
        ),
      },
      {
        accessorKey: "categoryId",
        filterFn: (row, columnId, filterValue) => {
          return String(row.getValue(columnId)) === String(filterValue);
        },
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Catégories"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div>{getCategoryName(row.getValue("categoryId"))}</div>
        ),
      },
      {
        accessorKey: "userId",
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true; // pour "all"
          return String(row.getValue(columnId)) === String(filterValue);
        },
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Emetteurs"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => <div>{getUserName(row.getValue("userId"))}</div>,
      },

      {
        accessorKey: "createdAt",
        filterFn: (row, columnId, filterValue) => {
          return String(row.getValue(columnId)) === String(filterValue);
        },
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Date d'émission"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
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
        accessorKey: "beneficiary",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Bénéficiaires"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {getBeneficiaryDisplay(row.original)}
          </div>
        ),
      },
    ];

    // Ajouter la colonne Statut seulement si type === "proceed"
    if (type === "proceed") {
      baseColumns.splice(2, 0, {
        // Insérer après la 2ème colonne
        accessorKey: "state",
        header: ({ column }) => {
          return (
            <span
              className="tablehead"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Statuts"}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const state = getStatusConfig(row.getValue("state"));
          const Icon = state.icon;

          return (
            <Badge variant={state.variant}>
              {Icon && <Icon />}
              {state.label}
            </Badge>
          );
        },
      });
    }

    // Toujours ajouter la colonne Actions à la fin
    baseColumns.push({
      id: "actions",
      enableHiding: false,
      header: () => <span className="tablehead">{"Actions"}</span>,
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                onClick={() =>
                  isLastValidator
                    ? (setSelectedItem(item), setIsLastValModalOpen(true))
                    : openValidationModal("approve", item)
                }
                disabled={
                  item.state !== "pending" ||
                  item.revieweeList?.some((x) => x.validatorId === user?.id)
                }
              >
                <CheckCheck className="text-green-500 mr-2 h-4 w-4" />
                {"Approuver"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openValidationModal("reject", item)}
                disabled={
                  item.state !== "pending" ||
                  item.revieweeList?.some((x) => x.validatorId === user?.id)
                }
              >
                <LucideBan className="text-red-500 mr-2 h-4 w-4" />
                {"Rejeter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });

    return baseColumns;
  }, [type, isLastValidator, user?.id]);

  const table = useReactTable({
    data: tableData.reverse() || [],
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

      // Recherche dans toutes les colonnes principales avec conversion des IDs en noms
      const searchableColumns = ["label"];

      return searchableColumns.some((columnId) => {
        const rawValue = row.getValue(columnId);
        let displayValue = rawValue;

        // Convertir les IDs en noms pour la recherche
        if (columnId === "projectId") {
          displayValue = getProjectName(String(rawValue));
        } else if (columnId === "categoryId") {
          displayValue = getCategoryName(String(rawValue));
        } else if (columnId === "userId") {
          displayValue = getUserName(String(rawValue));
        } else if (columnId === "beneficiary") {
          displayValue = getBeneficiaryDisplay(row.original);
        }

        return String(displayValue).toLowerCase().includes(searchValue);
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
          placeholder="Rechercher par titre..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Status filter */}
        {type === "proceed" && (
          <Select
            defaultValue="all"
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
              <SelectValue placeholder="Filtrer par statu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{"Tous les statuts"}</SelectItem>
              {uniqueStatus?.map((state) => {
                return (
                  <SelectItem
                    key={state.id}
                    value={state.id}
                    className="capitalize"
                  >
                    {state.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}

        {/* Category filter */}
        <SearchableSelect
          value={
            (table.getColumn("categoryId")?.getFilterValue() as string) ?? "all"
          }
          onChange={(value) =>
            table
              .getColumn("categoryId")
              ?.setFilterValue(value === "all" ? "" : value)
          }
          placeholder="Filtrer par catégorie"
          allLabel="Toutes les catégories"
          options={uniqueCategories.map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
        />

        {/* Project filter */}
        <SearchableSelect
          value={
            (table.getColumn("projectId")?.getFilterValue() as string) ?? "all"
          }
          onChange={(value) =>
            table
              .getColumn("projectId")
              ?.setFilterValue(value === "all" ? "" : value)
          }
          placeholder="Filtrer par projet"
          allLabel="Tous les projets"
          options={uniqueProjects.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
        />

        {/* Users filter */}
        <SearchableSelect
          value={
            (table.getColumn("userId")?.getFilterValue() as string) ?? "all"
          }
          onChange={(value) =>
            table
              .getColumn("userId")
              ?.setFilterValue(value === "all" ? "" : value)
          }
          placeholder="Filtrer par émetteur"
          allLabel="Tous les émetteurs"
          options={uniqueUsers.map((u) => ({
            value: String(u.id),
            label: u.name,
          }))}
        />

        {/* Date filter - seulement si setDateFilter est fourni */}
        {setDateFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                {getDateFilterText()}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => clearCustomDateRange()}
                className={cn(
                  "flex items-center justify-between",
                  !dateFilter && "bg-accent",
                )}
              >
                <span>{"Toutes les périodes"}</span>
                {!dateFilter && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDateFilter("today")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "today" && "bg-accent",
                )}
              >
                <span>{"Aujourd'hui"}</span>
                {dateFilter === "today" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("week")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "week" && "bg-accent",
                )}
              >
                <span>{"Cette semaine"}</span>
                {dateFilter === "week" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("month")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "month" && "bg-accent",
                )}
              >
                <span>{"Ce mois"}</span>
                {dateFilter === "month" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("year")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "year" && "bg-accent",
                )}
              >
                <span>{"Cette année"}</span>
                {dateFilter === "year" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCustomDateClick}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "custom" && "bg-accent",
                )}
              >
                <span className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {"Personnaliser"}
                </span>
                {dateFilter === "custom" && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
                    {column.id === "label"
                      ? "Titres"
                      : column.id === "projectId"
                        ? "Projets"
                        : column.id === "categoryId"
                          ? "Catégories"
                          : column.id === "userId"
                            ? "Emetteurs"
                            : column.id === "beneficiary"
                              ? "Beneficiaires"
                              : column.id === "createdAt"
                                ? "Date d'émission"
                                : column.id === "state"
                                  ? "Statuts"
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
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    getStatusConfig(row.original.state).rowClassName,
                  )}
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty message={empty} />
      )}

      {/* Pagination */}
      {table.getRowModel().rows?.length > 0 && (
        <Pagination table={table} pageSize={15} />
      )}

      {/* Modal pour la plage de dates personnalisée */}
      <Dialog
        open={isCustomDateModalOpen}
        onOpenChange={setIsCustomDateModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{"Sélectionner une plage de dates"}</DialogTitle>
            <DialogDescription>
              {"Choisissez la période que vous souhaitez filtrer"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">{"Date de début"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.from ? (
                        format(tempCustomDateRange.from, "PPP", { locale: fr })
                      ) : (
                        <span>{"Sélectionner une date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.from}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: date || prev?.from || new Date(),
                          to: prev?.to || new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">{"Date de fin"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tempCustomDateRange?.to && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempCustomDateRange?.to ? (
                        format(tempCustomDateRange.to, "PPP", { locale: fr })
                      ) : (
                        <span>{"Sélectionner une date"}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempCustomDateRange?.to}
                      onSelect={(date) =>
                        setTempCustomDateRange((prev) => ({
                          from: prev?.from || new Date(),
                          to: date || prev?.to || new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <Calendar
                mode="range"
                selected={tempCustomDateRange}
                onSelect={(range) =>
                  setTempCustomDateRange(range as { from: Date; to: Date })
                }
                numberOfMonths={1}
                className="rounded-md border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomDateModalOpen(false)}
            >
              {"Annuler"}
            </Button>
            <Button onClick={applyCustomDateRange}>{"Appliquer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {selectedItem && (
        <DetailBesoin
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={selectedItem}
          actionButton="Approuver"
          action={() =>
            isLastValidator
              ? (setIsModalOpen(false), setIsLastValModalOpen(true))
              : (setIsModalOpen(false),
                openValidationModal("approve", selectedItem!))
          }
        />
      )}

      <ValidationModal
        isMotifRequired={true}
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        type={validationType}
        title={
          validationType === "approve"
            ? "Approuver le besoin"
            : "Rejeter le besoin"
        }
        description={
          validationType === "approve"
            ? "Êtes-vous sûr de vouloir approuver ce besoin ?"
            : "Êtes-vous sûr de vouloir rejeter ce besoin ? Veuillez fournir un motif."
        }
        successConfirmation={{
          title: "Succès ✅",
          description:
            validationType === "approve"
              ? "Le besoin a été approuvé avec succès."
              : "Le besoin a été rejeté avec succès.",
        }}
        errorConfirmation={{
          title: "Erreur ❌",
          description: "Une erreur est survenue lors de l'opération.",
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
        onSubmit={(motif) => handleValidation(motif)}
      />
      <BesoinLastVal
        open={isLastValModalOpen}
        onOpenChange={setIsLastValModalOpen}
        data={selectedItem}
        titre={"Approuver le besoin"}
        description={"Êtes-vous sûr de vouloir approuver ce besoin ?"}
      />
    </div>
  );
}
