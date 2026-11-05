"use client";

import { ActionDialog } from "@/components/ds/action-dialog";
import { RejectDialog } from "@/components/modals/reject-dialog";
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
  CheckCheck,
  Circle,
  EllipsisVertical,
  Eye,
  FolderUp,
  LoaderIcon,
  LucideBan,
  LucideCreditCard,
} from "lucide-react";
import * as React from "react";

import TransportApprobation from "@/app/tableau-de-bord/besoins/transport-approbation";
import ApprovalFilters, {
  ApprovalFiltersProps,
} from "@/app/tableau-de-bord/besoins/validation/filters";
import {
  REQUEST_COLUMN_CLASS,
  RequestCell,
  RequestStatusPill,
  RequestTypePill,
  requestRowClass,
} from "@/components/besoin/request-table-ui";
import { FilterButton } from "@/components/ds/filter-bar";
import { UserAvatar } from "@/components/ds/user-avatar";
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
import { formatNumber } from "@/lib/format";
import { cn, getUserName } from "@/lib/utils";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import Link from "next/link";

const COLUMN_LABELS: Record<string, string> = {
  userId: "Émetteur",
  beneficiary: "Bénéficiaires",
  type: "Type",
  projectId: "Projet",
  categoryId: "Catégorie",
  amount: "Montant (XAF)",
  createdAt: "Date d'émission",
  state: "Statut",
  validationProgress: "Validation",
};

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
  const queryClient = useQueryClient();
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
      queryClient.invalidateQueries();
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
      queryClient.invalidateQueries();
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

    /** Bénéficiaires du besoin : nom (+ service) ou pile d'avatars. */
    const beneficiariesOf = (item: RequestModelT) => {
      const user = (id: number) => usersData.find((u) => u.id === id);
      const asPerson = (u?: User, fallback?: string) => ({
        name: u ? `${u.firstName} ${u.lastName}` : (fallback ?? "--"),
        service: u?.service?.label,
      });
      const beneficiary = item.beneficiary ?? "";
      if (beneficiary.toLowerCase() === "me")
        return [asPerson(user(item.userId))];
      if (beneficiary.length > 0)
        return [asPerson(user(Number(beneficiary)), beneficiary)];
      if (item.type?.toLowerCase().includes("facili"))
        return (item.benFac?.list ?? []).map((li) => ({
          name: li.name,
          service: undefined as string | undefined,
        }));
      return (item.beficiaryList ?? []).map((u) => ({
        name: `${u.firstName} ${u.lastName}`,
        service: undefined as string | undefined,
      }));
    };

    baseColumns.push(
      {
        id: "besoin",
        accessorKey: "label",
        enableHiding: false,
        header: () => "Besoin",
        cell: ({ row }) => (
          <RequestCell
            reference={row.original.ref}
            label={row.original.label}
          />
        ),
      },
      {
        accessorKey: "type",
        header: () => "Type",
        cell: ({ row }) => (
          <RequestTypePill
            type={row.original.type}
            requestTypes={requestTypeData}
          />
        ),
      },
      {
        accessorKey: "userId",
        header: () => "Émetteur",
        cell: ({ row }) => {
          const author = usersData.find((u) => u.id === row.original.userId);
          const name = getUserName(usersData, row.original.userId) ?? "--";
          return (
            <div className="flex items-center gap-2">
              <UserAvatar name={name} size="sm" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-body-medium text-text-primary">
                  {name}
                </span>
                {author?.service?.label && (
                  <span className="truncate text-caption text-text-tertiary">
                    {author.service.label}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "beneficiary",
        header: () => "Bénéficiaires",
        cell: ({ row }) => {
          const people = beneficiariesOf(row.original);
          if (people.length === 0)
            return (
              <span className="text-body text-text-tertiary">{"Aucun"}</span>
            );
          if (people.length === 1)
            return (
              <div className="flex items-center gap-2">
                <UserAvatar name={people[0].name} size="sm" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-body-medium text-text-primary">
                    {people[0].name}
                  </span>
                  {people[0].service && (
                    <span className="truncate text-caption text-text-tertiary">
                      {people[0].service}
                    </span>
                  )}
                </div>
              </div>
            );
          return (
            <div
              className="flex items-center"
              title={people.map((p) => p.name).join(", ")}
            >
              {people.slice(0, 3).map((p, i) => (
                <UserAvatar
                  key={i}
                  name={p.name}
                  size="sm"
                  className={cn(i > 0 && "-ml-1")}
                />
              ))}
              {people.length > 3 && (
                <span className="ml-1.5 text-caption text-text-tertiary">
                  {"+"}
                  {people.length - 3}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "projectId",
        header: () => "Projet",
        cell: ({ row }) => {
          const projectId = row.original.projectId;
          return (
            <span className="line-clamp-1 text-body text-text-secondary">
              {projectId ? getProjectName(String(projectId)) : "--"}
            </span>
          );
        },
      },
      {
        accessorKey: "categoryId",
        header: () => "Catégorie",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-body text-text-secondary">
            {getCategoryName(String(row.original.categoryId))}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => (
          <span className="block text-right">{"Montant (XAF)"}</span>
        ),
        cell: ({ row }) => {
          const value = row.original;
          const amount =
            value.type !== "facilitation"
              ? value.amount
              : value.benFac?.list?.reduce(
                  (acc, item) => acc + item.amount,
                  0,
                );
          return (
            <span className="block text-right text-body whitespace-nowrap text-text-secondary">
              {amount ? formatNumber(amount) : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => "Date d'émission",
        cell: ({ row }) => (
          <span className="text-body whitespace-nowrap text-text-secondary">
            {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy", {
              locale: fr,
            })}
          </span>
        ),
      },
    );

    if (tab === "pending") {
      baseColumns.push({
        id: "validationProgress",
        header: () => "Validation",
        cell: ({ row }: { row: Row<RequestModelT> }) => {
          const validationInfo = getValidationInfo(row.original);
          if (!validationInfo.totalValidators) return null;
          return (
            <div className="flex w-28 flex-col gap-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${validationInfo.progress}%` }}
                />
              </div>
              <span className="text-caption text-text-tertiary">
                {validationInfo.validatedCount}
                {"/"}
                {validationInfo.totalValidators}
                {" validations"}
              </span>
            </div>
          );
        },
      });
    }

    if (tab === "processed") {
      baseColumns.push({
        accessorKey: "state",
        header: () => "Statut",
        cell: ({ row }) => <RequestStatusPill state={row.original.state} />,
      });
    }

    baseColumns.push({
      accessorKey: "actions",
      enableHiding: false,
      header: () => <span className="block text-right">{"Actions"}</span>,
      cell: ({ row }) => {
        const item = row.original;

        const validationInfo = getValidationInfo(item);
        const userHasValidated = hasUserAlreadyValidated(item);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions pour ${item.ref}`}
              className="ml-auto flex size-8 h-8 w-8 cursor-pointer items-center justify-center gap-0 border-0 bg-transparent p-0 text-text-secondary hover:bg-hover hover:text-text-primary data-[state=open]:bg-hover [&_svg]:size-[18px] [&_svg]:text-current"
            >
              <EllipsisVertical />
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
              <DropdownMenuItem>
                <Link
                  href={`${item.userId}`}
                  className="inline-flex gap-2 items-center"
                  target="_blank"
                >
                  <FolderUp />
                  {"Derniers besoins"}
                </Link>
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
  const advancedCount =
    [
      filters.customFilters.user,
      filters.customFilters.category,
      filters.customFilters.project,
      filters.customFilters.status,
      filters.customFilters.type,
    ].filter((v) => v !== "all").length + (filters.customFilters.date ? 1 : 0);

  const groupSelectionSummary = (
    <div className="flex items-center gap-2 rounded-md border border-status-info-border bg-status-info-bg px-3 py-2 text-body-medium text-status-info-fg">
      <Circle aria-hidden className="size-4 shrink-0" />
      {`${selectedCount} besoin(s) sélectionné(s)`}
    </div>
  );
  const canValidateSelected = selectedCount > 0 && isCheckable;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <FilterButton count={advancedCount} />
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{"Colonnes"}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <TabBar
        tabs={tabs.tabs}
        setSelectedTab={tabs.setSelectedTab}
        selectedTab={tabs.selectedTab}
      />
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
        <div className="overflow-hidden rounded-xl border border-border-default bg-surface">
          <Table className="min-w-[1240px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.id === "besoin" &&
                          cn("pl-5", REQUEST_COLUMN_CLASS),
                        (header.column.id === "projectId" ||
                          header.column.id === "categoryId") &&
                          "min-w-[170px]",
                        header.column.id === "actions" && "pr-5",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={requestRowClass(row.original.state)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-3 whitespace-normal normal-case",
                        cell.column.id === "besoin" && "pl-5",
                        cell.column.id === "actions" && "pr-5",
                      )}
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
          <Pagination
            table={table}
            noun="besoins"
            className="border-t border-border-default"
          />
        </div>
      ) : (
        <Empty message={empty} />
      )}

      {/* Dialog pour les actions de groupe */}
      {isCheckable &&
        (groupActionType === "approve" ? (
          <ActionDialog
            open={isGroupActionDialogOpen}
            onOpenChange={setIsGroupActionDialogOpen}
            tone="success"
            icon={CheckCheck}
            title="Approuver plusieurs besoins ?"
            description={`Êtes-vous sûr de vouloir approuver ${selectedCount} besoin(s) ?`}
            confirmLabel="Approuver"
            confirmVariant="default"
            isPending={isProcessingGroupAction}
            onConfirm={handleGroupAction}
          >
            {groupSelectionSummary}
          </ActionDialog>
        ) : (
          <RejectDialog
            open={isGroupActionDialogOpen}
            onOpenChange={(open) => {
              setIsGroupActionDialogOpen(open);
              if (!open) setRejectionReason("");
            }}
            title="Rejeter plusieurs besoins ?"
            description={`Le rejet est définitif : ${selectedCount} besoin(s) sortent du circuit. Les émetteurs sont notifiés avec votre motif.`}
            reason={{
              placeholder:
                "Expliquez la raison du rejet pour tous les besoins sélectionnés...",
              helper: "Ce motif sera appliqué à tous les besoins sélectionnés.",
            }}
            reasonValue={rejectionReason}
            onReasonChange={setRejectionReason}
            confirmLabel="Rejeter"
            isPending={isProcessingGroupAction}
            onConfirm={handleGroupAction}
          >
            {groupSelectionSummary}
          </RejectDialog>
        ))}

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
