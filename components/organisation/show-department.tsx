"use client";
import { ViewDialog, ViewGrid, ViewGroup } from "@/components/ds/view-dialog";
import { Badge } from "@/components/ui/badge";
import { DepartmentT } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building,
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  LucideCalendar,
  LucideUser,
  Shield,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

interface DetailDepartmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DepartmentT | null;
}

export function ShowDepartment({
  open,
  onOpenChange,
  data,
}: DetailDepartmentProps) {
  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPP", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Fonction pour obtenir le statut formaté
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Actif</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactif</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Compter les rôles des membres
  const countRoles = () => {
    if (!data?.members || data.members.length === 0) {
      return { total: 0, chiefs: 0, validators: 0, finalValidators: 0 };
    }

    return {
      total: data.members.length,
      chiefs: data.members.filter((m) => m.chief).length,
      validators: data.members.filter((m) => m.validator).length,
      finalValidators: data.members.filter((m) => m.finalValidator).length,
    };
  };

  const roleCounts = countRoles();

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Département - ${data?.label || "Non spécifié"}`}
      description="Informations détaillées du département"
    >
      <ViewGrid>
        <ViewGroup icon={Hash} label="Nom du département">
          <p className="font-semibold">{data?.label || "-"}</p>
        </ViewGroup>
        <ViewGroup icon={Building} label="Statut">
          {getStatusBadge(data?.status)}
        </ViewGroup>
        <ViewGroup icon={FileText} label="Description">
          <p className="font-semibold">
            {data?.description || "Aucune description"}
          </p>
        </ViewGroup>
        <ViewGroup icon={Users} label="Total des membres">
          <p className="font-semibold">{roleCounts.total}</p>
        </ViewGroup>
        <ViewGroup icon={ShieldCheck} label="Chefs de département">
          <p className="font-semibold">{roleCounts.chiefs}</p>
        </ViewGroup>
        <ViewGroup icon={CheckCircle} label="Validateurs">
          <p className="font-semibold">{roleCounts.validators}</p>
        </ViewGroup>
        <ViewGroup icon={Shield} label="Derniers validateurs">
          <p className="font-semibold">{roleCounts.finalValidators}</p>
        </ViewGroup>
        <ViewGroup icon={Calendar} label="Créé le">
          <p className="font-semibold">{formatDate(data?.createdAt)}</p>
        </ViewGroup>
        <ViewGroup icon={LucideCalendar} label="Dernière modification">
          <p className="font-semibold">{formatDate(data?.updatedAt)}</p>
        </ViewGroup>
        <ViewGroup
          icon={LucideUser}
          label={`Liste des membres (${roleCounts.total})`}
          wide
        >
          {data?.members && data.members.length > 0 ? (
            <div className="mt-1 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {data.members.map((member, index) => (
                <div
                  key={member.id || index}
                  className="flex flex-col gap-2 rounded-lg border border-border-default p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
                      <User className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {member.label || "Membre sans nom"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {`ID utilisateur : ${member.userId}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.chief && (
                      <Badge variant="purple">
                        <ShieldCheck />
                        {"Chef de département"}
                      </Badge>
                    )}
                    {member.validator && (
                      <Badge variant="success">
                        <CheckCircle />
                        {"Validateur"}
                      </Badge>
                    )}
                    {member.finalValidator && (
                      <Badge variant="destructive">
                        <Shield />
                        {"Dernier validateur"}
                      </Badge>
                    )}
                    {!member.chief &&
                      !member.validator &&
                      !member.finalValidator && (
                        <Badge variant="outline">{"Membre standard"}</Badge>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="italic text-gray-600">
              {"Aucun membre dans ce département. Ajoutez des membres via le formulaire de modification."}
            </p>
          )}
        </ViewGroup>
      </ViewGrid>
    </ViewDialog>
  );
}
