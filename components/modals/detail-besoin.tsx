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
} from "lucide-react";
import { useStore } from "@/providers/datastore";
import { format } from "date-fns";
import { UserQueries } from "@/queries/baseModule";
import { useQuery } from "@tanstack/react-query";
import { RequestModelT } from "@/types/types";
import { ProjectQueries } from "@/queries/projectModule";
import { RequestQueries } from "@/queries/requestModule";

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

  // Récupération des données
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => users.getAll(),
  });

  const projectsData = useQuery({
    queryKey: ["projects"],
    queryFn: async () => projects.getAll(),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => request.getCategories(),
  });

  if (!data) return null;

  // Fonctions pour récupérer les noms
  const getProjectName = (projectId: string) => {
    const project = projectsData.data?.data?.find(proj => proj.id === Number(projectId));
    return project?.label || projectId; 
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.data?.data?.find(cat => cat.id === Number(categoryId));
    return category?.label || categoryId; 
  };

  const getUserName = (userId: string) => {
    const user = usersData.data?.data?.find(u => u.id === Number(userId));
    return user?.name || userId; 
  };

  const statusConfig = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    validated: {
      label: "Approuvé",
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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
  const currentStatus = statusConfig[data.state as StatusKey] ?? statusConfig.pending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[750px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header avec fond bordeaux */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            <span className="sr-only">{"Close"}</span>
          </button>
          <DialogTitle className="text-xl font-semibold text-white">
            {data.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Details du besoin"}</p>
        </DialogHeader>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          {/* Référence */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Référence"}</p>
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
              <p className="font-semibold">{getProjectName(String(data.projectId))}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Description"}</p>
              <p className="text-sm">{data.description}</p>
            </div>
          </div>

          {/* Catégorie - MAJ */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FolderTree className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Catégorie"}</p>
              <p className="font-semibold">{getCategoryName(String(data.categoryId))}</p>
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

          {/* Bénéficiaires */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Bénéficiaires"}</p>
              <div className="flex flex-col">
                {data.beneficiary === "me" ? (
                  <p className="font-semibold">{user?.name}</p>
                ) : (
                  <div className="flex flex-col">
                    {data.beficiaryList?.map((ben) => {
                      const beneficiary = usersData.data?.data?.find((x) => x.id === ben.id);
                      return (
                        <p key={ben.id} className="font-semibold">{`• ${beneficiary?.name || ben.id}`}</p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Initié par - MAJ */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Initié par"}</p>
              <p className="font-semibold">{getUserName(String(data.userId))}</p>
            </div>
          </div>

          {/* Date de création */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Créé le"}</p>
              <p className="font-semibold">
                {format(data.createdAt, "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          {/* Date de modification */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Modifié le</p>
              <p className="font-semibold">
                {format(data.updatedAt, "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          {/* Date limite */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{"Date limite"}</p>
              <p className="font-semibold">
                {format(data.dueDate!, "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Boutons du footer */}
        <div className="flex gap-3 p-6 pt-0">
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