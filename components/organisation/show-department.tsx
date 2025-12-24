"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  LucideInfo,
  LucideUser,
  LucideUsers,
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
        return <Badge className="bg-green-500">Actif</Badge>;
      case "inactive":
        return <Badge className="bg-red-500">Inactif</Badge>;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0">
        {/* Header avec fond bordeaux */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Building className="h-5 w-5" />
            {`Département: ${data?.label || "Non spécifié"}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Informations détaillées du département
          </p>
          <div className="absolute right-6 top-6">
            {getStatusBadge(data?.status)}
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LucideInfo className="h-5 w-5" />
                Informations générales
              </h3>

              {/* Nom du département */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Nom du département
                  </p>
                  <p className="font-semibold">{data?.label || "-"}</p>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-semibold">
                    {data?.description || "Aucune description"}
                  </p>
                </div>
              </div>

              {/* Date de création */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Créé le</p>
                  <p className="font-semibold">{formatDate(data?.createdAt)}</p>
                </div>
              </div>

              {/* Dernière modification */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <LucideCalendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Dernière modification
                  </p>
                  <p className="font-semibold">{formatDate(data?.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Statistiques des membres */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LucideUsers className="h-5 w-5" />
                Effectif du département
              </h3>

              {/* Total des membres */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total des membres
                      </p>
                      <p className="text-2xl font-bold">{roleCounts.total}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition des rôles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-1.5 rounded-full">
                      <ShieldCheck className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm">Chefs de département</span>
                  </div>
                  <Badge variant="secondary">{roleCounts.chiefs}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-1.5 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm">Validateurs</span>
                  </div>
                  <Badge variant="secondary">{roleCounts.validators}</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-1.5 rounded-full">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="text-sm">Derniers validateurs</span>
                  </div>
                  <Badge variant="secondary">
                    {roleCounts.finalValidators}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des membres */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <LucideUser className="h-5 w-5" />
              Liste des membres ({roleCounts.total})
            </h3>

            {data?.members && data.members.length > 0 ? (
              <div className="space-y-3 max-h-64 pr-2">
                {data.members.map((member, index) => (
                  <div
                    key={member.id || index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-gray-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.label || "Membre sans nom"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID Utilisateur: {member.userId}
                            </p>
                          </div>
                        </div>

                        {/* Badges des rôles */}
                        <div className="flex flex-wrap gap-2 ml-12">
                          {member.chief && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Chef de département
                            </Badge>
                          )}
                          {member.validator && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Validateur
                            </Badge>
                          )}
                          {member.finalValidator && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                              <Shield className="h-3 w-3 mr-1" />
                              Dernier validateur
                            </Badge>
                          )}
                          {!member.chief &&
                            !member.validator &&
                            !member.finalValidator && (
                              <Badge variant="outline">Membre standard</Badge>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Aucun membre dans ce département
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez des membres via le formulaire de modification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0 shrink-0">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
