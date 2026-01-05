"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XAF } from "@/lib/utils";
import { ProjectT } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircle,
  Clipboard,
  DollarSign,
  FileText,
  Hash,
  LucideCalendar,
  LucideCalendarFold,
  LucideClock,
  LucideIcon,
  LucideSquareUserRound,
  PauseCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";

interface DetailProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ProjectT | null;
}

export function DetailProject({
  open,
  onOpenChange,
  data,
}: DetailProjectProps) {
  if (!data) return null;

  // Fonction pour obtenir les informations du badge selon le statut
  const getStatusBadge = (
    status: string
  ): {
    label: string;
    icon?: LucideIcon;
    variant: VariantProps<typeof badgeVariants>["variant"];
  } => {
    switch (status) {
      case "planning":
        return { label: "Planification", variant: "amber" };
      case "in-progress":
        return { label: "En cours", icon: PlayCircle, variant: "amber" };
      case "on-hold":
        return { label: "Suspendu", icon: PauseCircle, variant: "destructive" };
      case "Completed":
        return { label: "Terminé", icon: CheckCircle, variant: "success" };
      case "cancelled":
        return { label: "Supprimé", icon: XCircle, variant: "destructive" };
      case "ongoing":
        return { label: "En cours", icon: LucideClock, variant: "amber" };
      default:
        return { label: status, variant: "outline" };
    }
  };

  const statusBadge = getStatusBadge(data.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {"Projet" + " - " + data.label}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Detail du projet"}</p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations générales - Première ligne */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche */}
            <div className="space-y-4">
              {/* Référence */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{"Référence"}</p>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
                  >
                    {data.reference}
                  </Badge>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Budget prévisionnel"}
                  </p>
                  <p className="font-semibold text-lg">
                    {XAF.format(data.budget)}
                  </p>
                </div>
              </div>

              {/* Chef de projet */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <LucideSquareUserRound className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Chef de projet"}
                  </p>
                  <p className="font-semibold">
                    {data.chief?.name || "Non assigné"}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4">
              {/* Statut */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{"Statut"}</p>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.icon && (
                      <statusBadge.icon className="h-4 w-4 mr-1" />
                    )}
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>

              {/* Créé le */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <LucideCalendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{"Créé le"}</p>
                  <p className="font-semibold">
                    {data.createdAt
                      ? format(new Date(data.createdAt), "PPP", { locale: fr })
                      : "Non spécifié"}
                  </p>
                </div>
              </div>

              {/* Modifié le */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <LucideCalendarFold className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Modifié le"}
                  </p>
                  <p className="font-semibold">
                    {data.updatedAt
                      ? format(new Date(data.updatedAt), "PPP", { locale: fr })
                      : "Non spécifié"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Pleine largeur */}
          <div className="border-t pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Clipboard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  {"Description"}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm">
                    {data.description || "Aucune description fournie"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button
            variant="outline"
            className="border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538]/10"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
