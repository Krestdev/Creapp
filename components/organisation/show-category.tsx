"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  ChevronRight,
  FolderTree,
  Hash,
  Info,
  LucideCalendar,
  LucideCheckCircle,
  LucideFileText,
  LucideInfo,
  LucideShieldCheck,
  LucideUser,
  ShieldCheck,
  Tag,
  Users,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ShowCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Category | null;
}

export function ShowCategory({ open, onOpenChange, data }: ShowCategoryProps) {
  const [validatorStats, setValidatorStats] = useState<{
    total: number;
    positions: Record<number, number>;
    maxPosition: number;
    groupedByPosition: Record<
      number,
      Array<{
        id?: number;
        userId: number;
        rank: number;
        user?: User;
      }>
    >;
  }>({
    total: 0,
    positions: {},
    maxPosition: 0,
    groupedByPosition: {},
  });

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPP à HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  // Calculer les statistiques des validateurs
  useEffect(() => {
    if (data?.validators) {
      const positions: Record<number, number> = {};
      const groupedByPosition: Record<
        number,
        Array<{
          id?: number;
          userId: number;
          rank: number;
          user?: User;
        }>
      > = {};

      data.validators.forEach((validator) => {
        const position = validator.rank;
        positions[position] = (positions[position] || 0) + 1;

        if (!groupedByPosition[position]) {
          groupedByPosition[position] = [];
        }
        groupedByPosition[position].push(validator);
      });

      const positionsArray = Object.keys(positions).map(Number);
      const maxPosition =
        positionsArray.length > 0 ? Math.max(...positionsArray) : 0;

      setValidatorStats({
        total: data.validators.length,
        positions,
        maxPosition,
        groupedByPosition,
      });
    } else {
      setValidatorStats({
        total: 0,
        positions: {},
        maxPosition: 0,
        groupedByPosition: {},
      });
    }
  }, [data]);

  // Fonction pour obtenir le nom d'un utilisateur
  //   const getUserName = (userId: number) => {
  //     // Si les validateurs ont les informations utilisateur incluses
  //     const validator = data?.validators?.find(v => v.userId === userId);
  //     return validator?.user?.name || `Utilisateur #${userId}`;
  //   };

  // Fonction pour obtenir l'email d'un utilisateur

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] w-full max-h-[90vh] p-0 gap-0">
        {/* Header avec fond bordeaux */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {`Catégorie: ${data?.label || "Non spécifiée"}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Informations détaillées de la catégorie
          </p>
        </DialogHeader>

        {/* Contenu */}
        <div className="p-6 space-y-6 flex-1 overflow-auto">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LucideInfo className="h-5 w-5" />
                Informations générales
              </h3>

              {/* Nom de la catégorie */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Nom de la catégorie
                  </p>
                  <p className="font-semibold text-lg">{data?.label || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-semibold">
                    {data?.description ? data.description : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne droite - Statistiques des validateurs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LucideCheckCircle className="h-5 w-5" />
                Chaîne de validation
              </h3>

              {/* Total des validateurs */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total des validateurs
                      </p>
                      <p className="text-2xl font-bold">
                        {validatorStats.total}
                      </p>
                    </div>
                  </div>
                  {validatorStats.maxPosition > 0 && (
                    <Badge
                      variant="outline"
                      className="text-blue-700 border-blue-300"
                    >
                      Positions: {validatorStats.maxPosition}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
              {/* Résumé des positions */}
            {validatorStats.total > 0 ? (
                <div className="space-y-3 col-span-2">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Configuration de validation
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((position) => {
                      const count = validatorStats.positions[position] || 0;
                      const isActive = position <= validatorStats.maxPosition;
                      const isLast = position === validatorStats.maxPosition;

                      return (
                        <div
                          key={position}
                          className={`flex flex-col items-center p-3 rounded-lg border ${
                            isActive
                              ? isLast
                                ? "bg-red-50 border-red-200"
                                : "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                              isActive
                                ? isLast
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {position}
                          </div>
                          <span className="text-xs mt-2 text-center">
                            {isLast ? "Dernier" : `Position ${position}`}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {count} validateur{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Indicateur de progression */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Début du processus
                      </span>
                      <span className="text-muted-foreground">
                        Validation finale
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{
                          width:
                            validatorStats.maxPosition > 0
                              ? `${(validatorStats.maxPosition / 3) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Position 1</span>
                      <span>Position {validatorStats.maxPosition || 1}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg bg-gray-50 col-span-2">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun validateur configuré</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Les besoins de cette catégorie ne pourront pas être validés
                  </p>
                </div>
              )}
          </div>

          {/* Liste détaillée des validateurs par position */}
          {validatorStats.total > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <LucideUser className="h-5 w-5" />
                Détail des validateurs
              </h3>

              <div className="space-y-4">
                {Object.keys(validatorStats.groupedByPosition)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((positionStr) => {
                    const position = parseInt(positionStr);
                    const validators =
                      validatorStats.groupedByPosition[position];
                    const isLast = position === validatorStats.maxPosition;

                    return (
                      <div
                        key={position}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div
                          className={`p-4 ${
                            isLast
                              ? "bg-red-50 border-b"
                              : "bg-green-50 border-b"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                                  isLast
                                    ? "bg-red-100 text-red-600"
                                    : "bg-green-100 text-green-600"
                                }`}
                              >
                                {position}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {isLast
                                    ? "Dernier validateur"
                                    : `Validateur position ${position}`}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {validators.length} personne
                                  {validators.length > 1 ? "s" : ""}
                                  {isLast && " - Validation finale"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                isLast
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {isLast ? "Final" : `Étape ${position}`}
                            </Badge>
                          </div>
                        </div>

                        <div className="divide-y">
                          {validators.map((validator, index) => (
                            <div
                              key={validator.id || index}
                              className="p-4 hover:bg-gray-50"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <LucideUser className="h-4 w-4 text-gray-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium">
                                        {/* {getUserName(validator.userId)} */}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {/* {getUserEmail(validator.userId)} */}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">
                                        ID: {validator.userId}
                                      </p>
                                      {validator.id && (
                                        <p className="text-xs text-muted-foreground">
                                          Ref: {validator.id}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      User ID: {validator.userId}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Rank: {validator.rank}
                                    </Badge>
                                    {validator.id && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Validator ID: {validator.id}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Légende */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Validateur intermédiaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Dernier validateur (validation finale)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Premier validateur (début du processus)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
