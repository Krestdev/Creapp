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
  CheckCheck,
  CheckCircle,
  ChevronDown,
  Circle,
  Eye,
  Hourglass,
  LoaderIcon,
  LucideBan,
  LucideIcon,
  Paperclip,
  Settings2
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
import { cn, getUserName } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import {
  Category,
  DateFilter,
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
import BesoinFacLastVal from "../modals/BesoinFacLastVal";
import { BesoinLastVal } from "../modals/BesoinLastVal";
import BesoinRHLastVal from "../modals/BesoinRHLastVal";
import { ValidationModal } from "../modals/ValidationModal";
import { Badge, badgeVariants } from "../ui/badge";
import { Calendar } from "../ui/calendar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import Empty from "./empty";
import { Pagination } from "./pagination";
import { TabBar } from "./TabBar";

interface DataTableProps {
  data: RequestModelT[];
  empty: string;
  type?: "pending" | "proceed";
  customProps?: {
    userPosition?: number | null;
    categoryName?: string;
    totalValidators?: number;
    validatedCount?: number;
  };
  isCheckable?: boolean;
  categoriesData: Category[];
  projectsData: ProjectT[];
  usersData: User[];
  paymentsData: PaymentRequest[];
  requestTypeData: RequestType[];
  pending: number;
  cleared: number;
}

export function DataVal({
  data,
  empty,
  type = "pending",
  isCheckable = false,
  categoriesData,
  projectsData,
  usersData,
  paymentsData,
  requestTypeData,
  pending,
  cleared
}: DataTableProps) {
  const { user } = useStore();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      createdAt: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  // États pour les filtres
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [projectFilter, setProjectFilter] = React.useState<string>("all");
  const [userFilter, setUserFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<DateFilter>();
  const [customDateRange, setCustomDateRange] = React.useState<
    { from: Date; to: Date } | undefined
  >();
  const [customOpen, setCustomOpen] = React.useState<boolean>(false); //Custom Period Filter
  const [selectedTab, setSelectedTab] = React.useState<number>(0);
  const tabs = [
    {
      id: 0,
      title: "En attente",
      badge: pending,
    },
    {
      id: 1,
      title: "Traités"
    },
  ];

  // Modal states
  const [selectedItem, setSelectedItem] = React.useState<RequestModelT | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] =
    React.useState(false);
  const [isLastValModalOpen, setIsLastValModalOpen] = React.useState(false);
  const [isUpdateFacModalOpen, setIsUpdateFacModalOpen] = React.useState(false);
  const [isUpdateRHModalOpen, setIsUpdateRHModalOpen] = React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");

  // États pour les actions de groupe
  const [isGroupActionDialogOpen, setIsGroupActionDialogOpen] =
    React.useState(false);
  const [groupActionType, setGroupActionType] = React.useState<
    "approve" | "reject"
  >("approve");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isProcessingGroupAction, setIsProcessingGroupAction] =
    React.useState(false);

  // Fonction pour vérifier si l'utilisateur est le dernier validateur pour un besoin
  const isUserLastValidatorForRequest = (request: RequestModelT):boolean => {
    const rank = request.validators.find(v=> v.userId === user?.id)?.rank;
    return !!rank && !request.validators.some(x=> x.rank > rank);
  };

  // Fonction pour vérifier si l'utilisateur a déjà validé un besoin
  const hasUserAlreadyValidated = (request: RequestModelT):boolean => {
    const validator = request.validators.find(v=> v.userId === user?.id);
    return !!validator && validator.validated === true ;
  };

  const getProjectName = (projectId: string) => {
    const project = projectsData?.find((proj) => proj.id === Number(projectId));
    return project?.label || projectId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categoriesData?.find(
      (cat) => cat.id === Number(categoryId),
    );
    return category?.label || categoryId;
  };

  // Major Filter *******************************************
  const filteredData = React.useMemo(() => {
    return data.filter((b) => {
      const now = new Date();
      let startDate = new Date();
      let endDate = now;
      //Selected Tab
      const matchTab =
        selectedTab === 0
          ? b.state === "pending" && b.validators.find(v=> v.userId === user?.id)?.validated === false
          : selectedTab === 1 && b.validators.find(v=> v.userId === user?.id)?.validated === true;
      //Status Filter
      const matchStatus =
        statusFilter === "all" ? true : b.state === statusFilter;
      //Project Filter
      const matchProject =
        projectFilter === "all" ? true : b.projectId === Number(projectFilter);
      //User Filter
      const matchUser =
        userFilter === "all" ? true : b.userId === Number(userFilter);
      //Category Filter
      const matchCategory =
        categoryFilter === "all"
          ? true
          : b.categoryId === Number(categoryFilter);
      //Date filter
      let matchDate = true;
      if (dateFilter) {
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(
              now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
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
            new Date(b.createdAt) >= startDate &&
            new Date(b.createdAt) <= endDate;
        }
      }
      return (
        matchDate &&
        matchProject &&
        matchUser &&
        matchStatus &&
        matchTab &&
        matchCategory
      );
    });
  }, [
    data,
    globalFilter,
    statusFilter,
    categoryFilter,
    projectFilter,
    userFilter,
    selectedTab,
    categoryFilter,
    dateFilter,
    customDateRange,
  ]);

  const resetAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setProjectFilter("all");
    setUserFilter("all");
    setDateFilter(undefined);
    setCustomDateRange(undefined);
  };

  const categoryIds = [...new Set(data.map((req) => req.categoryId))];


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


  const reviewRequest = useMutation({
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
      await requestQ.review(id, {
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
          : "Besoin rejeté avec succès !",
      );
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
    mutationFn: async ({
      ids,
      validated,
      decision,
      validatorId,
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
        return requestQ.validateBulk({
          ids,
          validatorId: validatorId ?? -1,
        });
      } else {
        // Utiliser reviewBulk pour les validateurs ascendants
        return requestQ.reviewBulk({
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
        `${selectedCount} besoin(s) ${actionType}(s) avec succès !`,
      );
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
    const cannotValidateItems = selectedRows.filter((row) => {
      const item = row.original;
      const validationInfo = getValidationInfo(item);
      const userHasValidated = hasUserAlreadyValidated(item);

      return (
        !validationInfo.canValidate ||
        item.state !== "pending" ||
        userHasValidated
      );
    });

    if (cannotValidateItems.length > 0) {
      toast.error(
        `Vous ne pouvez pas valider ${cannotValidateItems.length} besoin(s) sélectionné(s)`,
      );
      return;
    }

    setIsProcessingGroupAction(true);

    try {
      const selectedIds = selectedRows.map((row) => Number(row.original.id));

      const validator = categoriesData
        ?.find((cat) => cat.id === selectedRows[0].original.categoryId)
        ?.validators?.find((v) => v.userId === user?.id);

      // Vérifier si l'utilisateur est le dernier validateur pour TOUS les besoins sélectionnés
      const isLastValidatorForAll = selectedRows.every((row) => {
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
    item: RequestModelT,
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
    const userPosition = request.validators.find(v=> v.userId === user?.id)?.rank;
    const isLastValidator = isUserLastValidatorForRequest(request);
    const categoryName = getCategoryName(String(request.categoryId));

    const totalValidators = request.validators.length;
    const validatedCount = request.validators.filter(v=>v.validated === true).length;

    return {
      userPosition,
      isLastValidator,
      categoryName,
      totalValidators,
      validatedCount,
      progress:
        totalValidators > 0 ? (validatedCount / totalValidators) * 100 : 0,
      canValidate: request.state === "pending" && request.validators.find(v=> v.rank === userPosition)?.validated === false,
    };
  };

  // Fonction pour désélectionner toutes les lignes
  const deselectAll = () => {
    table.toggleAllPageRowsSelected(false);
  };

  // Fonction pour sélectionner uniquement les éléments validables
  const selectOnlyValidatable = () => {
    const validatableRows = table.getRowModel().rows.filter((row) => {
      const item = row.original;
      const validationInfo = getValidationInfo(item);
      const userHasValidated = hasUserAlreadyValidated(item);

      return (
        validationInfo.canValidate &&
        item.state === "pending" &&
        !userHasValidated
      );
    });

    // Désélectionner tout d'abord
    deselectAll();

    // Sélectionner uniquement les lignes validables
    validatableRows.forEach((row) => row.toggleSelected(true));
  };

  function getTypeBadge(
    type:
      | "speciaux"
      | "ressource_humaine"
      | "facilitation"
      | "achat"
      | undefined,
  ): { label: string; variant: VariantProps<typeof badgeVariants>["variant"] } {
    const typeData = requestTypeData?.find((t) => t.type === type);
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

  // Define columns avec colonne conditionnelle
  const columns: ColumnDef<RequestModelT>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<RequestModelT>[] = [];

    // Ajouter la colonne checkbox seulement si isCheckable est true
    // if (isCheckable) {
    //   baseColumns.push({
    //     id: "select",
    //     header: ({ table }) => (
    //       <div className="flex items-center">
    //         <Checkbox
    //           checked={
    //             table.getIsAllPageRowsSelected() ||
    //             (table.getIsSomePageRowsSelected() && "indeterminate")
    //           }
    //           onCheckedChange={(value) =>
    //             table.toggleAllPageRowsSelected(!!value)
    //           }
    //           aria-label="Sélectionner toutes les lignes"
    //         />
    //       </div>
    //     ),
    //     cell: ({ row }) => (
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => row.toggleSelected(!!value)}
    //         aria-label="Sélectionner cette ligne"
    //         disabled={
    //           !getValidationInfo(row.original).canValidate ||
    //           row.original.state !== "pending" ||
    //           hasUserAlreadyValidated(row.original)
    //         }
    //       />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //   });
    // }

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
              {"Titres"}
              <ArrowUpDown />
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
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
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
              {"Projets"}
              <ArrowUpDown />
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
              {"Catégories"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const categoryName = getCategoryName(row.getValue("categoryId"));
          const validationInfo = getValidationInfo(row.original);

          return (
            <div>
              <div className="font-medium text-sm first-letter:uppercase lowercase">
                {categoryName}
              </div>
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
              {"Émetteurs"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => (
          <div className="text-sm first-letter:uppercase lowercase">
            {getUserName(usersData,row.getValue("userId"))}
          </div>
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
              {"Date d'émission"}
              <ArrowUpDown />
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
              {"Bénéficiaires"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const list = row.original.beficiaryList;
          const beneficiary = row.original.beneficiary;
          return(
          <div className="text-sm max-w-[200px] truncate first-letter:uppercase lowercase">
            {beneficiary.toLocaleLowerCase() === "me" ? getUserName(usersData, user?.id) : !!list && list.length > 0 ? list.map(u=>u.firstName.concat(" ", u.lastName)).join(", ").substring(0,15) : "Aucun bénéficiaire"}
          </div>
        )},
      },
    );

    // Ajouter la colonne Validation de validation (uniquement pour type pending)
    if (type === "pending") {
      baseColumns.push({
        id: "validationProgress",
        header: () => <span className="tablehead">{"Validation"}</span>,
        cell: ({ row }: { row: Row<RequestModelT> }) => {
          const validationInfo = getValidationInfo(row.original);

          if (!validationInfo.totalValidators) return null;

          return (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.original.state === "rejected" ? "bg-red-500" : "bg-blue-500"} rounded-full transition-all duration-300`}
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
              {"Statuts"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const state = getStatusConfig(row.getValue("state"));
          const Icon = state.icon;

          return (
            <Badge variant={state.variant} className="text-xs">
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

        const validationInfo = getValidationInfo(item);
        const userHasValidated = hasUserAlreadyValidated(item);
        const paiement = paymentsData?.find((x) => x.requestId === item?.id);
        const isAttach =
          (item.type === "facilitation" || item.type === "ressource_humaine") &&
          paiement?.proof !== null;
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
                  <Eye />
                  {"Voir les détails"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    validationInfo.isLastValidator
                      ? item.type === "facilitation"
                        ? (setSelectedItem(item), setIsUpdateFacModalOpen(true))
                        : item.type === "ressource_humaine"
                          ? (setSelectedItem(item), setIsUpdateRHModalOpen(true))
                          : (setSelectedItem(item), setIsLastValModalOpen(true))
                      : openValidationModal("approve", item)
                  }
                  disabled={
                    validationInfo.canValidate === false ||
                    item.state !== "pending"
                  }
                >
                  <CheckCheck className="text-green-500" />
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
                  <LucideBan className="text-destructive" />
                  {"Rejeter"}
                  {validationInfo.isLastValidator}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAttach ? <Paperclip size={16} /> : ""}
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

  return (
    <div className="content">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <TabBar
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <div className="flex flex-wrap items-center gap-2">
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
                  <Label htmlFor="searchCommand">{"Recherche globale"}</Label>
                  <Input
                    name="search"
                    type="search"
                    id="searchCommand"
                    placeholder="Référence, libellé"
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Filtre par statut */}
                <div className="grid gap-1.5">
                  <Label>{"Statut"}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {uniqueStatus.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtre par Catégorie */}
                <div className="grid gap-1.5">
                  <Label>{"Catégorie"}</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {categoriesData
                        .filter((c) => categoryIds.includes(c.id))
                        .map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtre par Projet */}
                <div className="grid gap-1.5">
                  <Label>{"Projet"}</Label>
                  <Select
                    value={projectFilter}
                    onValueChange={setProjectFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {projectsData.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Filtre par Emetteur */}
                <div className="grid gap-1.5">
                  <Label>{"Emetteur"}</Label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{"Tous"}</SelectItem>
                      {usersData.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.firstName.concat(" ", u.lastName)}
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
                        setCustomOpen(false);
                      }
                      if (v === "all") return setDateFilter(undefined);
                      setDateFilter(v as Exclude<DateFilter, undefined>);
                      setCustomOpen(v === "custom");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {"Toutes les périodes"}
                      </SelectItem>
                      <SelectItem value="today">{"Aujourd'hui"}</SelectItem>
                      <SelectItem value="week">{"Cette semaine"}</SelectItem>
                      <SelectItem value="month">{"Ce mois"}</SelectItem>
                      <SelectItem value="year">{"Cette année"}</SelectItem>
                      <SelectItem value="custom">{"Personnalisé"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Collapsible
                    open={customOpen}
                    onOpenChange={setCustomOpen}
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
                            setCustomOpen(false);
                          }}
                        >
                          {"Annuler"}
                        </Button>
                        <Button
                          className="w-full"
                          variant={"outline"}
                          onClick={() => {
                            setCustomOpen(false);
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
          {/* Column visibility */}
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
      </div>
      {isCheckable && selectedCount > 1 && (
        <div className="flex items-center gap-2 pb-4">
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
        </div>
      )}
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
                      isSelected &&
                      isCheckable &&
                      "bg-blue-50 hover:bg-blue-100",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="border-r last:border-r-0 py-3"
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
        <Empty message={empty} />
      )}

      {/* Pagination */}
      {filteredData.length > 0 && <Pagination table={table} pageSize={15} />}

      {/* Dialog pour les actions de groupe - seulement si isCheckable est true */}
      {isCheckable && (
        <Dialog
          open={isGroupActionDialogOpen}
          onOpenChange={setIsGroupActionDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {groupActionType === "approve" ? (
                  <CheckCheck className="h-5 w-5 text-green-600" />
                ) : (
                  <LucideBan className="h-5 w-5 text-red-600" />
                )}
                {groupActionType === "approve"
                  ? "Approuver plusieurs besoins"
                  : "Rejeter plusieurs besoins"}
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
                <Label
                  htmlFor="rejectionReason"
                  className="text-sm font-medium"
                >
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
                disabled={
                  isProcessingGroupAction ||
                  (groupActionType === "reject" && !rejectionReason.trim())
                }
                className={
                  groupActionType === "approve"
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
      <BesoinFacLastVal
        open={isUpdateFacModalOpen}
        setOpen={setIsUpdateFacModalOpen}
        requestData={selectedItem}
      />
      <BesoinRHLastVal
        open={isUpdateRHModalOpen}
        setOpen={setIsUpdateRHModalOpen}
        requestData={selectedItem}
      />
    </div>
  );
}
