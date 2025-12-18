"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/providers/datastore";
import { UserQueries } from "@/queries/baseModule";
import { CategoryQueries } from "@/queries/categoryModule";
import { DepartmentQueries } from "@/queries/departmentModule";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestModelT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
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
  ChevronRight,
  Dot,
} from "lucide-react";
import { Card } from "../ui/card";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestModelT | null;
  action: () => void;
  actionButton: string;
}

export function DetailBesoin({
  open,
  onOpenChange,
  data,
  action,
  actionButton,
}: DetailModalProps) {
  const { user } = useStore();

  const users = new UserQueries();
  const projects = new ProjectQueries();
  const category = new CategoryQueries();
  const department = new DepartmentQueries();

  // Récupération des données
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
    return user?.name || userId;
  };

  // Trouver la catégorie du besoin pour récupérer les validateurs configurés
  const categoryOfRequest = categoriesData.data?.data?.find(
    (cat) => cat.id === Number(data.categoryId)
  );

  // Récupérer les validateurs configurés pour cette catégorie, triés par rank
  const configuredValidators = categoryOfRequest?.validators?.sort(
    (a, b) => a.rank - b.rank
  ) || [];

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
    "in-review": {
      label: "En révision",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
  };

  type StatusKey = keyof typeof statusConfig;
  const currentStatus =
    statusConfig[data.state as StatusKey] ?? statusConfig.pending;
  const curentPriority =
    data.proprity === "urgent"
      ? "Urgent"
      : data.proprity === "medium"
      ? "Moyen"
      : data.proprity === "low"
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
        (r) => r.validatorId === validator.userId
      );

      let status = "pending";
      let icon = <Clock className="h-4 w-4" />;
      let statusText = "En attente";
      let statusColor = "text-yellow-600";
      let bgColor = "bg-yellow-50 border-yellow-200";

      if (review) {
        if (review.decision === "validated") {
          status = "approved";
          icon = <CheckCircle className="h-4 w-4 text-green-600" />;
          statusText = "Approuvé";
          statusColor = "text-green-600";
          bgColor = "bg-green-50 border-green-200";
        } else if (review.decision === "rejected") {
          status = "rejected";
          icon = <XCircle className="h-4 w-4 text-red-600" />;
          statusText = "Rejeté";
          statusColor = "text-red-600";
          bgColor = "bg-red-50 border-red-200";
        }
      }

      // Vérifier si c'est la prochaine étape (toutes les précédentes sont approuvées)
      let isNextStep = false;
      if (!review) {
        const previousValidators = configuredValidators.slice(0, i);
        const allPreviousApproved = previousValidators.every((prevValidator) => {
          const prevReview = data.revieweeList?.find(
            (r) => r.validatorId === prevValidator.userId
          );
          return prevReview?.decision === "validated";
        });
        
        if (allPreviousApproved) {
          isNextStep = true;
          bgColor = "bg-blue-50 border-blue-200";
        }
      }

      history.push({
        step: i + 1,
        validatorName: validatorUser?.name || `Validateur ${validator.rank}`,
        userId: validator.userId,
        status,
        statusText,
        icon,
        statusColor,
        bgColor,
        isNextStep,
        decision: review?.decision,
        comment: review?.decision === "rejected" ? review?.decision?.split(" ").slice(1).join(" ") : null,
        // reviewDate: review?.createdAt ? format(new Date(review.createdAt), "dd/MM/yyyy HH:mm", { locale: fr }) : null,
      });
    }

    return history;
  };

  const validationHistory = getValidationHistory();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Détails du besoin"}</p>
        </DialogHeader>

        {/* Contenu - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6">
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
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{"Projet"}</p>
                <p className="font-semibold">
                  {getProjectName(String(data.projectId))}
                </p>
              </div>
            </div>

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
                <p className="text-sm text-muted-foreground mb-1">{"Statut"}</p>
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

            {/* Historique de validation - NOUVELLE VERSION */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  {"Historique de validation"}
                </p>

                <div className="flex flex-col gap-3">
                  {validationHistory.length === 0 ? (
                    <div className="text-center py-4 border rounded-lg bg-gray-50">
                      <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Aucun validateur configuré pour cette catégorie
                      </p>
                    </div>
                  ) : (
                    validationHistory.map((item) => (
                      <div
                        key={item.step}
                        className={`border rounded-lg p-4 ${item.bgColor}`}
                      >
                        {/* Étape */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border font-semibold text-sm">
                              {item.step}
                            </div>
                            <span className="font-medium">
                              Étape {item.step}
                            </span>
                          </div>
                          
                          {/* Badge de statut */}
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className={`text-sm font-medium ${item.statusColor}`}>
                              {item.statusText}
                            </span>
                          </div>
                        </div>

                        {/* Ligne de séparation */}
                        <div className="border-t my-2"></div>

                        {/* Nom du validateur - Style similaire à l'image */}
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {item.status === "approved" 
                              ? `Étape ${item.step} : Approuvé par` 
                              : item.status === "rejected"
                              ? `Étape ${item.step} : Rejeté par`
                              : item.isNextStep
                              ? `Étape ${item.step} : En attente de validation par`
                              : `Étape ${item.step} : À valider par`}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-lg">
                                {item.validatorName}
                              </p>
                              {/* {item.reviewDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {item.reviewDate}
                                </p>
                              )} */}
                            </div>
                          </div>
                        </div>

                        {/* Commentaire de rejet */}
                        {item.comment && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                              Motif du rejet
                            </p>
                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                              {item.comment}
                            </p>
                          </div>
                        )}

                        {/* Indicateur de prochaine étape */}
                        {item.isNextStep && (
                          <div className="mt-3 pt-3 border-t border-dashed">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                En attente de cette validation
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Résumé du processus */}
                  {validationHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {validationHistory.filter(item => item.status === "approved").length > 0 && (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                                <span className="text-green-600">
                                  {validationHistory.filter(item => item.status === "approved").length} approuvé(s)
                                </span>
                              </>
                            )}
                          </div>
                          {validationHistory.some(item => item.status === "rejected") && (
                            <div className="flex items-center ml-4">
                              <XCircle className="h-4 w-4 text-red-600 mr-1" />
                              <span className="text-red-600">
                                {validationHistory.filter(item => item.status === "rejected").length} rejeté(s)
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-gray-500">
                          {validationHistory.filter(item => item.status === "pending" && !item.isNextStep).length} en attente
                        </div>
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(validationHistory.filter(item => item.status === "approved").length / validationHistory.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  className={`${
                    data.proprity === "urgent"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : data.proprity === "medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : data.proprity === "low"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {data.proprity === "urgent" ? (
                    <X className="h-3 w-3 mr-1" />
                  ) : data.proprity === "medium" ? (
                    <Clock className="h-3 w-3 mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {curentPriority}
                </Badge>
              </div>
            </div>

            {/* Bénéficiaires */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Bénéficiaires"}
                </p>
                <div className="flex flex-col">
                  {data.beneficiary === "me" ? (
                    <p className="font-semibold capitalize">{user?.name}</p>
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
                          >{`• ${beneficiary?.name || ben.id}`}</p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

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

        {/* Boutons du footer - FIXE */}
        <div className="flex gap-3 p-6 pt-0 shrink-0">
          <Button
            onClick={action}
            className="flex-1 bg-[#003D82] hover:bg-[#002D62] text-white"
            disabled={
              data.state !== "pending" ||
              data.revieweeList?.some((x) => x.validatorId === user?.id)
            }
          >
            {actionButton}
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}