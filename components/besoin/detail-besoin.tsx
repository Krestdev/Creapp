"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { userQ } from "@/queries/baseModule";
import { categoryQ } from "@/queries/categoryModule";
import { paymentQ } from "@/queries/payment";
import { projectQ } from "@/queries/projectModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  ArrowBigUpIcon,
  BriefcaseBusinessIcon,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle,
  Clock,
  DollarSignIcon,
  Edit,
  FileIcon,
  FolderIcon,
  InfoIcon,
  LucideHash,
  LucidePieChart,
  MessageSquareXIcon,
  SquareStackIcon,
  TextQuoteIcon,
  UserIcon,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT | null;
  action: () => void;
  actionButton: string;
}

export function DetailBesoin({ open, onOpenChange, data }: DetailModalProps) {
  const { user } = useStore();
  const userId = user?.id;

  // Récupération des données
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => paymentQ.getAll(),
  });

  const usersData = useQuery({
    queryKey: ["userQ"],
    queryFn: async () => userQ.getAll(),
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projectQ.getAll(),
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => categoryQ.getCategories(),
  });

  if (!data) return null;

  // Fonction pour vérifier si un champ a été modifié
  const hasFieldChanged = (field: keyof RequestModelT, compareValue: any): boolean => {
    if (!data.requestOlds || data.requestOlds.length === 0) {
      return false;
    }

    const oldestRequest = findOldestRequest(data.requestOlds);
    if (!oldestRequest) return false;

    // Vérifier si le champ existe dans l'ancien enregistrement
    // Note: requestOlds contient seulement certains champs, pas tous
    const oldValue = (oldestRequest as any)[field];
    if (oldValue === undefined) return false;

    // Comparer les valeurs
    if (field === 'amount' || field === 'quantity') {
      return oldValue !== compareValue;
    }

    if (field === 'priority') {
      return oldValue !== compareValue;
    }

    if (field === 'dueDate') {
      return new Date(oldValue).getTime() !== new Date(compareValue).getTime();
    }

    return oldValue !== compareValue;
  };

  // Fonction pour vérifier si c'est modifié par un utilisateur différent
  const isModifiedByDifferentUser = (): boolean => {
    if (!data.requestOlds || data.requestOlds.length === 0) {
      return false;
    }

    const oldestRequest = findOldestRequest(data.requestOlds);
    if (!oldestRequest) return false;

    // Vérifier si l'utilisateur de l'ancien enregistrement est différent de l'utilisateur actuel
    return oldestRequest.userId !== data.userId;
  };

  // Fonction pour récupérer le nom de l'utilisateur qui a fait la modification
  const getModifierName = (): string | null => {
    if (!isModifiedByDifferentUser() || !data.requestOlds) {
      return null;
    }

    // Prendre le dernier enregistrement modifié (le plus récent après l'ancien)
    const sortedRequests = [...data.requestOlds].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestModifierId = sortedRequests.find(req => req.userId !== data.userId)?.userId;
    if (!latestModifierId) return null;

    const modifier = usersData.data?.data?.find(u => u.id === latestModifierId);
    return modifier ? `${modifier.firstName} ${modifier.lastName}` : null;
  };

  //Get the first value of our request
  const findOldestRequest = (requests: RequestModelT["requestOlds"]) => {
    if (!requests || requests.length === 0) {
      return null;
    }

    return requests.reduce((oldest, current) => {
      return new Date(current.createdAt) < new Date(oldest.createdAt)
        ? current
        : oldest;
    });
  };

  // Fonctions pour récupérer les noms
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

  // Trouver la catégorie du besoin pour récupérer les validateurs configurés
  const categoryOfRequest = categoriesData.data?.data?.find(
    (cat) => cat.id === Number(data.categoryId),
  );

  // Récupérer les validateurs configurés pour cette catégorie, triés par rank
  const configuredValidators =
    categoryOfRequest?.validators?.sort((a, b) => a.rank - b.rank) || [];

  const paiement = paymentsData.data?.data.find(
    (x) => x.requestId === data?.id,
  );

  const getStatusBadge = (
    status: RequestModelT["state"],
  ): {
    label: string;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    status = status.toLocaleLowerCase();
    switch (status) {
      case "pending":
        return { label: "En attente", variant: "amber" };
      case "cancel":
        return { label: "Annulé", variant: "dark" };
      case "validated":
        return { label: "Approuvé", variant: "success" };
      case "rejected":
        return { label: "Rejeté", variant: "destructive" };
      case "in-review":
        return { label: "En révision", variant: "lime" };
      case "store":
        return { label: "Déstocké", variant: "blue" };
      default:
        return { label: status, variant: "default" };
    }
  };

  // Reste du code inchangé...

  const statusConfig = {
    pending: {
      label: "En attente",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    validated: {
      label: "Approuvé",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    rejected: {
      label: "Rejeté",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    cancel: {
      label: "Annulé",
      color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
    store: {
      label: "Déstocké",
      color: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    "in-review": {
      label: "En révision",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  };

  type StatusKey = keyof typeof statusConfig;
  const currentStatus =
    statusConfig[data.state as StatusKey] ?? statusConfig.pending;
  const curentPriority =
    data.priority === "urgent"
      ? "Urgent"
      : data.priority === "medium"
        ? "Moyen"
        : data.priority === "low"
          ? "Faible"
          : "Elevé";

  // Fonction pour obtenir l'historique de validation formaté
  const getValidationHistory = () => {
    const history = [];

    for (let i = 0; i < configuredValidators.length; i++) {
      const validator = configuredValidators[i];

      const validatorUser = usersData.data?.data?.find(
        (u) => u.id === validator.userId,
      );

      const review = data.revieweeList?.find(
        (r) => r.validatorId === validator.id,
      );

      let status = "pending";
      let icon = <Clock className="h-4 w-4 text-yellow-600" />;
      let statusText = "En attente";
      let statusColor = "text-yellow-600";
      let bgColor = "bg-yellow-50 border-yellow-200";
      let comment: string | null = null;

      if (review?.decision) {
        // ✅ VALIDÉ
        if (review.decision.startsWith("validated")) {
          status = "approved";
          icon = <CheckCircle className="h-4 w-4 text-green-600" />;
          statusText = "Approuvé";
          statusColor = "text-green-600";
          bgColor = "bg-green-50 border-green-200";
        }

        // ❌ REJETÉ → ON STOPPE LA CHAÎNE
        if (review.decision.startsWith("rejected")) {
          status = "rejected";
          icon = <XCircle className="h-4 w-4 text-red-600" />;
          statusText = "Rejeté";
          statusColor = "text-red-600";
          bgColor = "bg-red-50 border-red-200";

          comment = review.decision.replace(/^rejected\s*/i, "").trim() || null;

          history.push({
            step: i + 1,
            validatorName:
              validatorUser?.firstName + " " + validatorUser?.lastName ||
              `Validateur ${validator.rank}`,
            userId: validator.userId,
            status,
            statusText,
            icon,
            statusColor,
            bgColor,
            isNextStep: false,
            decision: review.decision,
            comment,
          });

          // 🔥 IMPORTANT : on arrête ici
          break;
        }
      }

      // 🔹 Étape suivante possible seulement s'il n'y a pas encore de review
      const isNextStep = false;

      history.push({
        step: i + 1,
        validatorName:
          validatorUser?.firstName + " " + validatorUser?.lastName ||
          `Validateur ${validator.rank}`,
        userId: validator.userId,
        status,
        statusText,
        icon,
        statusColor,
        bgColor,
        isNextStep,
        decision: review?.decision,
        comment,
      });
    }

    return history;
  };

  const validationHistory = getValidationHistory();

  // Récupérer l'ancienne valeur pour l'affichage
  const oldestRequest = findOldestRequest(data.requestOlds);
  const hasAmountChanged = hasFieldChanged('amount', data.amount);
  const hasPriorityChanged = hasFieldChanged('priority', data.priority);
  const hasDueDateChanged = hasFieldChanged('dueDate', data.dueDate);
  const hasQuantityChanged = data.type === "achat" && hasFieldChanged('quantity', data.quantity);
  const modifiedByDifferentUser = isModifiedByDifferentUser();
  const modifierName = getModifierName();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{`Besoin - ${data.label}`}</DialogTitle>
          <DialogDescription>{"Détails du besoin"}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 @min-[540px]/dialog:grid-cols-2 gap-3">
          {/**Reference */}
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">{data.ref}</p>
              </div>
            </div>
          </div>

          {/**Amount */}
          {!!data.amount && (
            <div className="view-group">
              <span className="view-icon">
                <DollarSignIcon />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Montant"}</p>
                  {hasAmountChanged && (
                    <Badge variant="outline" className="h-5 text-xs flex items-center gap-1">
                      <Edit />
                      {"Modifié"}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold">{XAF.format(data.amount)}</p>
                {hasAmountChanged && oldestRequest?.amount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {`Ancienne valeur: ${XAF.format(oldestRequest.amount)}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Project */}
          {!!data.projectId && (
            <div className="view-group">
              <span className="view-icon">
                <BriefcaseBusinessIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Projet associé"}</p>
                <p className="font-semibold">
                  {getProjectName(String(data.projectId))}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="view-group">
            <span className="view-icon">
              <TextQuoteIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Description"}</p>
              <p className={cn(!data.description && "italic text-gray-600")}>
                {data.description ?? "Non renseigné"}
              </p>
            </div>
          </div>

          {/* Catégorie */}
          <div className="view-group">
            <span className="view-icon">
              <FolderIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Catégorie"}</p>
              <p className="font-semibold">
                {!getCategoryName(String(data.categoryId)).includes("facilita")
                  ? getCategoryName(String(data.categoryId))
                  : data.type === "facilitation"
                    ? "Facilitation"
                    : data.type === "ressource_humaine"
                      ? "Ressources Humaines"
                      : data.type === "speciaux" && "Besoins Spéciaux"}
              </p>
            </div>
          </div>

          {/* Priorité */}
          <div className="view-group">
            <span className="view-icon">
              <ArrowBigUpIcon />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="view-group-title">{"Priorité"}</p>
                {hasPriorityChanged && (
                  <Badge variant="outline" className="h-5 text-xs flex items-center gap-1">
                    <Edit />
                    {"Modifié"}
                  </Badge>
                )}
              </div>
              <Badge
                variant={
                  data.priority === "urgent"
                    ? "destructive"
                    : data.priority === "medium"
                      ? "amber"
                      : data.priority === "low"
                        ? "outline"
                        : "sky"
                }
              >
                {data.priority === "urgent" ? (
                  <X />
                ) : data.priority === "medium" ? (
                  <Clock />
                ) : (
                  <Check />
                )}
                {curentPriority}
              </Badge>
              {hasPriorityChanged && oldestRequest?.priority && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ancienne valeur: {oldestRequest.priority === "urgent" ? "Urgent" :
                    oldestRequest.priority === "medium" ? "Moyen" :
                      oldestRequest.priority === "low" ? "Faible" : "Élevé"}
                </p>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="view-group">
            <span className="view-icon">
              <InfoIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              <Badge variant={getStatusBadge(data.state).variant}>
                {getStatusBadge(data.state).label}
              </Badge>
            </div>
          </div>

          {/* Motif de rejet */}
          {data.state === "rejected" && (
            <div className="view-group">
              <span className="view-icon">
                <MessageSquareXIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Motif du rejet"}</p>
                <p className="text-destructive">
                  {data.revieweeList
                    ?.filter((r) => r.decision?.startsWith("rejected"))
                    .map((r) => r.decision?.replace(/^rejected\s*/i, "").trim())
                    .join(", ") || "Aucun motif fourni"}
                </p>
              </div>
            </div>
          )}

          {/* Justificatif */}
          {data.type !== "speciaux" && data.type !== "achat" && (
            <div className="view-group">
              <span className="view-icon">
                <FileIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Justificatif"}</p>
                <div className="space-y-1">
                  {!!paiement?.proof ? (
                    <Link
                      href={`${process.env.NEXT_PUBLIC_API
                        }/${paiement?.proof as string}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-7 w-auto aspect-square"
                      />
                    </Link>
                  ) : (
                    <p className="italic">{"Aucun justificatif"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quantité pour achat */}
          {data.type === "achat" && (
            <div className="view-group">
              <span className="view-icon">
                <LucidePieChart />
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="view-group-title">{"Quantité"}</p>
                  {hasQuantityChanged && (
                    <Badge variant="outline" className="h-5 text-xs flex items-center gap-1">
                      <Edit />
                      {"Modifié"}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold">
                  {data.quantity + " " + data.unit}
                </p>
                {hasQuantityChanged && oldestRequest?.quantity && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {`Ancienne valeur: ${oldestRequest.quantity} {oldestRequest.unit}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Période pour ressources humaines */}
          {data.type === "ressource_humaine" && (
            <div className="view-group">
              <span className="view-icon">
                <CalendarClock />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Période"}</p>
                {data.period ? (
                  <p className="font-semibold">{`Du ${format(
                    data.period.from!,
                    "PPP",
                    { locale: fr },
                  )} au ${format(data.period.to!, "PPP", {
                    locale: fr,
                  })}`}</p>
                ) : (
                  <p>{"Non renseigné"}</p>
                )}
              </div>
            </div>
          )}

          {/* Bénéficiaires */}
          {data.type !== "speciaux" && (
            <div className="view-group">
              <span className="view-icon">
                <Users />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">
                  {data.type === "facilitation"
                    ? "Recepteur pour compte"
                    : "Bénéficiaires"}
                </p>
                {data.type === "facilitation" ? (
                  <p className="font-semibold capitalize">
                    {usersData.data?.data?.find(
                      (u) => u.id === Number(data.beneficiary),
                    )?.firstName +
                      " " +
                      usersData.data?.data?.find(
                        (u) => u.id === Number(data.beneficiary),
                      )?.lastName}
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {data.beneficiary === "me" ? (
                      <p className="font-semibold capitalize">
                        {user?.lastName + " " + user?.firstName}
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {data.beficiaryList?.map((ben) => {
                          const beneficiary = usersData.data?.data?.find(
                            (x) => x.id === ben.id,
                          );
                          return (
                            <p
                              key={ben.id}
                              className="font-semibold capitalize"
                            >{`${beneficiary?.firstName +
                              " " +
                              beneficiary?.lastName || ben.id
                              }`}</p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pour le compte de (facilitation) */}
          {data.type === "facilitation" && (
            <div className="view-group">
              <span className="view-icon">
                <Users />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Pour le compte de"}</p>
                <div className="flex flex-col">
                  {data.benFac?.list?.map((ben) => {
                    return (
                      <p
                        key={ben.id}
                        className="font-semibold capitalize"
                      >{`${ben?.name} - ${XAF.format(ben?.amount)}`}</p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Initié par */}
          <div className="view-group">
            <span className="view-icon">
              <UserIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Initié par"}</p>
              <p className="font-semibold capitalize">
                {getUserName(String(data.userId))}
              </p>
              {modifiedByDifferentUser && modifierName && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Edit className="h-3 w-3" />
                  Modifié par: {modifierName}
                </p>
              )}
            </div>
          </div>

          {/* Validation History */}
          {data.type === "ressource_humaine" ||
            data.type === "speciaux" ? null : (
            <div className="view-group">
              <span className="view-icon">
                <SquareStackIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Historique de validation"}</p>
                {data.state !== "cancel" ? (
                  <div className="flex flex-col gap-3">
                    {validationHistory.length === 0 ? (
                      <div className="text-center py-4 border rounded-lg bg-gray-50">
                        <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {"Aucun validateur configuré pour cette catégorie"}
                        </p>
                      </div>
                    ) : (
                      validationHistory.map((item) => {
                        return (
                          <div
                            key={item.step}
                            className={`border rounded-lg p-2 ${item.bgColor}`}
                          >
                            <div>
                              <div className="text-[10px] text-gray-500 tracking-wide">
                                {item.status === "approved"
                                  ? `Étape ${item.step} : Approuvé par`
                                  : item.status === "rejected"
                                    ? `Étape ${item.step} : Rejeté par`
                                    : `Étape ${item.step} : En attente de l'approbation de`}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-[16px]">
                                    {item.validatorName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-lg bg-gray-50 max-w-[300px]">
                    {
                      "Historique de validation non disponible car vous avez annulé le besoin"
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date de création */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Créé le"}</p>
              <p className="font-semibold">
                {format(data.createdAt, "PPP", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Date de modification */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              {data.state === "rejected" ? (
                <>
                  <p className="view-group-title">{"Supprimé le"}</p>
                  <p className="font-semibold">
                    {format(
                      data.revieweeList
                        ?.filter((r) => r.decision?.startsWith("rejected"))
                        .pop()?.updatedAt!,
                      "dd MMMM yyyy, p",
                      { locale: fr },
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="view-group-title">{"Modifié le"}</p>
                    {modifiedByDifferentUser && (
                      <Badge variant="outline">
                        {"Par un autre utilisateur"}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold">
                    {format(data.updatedAt, "PPP", { locale: fr })}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Date limite */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="view-group-title">{"Date limite"}</p>
                {hasDueDateChanged && (
                  <Badge variant="outline" className="h-5 text-xs flex items-center gap-1">
                    <Edit />
                    {"Modifié"}
                  </Badge>
                )}
              </div>
              <p className="font-semibold">
                {format(data.dueDate!, "PPP", { locale: fr })}
              </p>
              {hasDueDateChanged && oldestRequest?.dueDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {` Ancienne date: ${format(oldestRequest.dueDate, "PPP", { locale: fr })}`}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Boutons du footer */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}