"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  FolderOpen,
  FileText,
  FolderTree,
  AlertCircle,
  Users,
  UserPlus,
  Calendar,
  X,
  LucidePieChart,
  SettingsIcon,
  FileWarning,
  UserCheck,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";
import { useStore } from "@/providers/datastore";
import { format } from "date-fns";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { RequestModelT } from "@/types/types";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";
import { fr } from "date-fns/locale";
import { DepartmentQueries } from "@/queries/departmentModule";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const request = new RequestQueries();
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
    queryFn: async () => request.getCategories(),
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

  const validators = departmentData.data?.data
    .filter((x) => x.members.find((mem) => mem.userId === user?.id))
    .flatMap((x) => x.members)
    .filter((x) => x.validator === true);

  const lastValidator = departmentData.data?.data
    .filter((x) => x.members.find((mem) => mem.userId === user?.id))
    .flatMap((x) => x.members)
    .find((x) => x.finalValidator === true);

  const statusConfig = {
    pending: {
      label: "En attente",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    validated: {
      label: "Soumis",
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
  const motifRejet = data.revieweeList?.length
    ? data.revieweeList[data.revieweeList.length - 1].decision
    : "";

  const motifSansPremierMot = motifRejet.split(" ").slice(1).join(" ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Details du besoin"}</p>
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
                  <X className="h-3 w-3 mr-1" />
                  {currentStatus.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-3">
                  {"Historique de validation"}
                </p>

                <div className="flex flex-col gap-2">
                  {/* VALIDATEURS INTERMEDIAIRES */}
                  {validators?.map((validator, index) => {
                    const user = usersData.data?.data?.find(
                      (u) => u.id === Number(validator.userId)
                    );

                    const isValidatorInList = data.revieweeList
                      ?.flatMap((reviewee) => reviewee.validatorId)
                      .includes(user?.id!);

                    const isAccepted =
                      data.revieweeList?.find((r) => r.validatorId === user?.id)
                        ?.decision === "validated";

                    const isRejected =
                      data.revieweeList?.find((r) => r.validatorId === user?.id)
                        ?.decision === "rejected";

                    /** STATUS BADGE */
                    const statusBadge =
                      isValidatorInList && isAccepted ? (
                        <span className="px-3 py-1 rounded-full text-sm bg-green-200 text-green-700">
                          Accepté
                        </span>
                      ) : data.state === "rejected" && isValidatorInList ? (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-200 text-red-700">
                          Rejeté
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-yellow-200 text-yellow-700">
                          En attente
                        </span>
                      );

                    const isMotif =
                      data.state === "rejected" &&
                      isValidatorInList &&
                      !isAccepted;

                    return (
                      <Card
                        key={index}
                        className="p-4 rounded-xl shadow-sm border"
                      >
                        {/* Statut */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Statut :</span>
                          {statusBadge}
                        </div>

                        {/* Motif pour ce validateur UNIQUEMENT s’il a rejeté */}
                        {isMotif && (
                          <div>
                            <p className="font-semibold">Motif</p>
                            <p className="text-sm whitespace-normal wrap-break-word">
                              {motifSansPremierMot}
                            </p>
                          </div>
                        )}

                        {/* NOM */}
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Nom :</p>
                          <p className={`text-sm`}>{user?.name}</p>
                        </div>
                      </Card>
                    );
                  })}

                  {/* DERNIER VALIDATEUR */}
                  {(() => {
                    const user = usersData.data?.data?.find(
                      (u) => u.id === lastValidator?.userId
                    );

                    const someoneRejected = data.revieweeList?.some(
                      (r) => r.decision !== "validated"
                    );

                    let statusLabel = "En attente";
                    let statusColor = "bg-yellow-200 text-yellow-700";
                    let showMotif = false;

                    if (someoneRejected) {
                      statusLabel = "Non vu";
                      statusColor = "bg-gray-200 text-gray-700";
                    } else if (data.state === "validated") {
                      statusLabel = "Soumis";
                      statusColor = "bg-green-200 text-green-700";
                    } else if (data.state === "rejected") {
                      statusLabel = "Rejeté";
                      statusColor = "bg-red-200 text-red-700";
                      showMotif = true;
                    }

                    const isMotif =
                      data.state === "rejected" &&
                      !data.revieweeList?.some(
                        (r) => r.decision !== "validated"
                      );

                    return (
                      <Card className="p-4 rounded-xl shadow-sm border">
                        {/* Statut */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Statut :</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        {/* Motif du dernier validateur selon TA logique */}
                        {isMotif && (
                          <div>
                            <p className="font-semibold">Motif</p>
                            <p className="text-sm whitespace-normal wrap-break-word">
                              {motifSansPremierMot}
                            </p>
                          </div>
                        )}

                        {/* NOM */}
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Nom :</p>
                          <p className={`text-sm`}>{user?.name}</p>
                        </div>
                      </Card>
                    );
                  })()}
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
                  <X className="h-3 w-3 mr-1" />
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
            disabled={data.state !== "pending"}
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
