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
  Clock,
  Eye,
  Hourglass,
  LucideBan,
  LucideIcon,
  Users,
  UserCheck,
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
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";
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
import { Checkbox } from "../ui/checkbox";

interface DataTableProps {
  data: RequestModelT[];
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
  customProps?: {
    userPosition?: number | null;
    categoryName?: string;
    totalValidators?: number;
    validatedCount?: number;
  };
}

export function DataVal({
  data,
  empty,
  type = "pending",
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  customProps,
}: DataTableProps) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
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
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] =
    React.useState(false);
  const [isLastValModalOpen, setIsLastValModalOpen] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");

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
  const categoryQueries = new CategoryQueries();

  // Ajouter le refetch automatique pour les données de validation
  const requestData = useQuery({
    queryKey: ["requests"],
    queryFn: async () => request.getAll(),
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    refetchOnWindowFocus: true, // Rafraîchir quand la fenêtre reprend le focus
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQueries.getCategories(),
  });

  // Fonction pour obtenir la position de l'utilisateur pour un besoin donné
  const getUserPositionForRequest = (request: RequestModelT) => {
    if (!request.categoryId || !user?.id || !categoriesData.data?.data) return null;
    
    const category = categoriesData.data.data.find(cat => cat.id === request.categoryId);
    if (!category || !category.validators) return null;
    
    const validator = category.validators.find(v => v.userId === user.id);
    return validator?.rank || null;
  };

  // Fonction pour vérifier si l'utilisateur est le dernier validateur pour un besoin
  const isUserLastValidatorForRequest = (request: RequestModelT) => {
    if (!request.categoryId || !user?.id || !categoriesData.data?.data) return false;
    
    const category = categoriesData.data.data.find(cat => cat.id === request.categoryId);
    if (!category || !category.validators || category.validators.length === 0) {
      return false;
    }

    // Trouver le validateur avec la position la plus élevée
    const maxPosition = Math.max(...category.validators.map(v => v.rank));
    const lastValidator = category.validators.find(v => v.rank === maxPosition);
    
    return lastValidator?.userId === user.id;
  };

  // Fonction pour vérifier si l'utilisateur a déjà validé un besoin
  const hasUserAlreadyValidated = (request: RequestModelT) => {
    return request.revieweeList?.some(r => r.validatorId === user?.id) || false;
  };

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
            "dd/MM/yyyy"
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
      customDateRange || { from: addDays(new Date(), -7), to: new Date() }
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
      (proj) => proj.id === Number(projectId)
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData.data?.data?.find(
      (cat) => cat.id === Number(categoryId)
    );
    return category?.label || categoryId;
  };

  const getUserName = (userId: string) => {
    const user = usersData.data?.data?.find((u) => u.id === Number(userId));
    return user?.name || userId;
  };

  const uniqueCategories = React.useMemo(() => {
    if (!tableData.length || !categoriesData.data?.data) return [];

    const categoryIds = [...new Set(tableData.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoriesData.data.data.find(
        (cat) => cat.id === Number(categoryId)
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
        (proj) => proj.id === Number(projectId)
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
        name: user?.name || `Utilisateur ${userId}`,
      };
    });
  }, [tableData, usersData.data]);

  const getStatusConfig = (
    status: string
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
    mutationKey: ["requests-review"],
    mutationFn: async ({
      id,
      validated,
      decision,
    }: {
      id: number;
      validated: boolean;
      decision?: string;
    }) => {
      await request.review(id, {
        validated: validated,
        decision: decision,
        userId: user?.id ?? -1,
      });
    },
    onSuccess: () => {
      toast.success(
        validationType === "approve" 
          ? "Besoin approuvé avec succès !" 
          : "Besoin rejeté avec succès !"
      );
      // Invalider et rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ["requests"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests-validation"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", user?.id],
        refetchType: "active",
      });
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
    item: RequestModelT
  ) => {
    setSelectedItem(item);
    setValidationType(type);
    setIsValidationModalOpen(true);
  };

  // Fonction pour obtenir l'info de validation pour un besoin
  const getValidationInfo = (request: RequestModelT) => {
    const userPosition = getUserPositionForRequest(request);
    const isLastValidator = isUserLastValidatorForRequest(request);
    const categoryName = getCategoryName(String(request.categoryId));
    
    // Trouver la catégorie pour obtenir le nombre total de validateurs
    const category = categoriesData.data?.data?.find(
      cat => cat.id === request.categoryId
    );
    const totalValidators = category?.validators?.length || 0;
    const validatedCount = request.revieweeList?.length || 0;

    return {
      userPosition,
      isLastValidator,
      categoryName,
      totalValidators,
      validatedCount,
      progress: totalValidators > 0 ? (validatedCount / totalValidators) * 100 : 0,
      canValidate: !hasUserAlreadyValidated(request) && 
                   request.state === "pending" && 
                   userPosition !== null,
    };
  };

  // Define columns
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
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
          <div className="max-w-[200px] truncate font-medium">
            {row.getValue("label")}
          </div>
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
          <div className="text-sm">{getProjectName(row.getValue("projectId"))}</div>
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
        cell: ({ row }) => {
          const categoryName = getCategoryName(row.getValue("categoryId"));
          const validationInfo = getValidationInfo(row.original);
          
          return (
            <div>
              <div className="font-medium text-sm">{categoryName}</div>
              {validationInfo.userPosition && (
                <div className="flex items-center gap-1 mt-1">
                  <UserCheck className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    Position {validationInfo.userPosition}
                    {validationInfo.isLastValidator && " (Final)"}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "userId",
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true;
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
        cell: ({ row }) => (
          <div className="text-sm">{getUserName(row.getValue("userId"))}</div>
        ),
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
          <div className="text-sm">
            {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", { locale: fr })}
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
          <div className="text-sm max-w-[200px] truncate">
            {getBeneficiaryDisplay(row.original)}
          </div>
        ),
      },
      // Nouvelle colonne : Progression de validation (uniquement pour type pending)
      ...(type === "pending" ? [{
        id: "validationProgress",
        header: () => <span className="tablehead">{"Progression"}</span>,
        cell: ({ row }: { row: ReturnType<typeof table.getRowModel>['rows'][number] }) => {
          const validationInfo = getValidationInfo(row.original);
          
          if (!validationInfo.totalValidators) return null;
          
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${validationInfo.progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {validationInfo.validatedCount}/{validationInfo.totalValidators}
                </div>
              </div>
              {validationInfo.userPosition && (
                <Badge 
                  variant={validationInfo.isLastValidator ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {validationInfo.isLastValidator ? "Final" : `P${validationInfo.userPosition}`}
                </Badge>
              )}
            </div>
          );
        },
      }] : []),
    ];

    // Ajouter la colonne Statut seulement si type === "proceed"
    if (type === "proceed") {
      baseColumns.splice(3, 0, {
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
            <Badge variant={state.variant} className="text-xs">
              {Icon && <Icon className="h-3 w-3 mr-1" />}
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
        const validationInfo = getValidationInfo(item);
        const userHasValidated = hasUserAlreadyValidated(item);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size="sm">
                {"Actions"}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal text-xs text-gray-500">
                {validationInfo.categoryName}
                {validationInfo.userPosition && (
                  <span className="block">Position {validationInfo.userPosition}</span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                {"Voir les détails"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  validationInfo.isLastValidator
                    ? (setSelectedItem(item), setIsLastValModalOpen(true))
                    : openValidationModal("approve", item)
                }
                disabled={
                  !validationInfo.canValidate || 
                  item.state !== "pending" || 
                  userHasValidated
                }
                className={!validationInfo.canValidate ? "opacity-50 cursor-not-allowed" : ""}
              >
                <CheckCheck className="text-green-500 mr-2 h-4 w-4" />
                {"Approuver"}
                {validationInfo.isLastValidator && " (Final)"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openValidationModal("reject", item)}
                disabled={
                  !validationInfo.canValidate || 
                  item.state !== "pending" || 
                  userHasValidated
                }
                className={!validationInfo.canValidate ? "opacity-50 cursor-not-allowed" : ""}
              >
                <LucideBan className="text-red-500 mr-2 h-4 w-4" />
                {"Rejeter"}
                {validationInfo.isLastValidator && " (Final)"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });

    return baseColumns;
  }, [type, user?.id, categoriesData.data]);

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

      const searchableColumns = [
        "label", 
        "projectId", 
        "categoryId", 
        "userId", 
        "beneficiary"
      ];

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
      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* Global search */}
        <Input
          placeholder="Rechercher par titre, catégorie, projet..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Status filter - seulement pour proceed */}
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Statut" />
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
          placeholder="Catégorie"
          allLabel="Toutes"
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
          placeholder="Projet"
          allLabel="Tous"
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
          placeholder="Émetteur"
          allLabel="Tous"
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
                  !dateFilter && "bg-accent"
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
                  dateFilter === "today" && "bg-accent"
                )}
              >
                <span>{"Aujourd'hui"}</span>
                {dateFilter === "today" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("week")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "week" && "bg-accent"
                )}
              >
                <span>{"Cette semaine"}</span>
                {dateFilter === "week" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("month")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "month" && "bg-accent"
                )}
              >
                <span>{"Ce mois"}</span>
                {dateFilter === "month" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("year")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "year" && "bg-accent"
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
                  dateFilter === "custom" && "bg-accent"
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
                      ? "Bénéficiaires"
                      : column.id === "createdAt"
                      ? "Date d'émission"
                      : column.id === "state"
                      ? "Statuts"
                      : column.id === "validationProgress"
                      ? "Progression"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {table.getRowModel().rows?.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="border-r last:border-r-0 py-3"
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
                const validationInfo = getValidationInfo(row.original);
                const statusConfig = getStatusConfig(row.original.state);
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-gray-50",
                      statusConfig.rowClassName,
                      validationInfo.userPosition && "border-l-4",
                      validationInfo.userPosition === 1 && "border-l-blue-400",
                      validationInfo.userPosition === 2 && "border-l-green-400",
                      validationInfo.userPosition === 3 && "border-l-red-400",
                      validationInfo.isLastValidator && "border-l-red-400"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r last:border-r-0 py-3"
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
                        !tempCustomDateRange?.from && "text-muted-foreground"
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
                        !tempCustomDateRange?.to && "text-muted-foreground"
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
      <DetailBesoin
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        data={selectedItem}
        actionButton="Approuver"
        action={() => {
          if (!selectedItem) return;
          
          const validationInfo = getValidationInfo(selectedItem);
          if (validationInfo.isLastValidator) {
            setIsModalOpen(false);
            setIsLastValModalOpen(true);
          } else {
            setIsModalOpen(false);
            openValidationModal("approve", selectedItem);
          }
        }}
      />

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