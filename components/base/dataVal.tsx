"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationOptions,
  PaginationState,
  Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCheck,
  Circle,
  Ellipsis,
  Eye,
  LoaderIcon,
  LucideBan,
  LucideCreditCard,
  Settings2,
} from "lucide-react";
import * as React from "react";

import TransportApprobation from "@/app/tableau-de-bord/besoins/transport-approbation";
import ApprovalFilters, {
  ApprovalFiltersProps,
} from "@/app/tableau-de-bord/besoins/validation/filters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  cn,
  getRequestStatusBadge,
  getRequestTypeBadge,
  getUserName,
  subText,
  XAF,
} from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { requestQ } from "@/queries/requestModule";
import {
  BonsCommande,
  Category,
  ProjectT,
  Reception,
  RequestModelT,
  RequestType,
  User,
} from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { DetailBesoin } from "../besoin/detail-besoin";
import BesoinLastApproVall from "../modals/BesoinApproValid";
import BesoinFacLastVal from "../modals/BesoinFacLastVal";
import { BesoinLastVal } from "../modals/BesoinLastVal";
import BesoinLastValOther from "../modals/BesoinLastValOther";
import BesoinLastValSettle from "../modals/BesoinLastValSettle";
import BesoinRHLastVal from "../modals/BesoinRHLastVal";
import UpdatePaymentMethod from "../modals/UpdatePaymentMethod";
import { ValidationModal } from "../modals/ValidationModal";
import { Badge } from "../ui/badge";
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
import { TabBar, TabProps } from "./TabBar";

interface DataTableProps {
  data: RequestModelT[];
  empty: string;
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
  requestTypeData: RequestType[];
  receptions: Array<Reception>;
  purchaseOrders: Array<BonsCommande>;
  tab: ApprovalFiltersProps["customFilters"]["tab"];
  pagination: PaginationState;
  paginationOptions: Pick<PaginationOptions, "onPaginationChange" | "rowCount">;
  filters: ApprovalFiltersProps;
  tabs: TabProps;
}

export function DataVal({
  data,
  empty,
  isCheckable = false,
  categoriesData,
  projectsData,
  usersData,
  requestTypeData,
  receptions,
  purchaseOrders,
  tab,
  pagination,
  paginationOptions,
  filters,
  tabs,
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
  // const [globalFilter, setGlobalFilter] = React.useState("");

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
  const [isUpdateApproModalOpen, setIsUpdateApproModalOpen] =
    React.useState(false);
  const [isUpdateOtherRequest, setIsUpdateOtherRequest] = React.useState(false);
  // Ajoutez ce state avec les autres states de modals
  const [isUpdatePaymentModalOpen, setIsUpdatePaymentModalOpen] =
    React.useState(false);
  const [validationType, setValidationType] = React.useState<
    "approve" | "reject"
  >("approve");
  const [isUpdateSettleRequest, setIsUpdateSettleRequest] =
    React.useState(false);
  const [isUpdateTransport, setIsUpdateTransport] = React.useState(false);

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
  const isUserLastValidatorForRequest = (request: RequestModelT): boolean => {
    const rank = request.validators.find((v) => v.userId === user?.id)?.rank;
    return !!rank && !request.validators.some((x) => x.rank > rank);
  };

  // Fonction pour vérifier si l'utilisateur a déjà validé un besoin
  const hasUserAlreadyValidated = (request: RequestModelT): boolean => {
    const validator = request.validators.find((v) => v.userId === user?.id);
    return !!validator && validator.validated === true;
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

  // const categoryIds = [...new Set(data.map((req) => req.categoryId))];

  // const uniqueStatus = React.useMemo(() => {
  //   if (!data.length) return [];
  //   return [...new Set(data.map((req) => req.state))].map((state) => {
  //     const status = getRequestStatusBadge(state);
  //     return {
  //       id: state,
  //       name: status.label,
  //       icon: status.icon,
  //       variant: status.variant,
  //       rowClassName: status.className,
  //     };
  //   });
  // }, [data]);

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
    }) =>
      requestQ.review(id, {
        validated: validated,
        decision: decision,
        userId: validatorId ?? -1,
        validator: validator,
      }),
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
      isLastValidator,
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
      isLastValidator?: boolean;
    }) => {
      if (isLastValidator) {
        return requestQ.validateBulk({
          ids,
          validatorId: validatorId ?? -1,
        });
      } else {
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
      setRowSelection({});
    },
    onError: (error) => {
      console.error("Erreur lors de la validation groupée:", error);
      toast.error("Une erreur est survenue lors de la validation groupée.");
    },
  });

  const handleGroupAction = async () => {
    if (isProcessingGroupAction) return;

    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un besoin");
      return;
    }

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

  const openGroupActionDialog = (type: "approve" | "reject") => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Veuillez sélectionner au moins un besoin");
      return;
    }

    setGroupActionType(type);
    setIsGroupActionDialogOpen(true);
  };

  const getValidationInfo = (request: RequestModelT) => {
    const userPosition = request.validators.find(
      (v) => v.userId === user?.id,
    )?.rank;
    const isLastValidator = isUserLastValidatorForRequest(request);
    const categoryName = getCategoryName(String(request.categoryId));

    const totalValidators = request.validators.length;
    const validatedCount = request.validators.filter(
      (v) => v.validated === true,
    ).length;

    return {
      userPosition,
      isLastValidator,
      categoryName,
      totalValidators,
      validatedCount,
      progress:
        totalValidators > 0 ? (validatedCount / totalValidators) * 100 : 0,
      canValidate:
        request.state === "pending" &&
        request.validators.find((v) => v.rank === userPosition)?.validated ===
          false,
    };
  };

  // const deselectAll = () => {
  //   table.toggleAllPageRowsSelected(false);
  // };

  // const selectOnlyValidatable = () => {
  //   const validatableRows = table.getRowModel().rows.filter((row) => {
  //     const item = row.original;
  //     const validationInfo = getValidationInfo(item);
  //     const userHasValidated = hasUserAlreadyValidated(item);

  //     return (
  //       validationInfo.canValidate &&
  //       item.state === "pending" &&
  //       !userHasValidated
  //     );
  //   });

  //   deselectAll();

  //   validatableRows.forEach((row) => row.toggleSelected(true));
  // };

  // Define columns
  const columns: ColumnDef<RequestModelT>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<RequestModelT>[] = [];

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
          <p className="max-w-[200px] truncate">{row.getValue("label")}</p>
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
          const type = getRequestTypeBadge({
            type: value.type,
            requestTypes: requestTypeData,
          });
          return <Badge variant={type.variant}>{type.label}</Badge>;
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <span
              className="tablehead cursor-pointer flex items-center"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {"Montant"}
              <ArrowUpDown />
            </span>
          );
        },
        cell: ({ row }) => {
          const value = row.original;
          const amount =
            value.type !== "facilitation"
              ? !!value.amount
                ? XAF.format(value.amount)
                : "Aucun"
              : XAF.format(
                  value.benFac?.list?.reduce(
                    (acc, item) => acc + item.amount,
                    0,
                  ) || 0,
                );
          return (
            <p
              className={cn(
                "normal-case",
                amount === "N/A" ? "text-muted-foreground" : "font-medium",
              )}
            >
              {amount}
            </p>
          );
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
        cell: ({ row }) => {
          const projectId = row.getValue("projectId");
          const projectName = projectId
            ? getProjectName(projectId as string)
            : "N/A";
          return (
            <p
              className={cn(
                "normal-case",
                projectName === "N/A"
                  ? "text-muted-foreground"
                  : "first-letter:uppercase lowercase",
              )}
            >
              {subText({ text: projectName, length: 21 })}
            </p>
          );
        },
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
          // const validationInfo = getValidationInfo(row.original);

          return categoryName;
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
          <p className="normal-case">
            {getUserName(usersData, row.getValue("userId"))}
          </p>
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
          <p className="normal-case">
            {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
              locale: fr,
            })}
          </p>
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
          const item = row.original;
          const list = row.original.beficiaryList;
          const beneficiary = row.original.beneficiary;
          return (
            <p className="max-w-[200px] truncate normal-case">
              {beneficiary.toLocaleLowerCase() === "me"
                ? getUserName(usersData, item.userId)
                : beneficiary.length > 0
                  ? getUserName(usersData, Number(beneficiary))
                  : item.type?.toLocaleLowerCase().includes("facili")
                    ? item.benFac?.list
                        .map((li) => li.name)
                        .join(", ")
                        .substring(0, 21)
                    : !!list && list.length > 0
                      ? list
                          .map((u) => u.firstName.concat(" ", u.lastName))
                          .join(", ")
                          .substring(0, 21)
                      : "Aucun bénéficiaire"}
            </p>
          );
        },
      },
    );

    if (tab === "pending") {
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

    if (tab === "processed") {
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
          const state = getRequestStatusBadge(row.getValue("state"));
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

    baseColumns.push({
      accessorKey: "actions",
      enableHiding: false,
      header: () => <span className="tablehead">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;

        const validationInfo = getValidationInfo(item);
        const userHasValidated = hasUserAlreadyValidated(item);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-fit border-0 cursor-pointer [&_svg]:text-gray-900 rounded-none shadow-none">
              <Ellipsis />
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
                        : item.type === "appro"
                          ? (setSelectedItem(item),
                            setIsUpdateApproModalOpen(true))
                          : item.type === "others"
                            ? (setSelectedItem(item),
                              setIsUpdateOtherRequest(true))
                            : item.type === "transport"
                              ? (setSelectedItem(item),
                                setIsUpdateTransport(true))
                              : item.type === "settle"
                                ? (setSelectedItem(item),
                                  setIsUpdateSettleRequest(true))
                                : (setSelectedItem(item),
                                  setIsLastValModalOpen(true))
                    : openValidationModal("approve", item)
                }
                disabled={
                  validationInfo.canValidate === false ||
                  item.state !== "pending"
                }
              >
                <CheckCheck className="text-green-500" />
                {"Approuver"}
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
              </DropdownMenuItem>
              {(item.type === "facilitation" || item.type === "others") &&
                item.state === "validated" && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedItem(item);
                      setIsUpdatePaymentModalOpen(true);
                    }}
                    // disabled={
                    //   !validationInfo.canValidate ||
                    //   item.state !== "pending" ||
                    //   userHasValidated
                    // }
                  >
                    <LucideCreditCard className="h-4 w-4 text-blue-500" />
                    {"Modifier le moyen de paiement"}
                  </DropdownMenuItem>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });

    return baseColumns;
  }, [tab, user?.id, categoriesData, isCheckable]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    ...paginationOptions,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      // globalFilter,
      pagination,
    },
  });

  const selectedCount = Object.keys(rowSelection).length;
  const canValidateSelected = selectedCount > 0 && isCheckable;

  return (
    <div className="content">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <TabBar
            tabs={tabs.tabs}
            setSelectedTab={tabs.setSelectedTab}
            selectedTab={tabs.selectedTab}
            className="w-fit"
          />
          <Sheet>
            <SheetTrigger asChild className="w-fit">
              <Button variant={"outline"}>
                <Settings2 />
                {"Filtres"}
              </Button>
            </SheetTrigger>
            <SheetContent className="px-3">
              <SheetHeader>
                <SheetTitle>{"Filtres"}</SheetTitle>
                <SheetDescription>
                  {"Configurer les filtres pour affiner les données"}
                </SheetDescription>
              </SheetHeader>
              <ApprovalFilters
                customFilters={filters.customFilters}
                setCustomFilters={filters.setCustomFilters}
                isCustomDateModalOpen={filters.isCustomDateModalOpen}
                setIsCustomDateModalOpen={filters.setIsCustomDateModalOpen}
                uniqueCategories={filters.uniqueCategories}
                uniqueProjects={filters.uniqueProjects}
                requestTypes={filters.requestTypes}
                setDateFilter={filters.setDateFilter}
                resetAllFilters={filters.resetAllFilters}
                users={filters.users}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
                                        : column.id === "amount"
                                          ? "Montant"
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
      {data.length > 0 ? (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="">
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
                const statusConfig = getRequestStatusBadge(row.original.state);
                const isSelected = row.getIsSelected();

                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected && "selected"}
                    className={cn(
                      "hover:bg-gray-50",
                      statusConfig.className,
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
                      <TableCell key={cell.id} className="">
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

      {data.length > 0 && <Pagination table={table} />}

      {/* Dialog pour les actions de groupe */}
      {isCheckable && (
        <Dialog
          open={isGroupActionDialogOpen}
          onOpenChange={setIsGroupActionDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
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
      {selectedItem && (
        <DetailBesoin
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={selectedItem}
          projects={projectsData}
          users={usersData}
          receptions={receptions}
          purchaseOrders={purchaseOrders}
        />
      )}

      <ValidationModal
        isMotifRequired={true}
        open={isValidationModalOpen}
        onOpenChange={setIsValidationModalOpen}
        type={validationType}
        title={
          validationType === "approve"
            ? `Approuver - ${selectedItem?.label}`
            : `Rejeter - ${selectedItem?.label}`
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

      {selectedItem && (
        <>
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
            users={usersData}
          />
          <BesoinRHLastVal
            open={isUpdateRHModalOpen}
            setOpen={setIsUpdateRHModalOpen}
            requestData={selectedItem}
            users={usersData}
          />
          <BesoinLastApproVall
            open={isUpdateApproModalOpen}
            setOpen={setIsUpdateApproModalOpen}
            requestData={selectedItem}
            users={usersData}
          />
          <UpdatePaymentMethod
            open={isUpdatePaymentModalOpen}
            setOpen={setIsUpdatePaymentModalOpen}
            requestData={selectedItem}
            categories={categoriesData}
            users={usersData}
            projects={projectsData}
            onSuccess={() => {
              // Rafraîchir les données si nécessaire
              // Vous pouvez ajouter un callback pour revalider les requêtes
            }}
          />
          <BesoinLastValOther
            request={selectedItem}
            users={usersData}
            open={isUpdateOtherRequest}
            setOpen={setIsUpdateOtherRequest}
          />
          <BesoinLastValSettle
            request={selectedItem}
            users={usersData}
            open={isUpdateSettleRequest}
            setOpen={setIsUpdateSettleRequest}
          />
          <TransportApprobation
            open={isUpdateTransport}
            onOpenChange={setIsUpdateTransport}
            request={selectedItem}
            users={usersData}
          />
        </>
      )}
    </div>
  );
}
