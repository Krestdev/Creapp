"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { DepartmentQueries } from "@/queries/departmentModule";
import { PaymentQueries } from "@/queries/payment";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  FileIcon,
  FileText,
  FolderOpen,
  FolderTree,
  Hash,
  LucidePieChart,
  UserCheck,
  UserPlus,
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

  const users = new UserQueries();
  const projects = new ProjectQueries();
  const category = new CategoryQueries();
  const department = new DepartmentQueries();
  const payments = new PaymentQueries();


  // Récupération des données
  const paymentsData = useQuery({
    queryKey: ["payments"],
    queryFn: async () => payments.getAll(),
  });

  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  const categoriesData = useQuery({
    queryKey: ["categories"],
    queryFn: async () => category.getCategories(),
  });

  const departmentData = useQuery({
    queryKey: ["departments"],
    queryFn: async () => department.getAll(),
  });

  if (!data) return null;

  // Fonctions pour récupérer les noms
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
    return user?.firstName + " " + user?.lastName || userId;
  };

  // Trouver la catégorie du besoin pour récupérer les validateurs configurés
  const categoryOfRequest = categoriesData.data?.data?.find(
    (cat) => cat.id === Number(data.categoryId)
  );

  // Récupérer les validateurs configurés pour cette catégorie, triés par rank
  const configuredValidators =
    categoryOfRequest?.validators?.sort((a, b) => a.rank - b.rank) || [];

  const paiement = paymentsData.data?.data.find(
    (x) => x.requestId === data?.id
  );

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
        (u) => u.id === validator.userId
      );

      const review = data.revieweeList?.find(
        (r) => r.validatorId === validator.id
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
              validatorUser?.firstName + " " + validatorUser?.lastName || `Validateur ${validator.rank}`,
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

      if (!review) {
        const previousValidators = configuredValidators.slice(0, i);

        const allPreviousApproved = previousValidators.every(
          (prevValidator) => {
            const prevReview = data.revieweeList?.find(
              (r) => r.validatorId === prevValidator.userId
            );
            return prevReview?.decision?.startsWith("validated");
          }
        );
      }

      history.push({
        step: i + 1,
        validatorName: validatorUser?.firstName + " " + validatorUser?.lastName || `Validateur ${validator.rank}`,
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
  console.log(data.state);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl! max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {`Besoin - ${data.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Détails du besoin"}</p>
        </DialogHeader>

        {/* Contenu - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4 pb-4">
              {/* Référence */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Référence"}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
                  >
                    {data.ref}
                  </Badge>
                </div>
              </div>

              {/* Projet - MAJ */}
              {data.projectId !== null &&
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Projet"}
                    </p>
                    <p className="font-semibold">
                      {getProjectName(String(data.projectId))}
                    </p>
                  </div>
                </div>}

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Description"}
                  </p>
                  <p className="text-sm">{data.description}</p>
                </div>
              </div>

              {/* Catégorie - MAJ */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FolderTree className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Catégorie"}
                  </p>
                  <p className="font-semibold">
                    {getCategoryName(String(data.categoryId))}
                  </p>
                </div>
              </div>

              {/* Statut */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Statut"}
                  </p>
                  <Badge className={currentStatus.color}>
                    {currentStatus.label === "Rejeté" ? (
                      <X className="h-3 w-3 mr-1" />
                    ) : currentStatus.label === "Approuvé" ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : currentStatus.label === "En attente" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : currentStatus.label === "En révision" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      ""
                    )}
                    {currentStatus.label}
                  </Badge>
                </div>
              </div>

              {/* Priorité */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Priorité"}
                  </p>
                  <Badge
                    className={`${data.priority === "urgent"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : data.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : data.priority === "low"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                  >
                    {data.priority === "urgent" ? (
                      <X className="h-3 w-3 mr-1" />
                    ) : data.priority === "medium" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {curentPriority}
                  </Badge>
                </div>
              </div>

              {/* Justificatif */}
              <div className="view-group">
                <span className="view-icon">
                  <FileIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Justificatif"}</p>
                  <div className="space-y-1">
                    {!!paiement?.proof ?
                      paiement?.proof.split(";").map((proof, index) => (
                        <Link
                          key={index}
                          href={`${process.env.NEXT_PUBLIC_API
                            }/uploads/${encodeURIComponent(proof)}`}
                          target="_blank"
                          className="flex gap-0.5 items-center"
                        >
                          <img
                            src="/images/pdf.png"
                            alt="justificatif"
                            className="h-7 w-auto aspect-square"
                          />
                          <p className="text-foreground font-medium">
                            {`Fichier_${index + 1}`}
                          </p>
                        </Link>)) : <p className="italic">{"Aucun justificatif"}</p>}
                  </div>
                </div>
              </div>

              {/* Historique de validation - NOUVELLE VERSION */}
              {data.type === "RH" || data.type === "SPECIAL" ? null :
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3">
                      {"Historique de validation"}
                    </p>

                    {data.state !== "cancel" ? (
                      <div className="flex flex-col gap-3">
                        {validationHistory.length === 0 ? (
                          <div className="text-center py-4 border rounded-lg bg-gray-50">
                            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Aucun validateur configuré pour cette catégorie
                            </p>
                          </div>
                        ) : (
                          validationHistory.map((item) => {
                            return (
                              <div
                                key={item.step}
                                className={`border rounded-lg p-2 ${item.bgColor}`}
                              >
                                {/* Nom du validateur - Style similaire à l'image */}
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
                </div>}

              {/* Motif de rejet */}
              {data.state === "rejected" && (
                <div className="flex items-start gap-3 col-span-2">
                  <div className="mt-1">
                    <FolderTree className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Motif de rejet"}
                    </p>
                    <p>
                      {/* Ici on va aller dans la reviewList pour prendre le motif de celui qui a rejeté */}
                      {data.revieweeList
                        ?.filter((r) => r.decision?.startsWith("rejected"))
                        .map((r) =>
                          r.decision?.replace(/^rejected\s*/i, "").trim()
                        )
                        .join(", ") || "Aucun motif fourni"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-4 pb-4">
              {/* Priorité */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Période"}
                  </p>
                  {data.period ? (
                    <p className="font-semibold">{`Du ${format(
                      data.period.from!,
                      "PPP",
                      { locale: fr }
                    )} au ${format(data.period.to!, "PPP", {
                      locale: fr,
                    })}`}</p>
                  ) : (
                    <p>Non renseigné</p>
                  )}
                </div>
              </div>

              {/* Bénéficiaires */}
              {data.type !== "SPECIAL" &&
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {data.type === "FAC"
                        ? "Recepteur pour compte"
                        : "Bénéficiaires"}
                    </p>
                    {data.type === "FAC" ? (
                      <p className="font-semibold capitalize">
                        {
                          usersData.data?.data?.find(
                            (u) => u.id === Number(data.beneficiary)
                          )?.firstName + " " + usersData.data?.data?.find(
                            (u) => u.id === Number(data.beneficiary)
                          )?.lastName
                        }
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {data.beneficiary === "me" ? (
                          <p className="font-semibold capitalize">{user?.firstName + " " + user?.lastName}</p>
                        ) : (
                          <div className="flex flex-col">
                            {data.beficiaryList?.map((ben) => {
                              const beneficiary = usersData.data?.data?.find(
                                (x) => x.id === ben.id
                              );
                              return (
                                <p
                                  key={ben.id}
                                  className="font-semibold capitalize"
                                >{`${beneficiary?.firstName + " " + beneficiary?.lastName || ben.id}`}</p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>}

              {data.type === "FAC" &&
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Pour le compte de"}
                    </p>
                    {
                      <div className="flex flex-col">
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
                    }
                  </div>
                </div>
              }

              {(data.type === "FAC" || data.type === "RH") &&
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {"Montant"}
                    </p>
                    <p>{XAF.format(data.amount!)}</p>
                  </div>
                </div>
              }

              {/* Quantité */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <LucidePieChart className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Quantité"}
                  </p>
                  <p className="font-semibold">
                    {data.quantity + " " + data.unit}
                  </p>
                </div>
              </div>

              {/* Initié par - MAJ */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Initié par"}
                  </p>
                  <p className="font-semibold capitalize">
                    {getUserName(String(data.userId))}
                  </p>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Créé le"}
                  </p>
                  <p className="font-semibold">
                    {format(data.createdAt, "PPP", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Date de modification */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Modifié le"}
                  </p>
                  <p className="font-semibold">
                    {format(data.updatedAt, "PPP", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Date limite */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Date limite"}
                  </p>
                  <p className="font-semibold">
                    {format(data.dueDate!, "PPP", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons du footer - FIXE */}
        <div className="flex gap-3 p-6 pt-0 shrink-0 ml-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
