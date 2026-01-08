"use client";

import {
  type ColumnDef,
  Row,
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
  UserCheck,
  X,
  CheckSquare,
  Square,
  Users,
  Circle,
  LoaderIcon,
  Paperclip,
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
import { Category, PAYMENT_TYPES, PaymentRequest, ProjectT, RequestModelT, User } from "@/types/types";
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
import { Textarea } from "../ui/textarea";

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
  isCheckable?: boolean;
  categoriesData?: Category[];
  projectsData?: ProjectT[];
  usersData?: User[];
  paymentsData?: PaymentRequest[];
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
  isCheckable = false,
  categoriesData,
  projectsData,
  usersData,
  paymentsData,
}: DataTableProps) {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const request = new RequestQueries();

  // États pour les filtres
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [userFilter, setUserFilter] = React.useState<string>("all");

  // États pour le modal personnalisé
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] =
    React.useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >(customDateRange || { from: addDays(new Date(), -7), to: new Date() });

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

  // États pour les actions de groupe
  const [isGroupActionDialogOpen, setIsGroupActionDialogOpen] = React.useState(false);
  const [groupActionType, setGroupActionType] = React.useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isProcessingGroupAction, setIsProcessingGroupAction] = React.useState(false);

  // Fonction pour obtenir la position de l'utilisateur pour un besoin donné
  const getUserPositionForRequest = (request: RequestModelT) => {
    if (
      request.categoryId === null ||
      user?.id === null ||
      categoriesData === undefined
    )
      return null;

    const category = categoriesData.find(
      (cat) => cat.id === request.categoryId
    );
    if (!category || !category.validators) return null;

    const validator = category.validators.find((v) => v.userId === user?.id);
    return validator?.rank || null;
  };

  // Fonction pour vérifier si l'utilisateur est le dernier validateur pour un besoin
  const isUserLastValidatorForRequest = (request: RequestModelT) => {
    if (
      request.categoryId === null ||
      user?.id === null ||
      categoriesData === undefined
    )
      return false;

    const category = categoriesData.find(
      (cat) => cat.id === request.categoryId
    );
    if (!category || !category.validators || category.validators.length === 0) {
      return false;
    }

    // Trouver le validateur avec la position la plus élevée
    const maxPosition = Math.max(...category.validators.map((v) => v.rank));
    const lastValidator = category.validators.find(
      (v) => v.rank === maxPosition
    );

    return lastValidator?.userId === user?.id;
  };

  // Fonction pour vérifier si l'utilisateur a déjà validé un besoin
  const hasUserAlreadyValidated = (request: RequestModelT) => {
    return (
      request.revieweeList?.some((r) => r.validatorId === user?.id) || false
    );
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
    const project = projectsData?.find(
      (proj) => proj.id === Number(projectId)
    );
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData?.find(
      (cat) => cat.id === Number(categoryId)
    );
    return category?.label || categoryId;
  };

  const getUserName = (userId: string) => {
    const user = usersData?.find((u) => u.id === Number(userId));
    return user?.lastName + " " + user?.firstName || userId;
  };

  // Fonction pour filtrer les données manuellement
  const filteredData = React.useMemo(() => {
    let filtered = [...data];

    // Filtrer par statut (seulement pour type proceed)
    if (type === "proceed" && statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((item) => item.state === statusFilter);
    }

    // Filtrer par catégorie
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.categoryId) === String(categoryFilter)
      );
    }

    // Filtrer par projet
    if (projectFilter && projectFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.projectId) === String(projectFilter)
      );
    }

    // Filtrer par utilisateur
    if (userFilter && userFilter !== "all") {
      filtered = filtered.filter(
        (item) => String(item.userId) === String(userFilter)
      );
    }

    // Filtrer par recherche globale
    if (globalFilter) {
      const searchValue = globalFilter.toLowerCase();
      filtered = filtered.filter((item) => {
        const searchText = [
          item.label || "",
          getProjectName(String(item.projectId)) || "",
          getCategoryName(String(item.categoryId)) || "",
          getUserName(String(item.userId)) || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(searchValue);
      });
    }

    return filtered;
  }, [
    data,
    globalFilter,
    statusFilter,
    categoryFilter,
    projectFilter,
    userFilter,
    type,
  ]);

  const uniqueCategories = React.useMemo(() => {
    if (!data.length || !categoriesData) return [];

    const categoryIds = [...new Set(data.map((req) => req.categoryId))];

    return categoryIds.map((categoryId) => {
      const category = categoriesData.find(
        (cat) => cat.id === Number(categoryId)
      );
      return {
        id: categoryId,
        name: category?.label || `Catégorie ${categoryId}`,
      };
    });
  }, [data, categoriesData]);

  const uniqueProjects = React.useMemo(() => {
    if (!data.length || !projectsData) return [];

    const projectIds = [...new Set(data.map((req) => req.projectId))];

    return projectIds.map((projectId) => {
      const project = projectsData.find(
        (proj) => proj.id === Number(projectId)
      );
      return {
        id: projectId,
        name: project?.label || `Projet ${projectId}`,
      };
    });
  }, [data, projectsData]);

  const uniqueUsers = React.useMemo(() => {
    if (!data.length || !usersData) return [];

    const userIds = [...new Set(data.map((req) => req.userId))];

    return userIds.map((userId) => {
      const user = usersData.find((u) => u.id === Number(userId));
      return {
        id: userId,
        name: user?.lastName + " " + user?.firstName || `Utilisateur ${userId}`,
      };
    });
  }, [data, usersData]);

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
    if (!data.length) return [];
    return [...new Set(data.map((req) => req.state))].map((state) => {
      const status = getStatusConfig(state);
      return {
        id: state,
        name: status.label,
        icon: status.icon,
        variant: status.variant,
        rowClassName: status.rowClassName,
      };
    });
  }, [data]);

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
      validatorId,
      validator,
    }: {
      id: number;
      validated: boolean;
      decision?: string;
      validatorId?: number;
      validator?:
      | {
        id?: number | undefined;
        userId: number;
        rank: number;
      }
      | undefined;
    }) => {
      await request.review(id, {
        validated: validated,
        decision: decision,
        userId: validatorId ?? -1,
        validator: validator,
      });
    },
    onSuccess: () => {
      toast.success(
        validationType === "approve"
          ? "Besoin approuvé avec succès !"
          : "Besoin rejeté avec succès !"
      );
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la validation.");
    },
  });

  const handleValidation = async (motif?: string): Promise<boolean> => {
    const validator = categoriesData
      ?.find((cat) => cat.id === selectedItem?.categoryId)
      ?.validators?.find((v) => v.userId === user?.id);

    try {
      if (!selectedItem) {
        setIsValidationModalOpen(false);
        return false;
      }

      if (validationType === "approve") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: true,
          validatorId: validator?.id,
          validator: validator,
        });
      } else if (validationType === "reject") {
        await reviewRequest.mutateAsync({
          id: Number(selectedItem.id),
          validated: false,
          decision: motif,
          validatorId: validator?.id,
          validator: validator,
        });
      }

      return true;
    } catch {
      return false;
    } finally {
      setIsValidationModalOpen(false);
    }
  };

  const reviewGroupRequests = useMutation({
    mutationKey: ["requests-group-review"],
    mutationFn: async ({
      ids,
      validated,
      decision,
      validatorId,
      validator,
      isLastValidator, // Nouveau paramètre pour déterminer quelle méthode utiliser
    }: {
      ids: number[];
      validated: boolean;
      decision?: string;
      validatorId?: number;
      validator?: {
        id?: number | undefined;
        userId: number;
        rank: number;
      };
      isLastValidator?: boolean; // Pour déterminer si on utilise validateBulk ou reviewBulk
    }) => {
      if (isLastValidator) {
        // Utiliser validateBulk pour le dernier validateur
        return request.validateBulk({
          ids,
          validatorId: validatorId ?? -1,
        });
      } else {
        // Utiliser reviewBulk pour les validateurs ascendants
        return request.reviewBulk({
          ids,
          validated,
          decision,
          validatorId: validatorId ?? -1,
        });
      }
    },
    onSuccess: (data, variables) => {
      const selectedCount = Object.keys(rowSelection).length;
      const actionType = variables.validated ? "approuvé" : "rejeté";

      toast.success(
        `${selectedCount} besoin(s) ${actionType}(s) avec succès !`
      );

      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setRowSelection({}); // Réinitialiser la sélection
    },
    onError: (error) => {
      console.error("Erreur lors de la validation groupée:", error);
      toast.error("Une erreur est survenue lors de la validation groupée.");
    },
  });

  // Fonction pour gérer les actions de groupe
  const handleGroupAction = async () => {
    if (isProcessingGroupAction) return;

    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un besoin");
      return;
    }

    // Vérifier que l'utilisateur peut valider tous les besoins sélectionnés
    const cannotValidateItems = selectedRows.filter(row => {
      const item = row.original;
      const validationInfo = getValidationInfo(item);
      const userHasValidated = hasUserAlreadyValidated(item);

      return !validationInfo.canValidate ||
        item.state !== "pending" ||
        userHasValidated;
    });

    if (cannotValidateItems.length > 0) {
      toast.error(`Vous ne pouvez pas valider ${cannotValidateItems.length} besoin(s) sélectionné(s)`);
      return;
    }

    setIsProcessingGroupAction(true);

    try {
      const validatorss = user?.id ? { userId: user.id, rank: 1 } : undefined;
      const selectedIds = selectedRows.map(row => Number(row.original.id));

      const validator = categoriesData
        ?.find((cat) => cat.id === selectedRows[0].original.categoryId)
        ?.validators?.find((v) => v.userId === user?.id);


      // Vérifier si l'utilisateur est le dernier validateur pour TOUS les besoins sélectionnés
      const isLastValidatorForAll = selectedRows.every(row => {
        const item = row.original;
        const validationInfo = getValidationInfo(item);
        return validationInfo.isLastValidator;
      });

      await reviewGroupRequests.mutateAsync({
        isLastValidator: isLastValidatorForAll,
        ids: selectedIds,
        validatorId: validator?.id,
        validated: groupActionType === "approve",
        decision: groupActionType === "reject" ? rejectionReason : undefined,
      });

      setIsGroupActionDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Erreur lors de l'action de groupe:", error);
    } finally {
      setIsProcessingGroupAction(false);
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

  // Fonction pour ouvrir le dialogue d'action de groupe
  const openGroupActionDialog = (type: "approve" | "reject") => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un besoin");
      return;
    }

    setGroupActionType(type);
    setIsGroupActionDialogOpen(true);
  };

  // Fonction pour obtenir l'info de validation pour un besoin
  const getValidationInfo = (request: RequestModelT) => {
    const userPosition = getUserPositionForRequest(request);
    const isLastValidator = isUserLastValidatorForRequest(request);
    const categoryName = getCategoryName(String(request.categoryId));

    // Trouver la catégorie pour obtenir le nombre total de validateurs
    const category = categoriesData?.find(
      (cat) => cat.id === request.categoryId
    );
    const totalValidators = category?.validators?.length || 0;
    const validatedCount = request.revieweeList?.length || 0;

    return {
      userPosition,
      isLastValidator,
      categoryName,
      totalValidators,
      validatedCount,
      progress:
        totalValidators > 0 ? (validatedCount / totalValidators) * 100 : 0,
      canValidate:
        // !hasUserAlreadyValidated(request) &&
        request.state === "pending"
        && userPosition !== null,
    };
  };

  // Fonction pour sélectionner toutes les lignes de la page actuelle
  const selectAllOnPage = () => {
    table.toggleAllPageRowsSelected(true);
  };

  // Fonction pour désélectionner toutes les lignes
  const deselectAll = () => {
    table.toggleAllPageRowsSelected(false);
  };

  // Fonction pour sélectionner uniquement les éléments validables
  const selectOnlyValidatable = () => {
    const validatableRows = table.getRowModel().rows.filter(row => {
      const item = row.original;
      const validationInfo = getValidationInfo(item);
      const userHasValidated = hasUserAlreadyValidated(item);

      return validationInfo.canValidate &&
        item.state === "pending" &&
        !userHasValidated;
    });

    // Désélectionner tout d'abord
    deselectAll();

    // Sélectionner uniquement les lignes validables
    validatableRows.forEach(row => row.toggleSelected(true));
  };

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

  // Define columns avec colonne conditionnelle
  const columns: ColumnDef<RequestModelT>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<RequestModelT>[] = [];

    // Ajouter la colonne checkbox seulement si isCheckable est true
    if (isCheckable) {
      baseColumns.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Sélectionner toutes les lignes"
            />
          </div>
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner cette ligne"
            disabled={
              !getValidationInfo(row.original).canValidate ||
              row.original.state !== "pending" ||
              hasUserAlreadyValidated(row.original)
            }
          />
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Ajouter les autres colonnes
    baseColumns.push(
      {
        accessorKey: "label",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Titres
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate font-medium uppercase">
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
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Projets
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm first-letter:uppercase lowercase">
            {getProjectName(row.getValue("projectId"))}
          </div>
        ),
      },
      {
        accessorKey: "categoryId",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Catégories
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => {
          const categoryName = getCategoryName(row.getValue("categoryId"));
          const validationInfo = getValidationInfo(row.original);

          return (
            <div>
              <div className="font-medium text-sm first-letter:uppercase lowercase">{categoryName}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "userId",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Émetteurs
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm first-letter:uppercase lowercase">{getUserName(row.getValue("userId"))}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Date d'émission
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm">
            {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
              locale: fr,
            })}
          </div>
        ),
      },
      {
        accessorKey: "beneficiary",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Bénéficiaires
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm max-w-[200px] truncate first-letter:uppercase lowercase">
            {getBeneficiaryDisplay(row.original)}
          </div>
        ),
      }
    );

    // Ajouter la colonne Validation de validation (uniquement pour type pending)
    if (type === "pending") {
      baseColumns.push({
        id: "validationProgress",
        header: () => <span className="tablehead">Validation</span>,
        cell: ({ row }: { row: Row<RequestModelT> }) => {
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
                  {validationInfo.validatedCount}/
                  {validationInfo.totalValidators}
                </div>
              </div>
            </div>
          );
        },
      });
    }

    // Ajouter la colonne Statut seulement si type === "proceed"
    if (type === "proceed") {
      // Insérer la colonne statut après les catégories
      baseColumns.splice(3, 0, {
        accessorKey: "state",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Statuts
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
      header: () => <span className="tablehead">Actions</span>,
      cell: ({ row }) => {
        const item = row.original;
        const validationInfo = getValidationInfo(item);
        const userHasValidated = hasUserAlreadyValidated(item);
        const paiement = paymentsData?.find(
          (x) => x.requestId === item?.id
        );
        const isAttach = (item.type === "FAC" || item.type === "RH") && paiement?.proof !== null;

        console.log(paiement);


        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {"Actions"}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
                    validationInfo.canValidate === false ||
                    item.state !== "pending"
                  }
                >
                  <CheckCheck className="text-green-500 mr-2 h-4 w-4" />
                  {"Approuver"}
                  {validationInfo.isLastValidator}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openValidationModal("reject", item)}
                  disabled={
                    !validationInfo.canValidate ||
                    item.state !== "pending" ||
                    userHasValidated
                  }
                  className={
                    !validationInfo.canValidate
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                >
                  <LucideBan className="text-red-500 mr-2 h-4 w-4" />
                  {"Rejeter"}
                  {validationInfo.isLastValidator}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAttach ? <Paperclip /> : ""}
          </div>
        );
      },
    });

    return baseColumns;
  }, [type, user?.id, categoriesData, isCheckable]);

  // Table configuration
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Nombre d'éléments sélectionnés
  const selectedCount = Object.keys(rowSelection).length;
  const canValidateSelected = selectedCount > 0 && isCheckable;

  // Vérifier si des filtres sont actifs
  const hasActiveFilters =
    globalFilter ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    projectFilter !== "all" ||
    userFilter !== "all";

  return (
    <div className="w-full">

      <div className="flex flex-wrap items-center gap-3 py-4">
        {/* Global search */}
        <Input
          placeholder="Rechercher par titre, catégorie, projet..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        {/* Status filter - seulement pour proceed */}
        {type === "proceed" && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
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
          value={categoryFilter}
          onChange={setCategoryFilter}
          placeholder="Catégorie"
          allLabel="Toutes"
          options={uniqueCategories.map((c) => ({
            value: String(c.id),
            label: c.name,
          }))}
        />

        {/* Project filter */}
        <SearchableSelect
          value={projectFilter}
          onChange={setProjectFilter}
          placeholder="Projet"
          allLabel="Tous"
          options={uniqueProjects.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
        />

        {/* Users filter */}
        <SearchableSelect
          value={userFilter}
          onChange={setUserFilter}
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
                <span>Toutes les périodes</span>
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
                <span>Aujourd'hui</span>
                {dateFilter === "today" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("week")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "week" && "bg-accent"
                )}
              >
                <span>Cette semaine</span>
                {dateFilter === "week" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("month")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "month" && "bg-accent"
                )}
              >
                <span>Ce mois</span>
                {dateFilter === "month" && <ChevronRight className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("year")}
                className={cn(
                  "flex items-center justify-between",
                  dateFilter === "year" && "bg-accent"
                )}
              >
                <span>Cette année</span>
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
                  Personnaliser
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
              Colonnes
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
                    {column.id === "select"
                      ? "Sélection"
                      : column.id === "label"
                        ? "Titres"
                        : column.id === "projectId"
                          ? "Projets"
                          : column.id === "categoryId"
                            ? "Catégories"
                            : column.id === "userId"
                              ? "Émetteurs"
                              : column.id === "beneficiary"
                                ? "Bénéficiaires"
                                : column.id === "createdAt"
                                  ? "Date d'émission"
                                  : column.id === "state"
                                    ? "Statuts"
                                    : column.id === "validationProgress"
                                      ? "Validation"
                                      : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isCheckable && selectedCount > 1 && <div className="flex items-center gap-2 pb-4">
        <Button
          variant="default"
          size="sm"
          onClick={() => openGroupActionDialog("approve")}
          className="h-8 bg-green-600 hover:bg-green-700"
          disabled={!canValidateSelected}
        >
          <CheckCheck className="h-4 w-4 mr-2" />
          Approuver ({selectedCount})
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => openGroupActionDialog("reject")}
          className="h-8 bg-red-600 hover:bg-red-700"
          disabled={!canValidateSelected}
        >
          <LucideBan className="h-4 w-4 mr-2" />
          Rejeter ({selectedCount})
        </Button>
      </div>}
      {/* Table */}
      {filteredData.length > 0 ? (
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
                const isSelected = row.getIsSelected();

                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected && "selected"}
                    className={cn(
                      "hover:bg-gray-50",
                      statusConfig.rowClassName,
                      validationInfo.userPosition && "border-l-4",
                      validationInfo.userPosition === 1 && "border-l-blue-400",
                      validationInfo.userPosition === 2 && "border-l-green-400",
                      validationInfo.userPosition === 3 && "border-l-red-400",
                      validationInfo.isLastValidator && "border-l-red-400",
                      isSelected && isCheckable && "bg-blue-50 hover:bg-blue-100"
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
      {filteredData.length > 0 && <Pagination table={table} pageSize={15} />}

      {/* Modal pour la plage de dates personnalisée */}
      <Dialog
        open={isCustomDateModalOpen}
        onOpenChange={setIsCustomDateModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sélectionner une plage de dates</DialogTitle>
            <DialogDescription>
              Choisissez la période que vous souhaitez filtrer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">Date de début</Label>
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
                        <span>Sélectionner une date</span>
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
                <Label htmlFor="date-to">Date de fin</Label>
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
                        <span>Sélectionner une date</span>
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
              Annuler
            </Button>
            <Button onClick={applyCustomDateRange}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les actions de groupe - seulement si isCheckable est true */}
      {isCheckable && (
        <Dialog open={isGroupActionDialogOpen} onOpenChange={setIsGroupActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {groupActionType === "approve" ? (
                  <CheckCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <LucideBan className="h-5 w-5 text-red-600" />
                )}
                {groupActionType === "approve" ? "Approuver plusieurs besoins" : "Rejeter plusieurs besoins"}
              </DialogTitle>
              <DialogDescription>
                {groupActionType === "approve"
                  ? `Êtes-vous sûr de vouloir approuver ${selectedCount} besoin(s) ?`
                  : `Êtes-vous sûr de vouloir rejeter ${selectedCount} besoin(s) ?`}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-blue-100 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedCount} {"besoin(s) sélectionné(s)"}
                </span>
              </div>
            </div>
            {groupActionType === "reject" && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  {"Motif du rejet"} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Expliquez la raison du rejet pour tous les besoins sélectionnés..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  {"Ce motif sera appliqué à tous les besoins sélectionnés."}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setRejectionReason("");
                  setIsGroupActionDialogOpen(false);
                }}
                disabled={isProcessingGroupAction}
              >
                {"Annuler"}
              </Button>
              <Button
                onClick={handleGroupAction}
                disabled={isProcessingGroupAction || (groupActionType === "reject" && !rejectionReason.trim())}
                className={groupActionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                }
              >
                {isProcessingGroupAction ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    {"Traitement..."}
                  </>
                ) : groupActionType === "approve" ? (
                  "Approuver"
                ) : (
                  "Rejeter"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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