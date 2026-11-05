"use client";

import { ViewDrawer, ViewGrid, ViewGroup } from "@/components/ds/view-drawer";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { XAF } from "@/lib/utils";
import { userQ } from "@/queries/baseModule";
import { ProjectT } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
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
  UserRound,
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
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: () => userQ.getAll(),
    enabled: !!data,
  });

  if (!data) return null;

  // Fonction pour obtenir les informations du badge selon le statut
  const getStatusBadge = (
    status: string,
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

  const getUserName = (id: number) => {
    const user = usersData.data?.data.find((user) => user.id === id);
    return user ? `${user.lastName} ${user.firstName}` : "N/A";
  };

  const statusBadge = getStatusBadge(data.status);

  return (
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Projet"
      title={data.label}
      description="Consultez les informations associées au projet"
    >
      <ViewGrid>
        <ViewGroup icon={Hash} label="Référence">
          <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
            <p className="text-primary-600 text-sm">{data.reference}</p>
          </div>
        </ViewGroup>
        <ViewGroup icon={FileText} label="Statut">
          <Badge variant={statusBadge.variant}>
            {statusBadge.icon && <statusBadge.icon />}
            {statusBadge.label}
          </Badge>
        </ViewGroup>
        <ViewGroup icon={DollarSign} label="Budget prévisionnel">
          <p className="font-semibold">{XAF.format(data.budget)}</p>
        </ViewGroup>
        <ViewGroup icon={LucideSquareUserRound} label="Chef de projet">
          <p className="font-semibold">
            {data.chief
              ? data.chief.firstName.concat(" ", data.chief.lastName)
              : "Non assigné"}
          </p>
        </ViewGroup>
        <ViewGroup icon={UserRound} label="Créé par">
          <p className="font-semibold">{getUserName(data.userId)}</p>
        </ViewGroup>
        <ViewGroup icon={LucideCalendar} label="Créé le">
          <p className="font-semibold">
            {data.createdAt
              ? format(new Date(data.createdAt), "PPP", { locale: fr })
              : "Non spécifié"}
          </p>
        </ViewGroup>
        <ViewGroup icon={LucideCalendarFold} label="Modifié le">
          <p className="font-semibold">
            {data.updatedAt
              ? format(new Date(data.updatedAt), "PPP", { locale: fr })
              : "Non spécifié"}
          </p>
        </ViewGroup>
        <ViewGroup icon={Clipboard} label="Description" wide>
          <p className={data.description ? undefined : "italic text-gray-600"}>
            {data.description || "Aucune description fournie"}
          </p>
        </ViewGroup>
      </ViewGrid>
    </ViewDrawer>
  );
}
