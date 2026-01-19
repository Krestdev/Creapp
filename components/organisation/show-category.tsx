"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userQ } from "@/queries/baseModule";
import { Category, User } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, FileText, Hash, Link, Tag } from "lucide-react";
import { useEffect, useState } from "react";

interface ShowCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Category | null;
}

export function ShowCategory({ open, onOpenChange, data }: ShowCategoryProps) {
  const usersData = useQuery({
    queryKey: ["users"],
    queryFn: async () => userQ.getAll(),
  });

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

  // Calculer les statistiques des ascendants
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

  // Fonction pour obtenir l'email d'un utilisateur

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[760px]! max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2 uppercase">
            {`Catégorie - ${data?.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations détaillées de la catégorie"}
          </p>
        </DialogHeader>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* Informations générales */}
          <div className="flex flex-col gap-6">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-4">
              {/* Nom de la catégorie */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Hash className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Nom de la catégorie
                  </p>
                  <p className="font-semibold text-lg uppercase">
                    {data?.label || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {"Description"}
                  </p>
                  <p className="first-letter:uppercase">
                    {data?.description ? data.description : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {validatorStats.total > 0 ? (
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Link className="h-5 w-5 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  {"Chaine d'approbation"}
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(validatorStats.groupedByPosition)
                  // convertir la clé en number
                  .map(([positionStr, validators]) => {
                    const position = Number(positionStr);

                    if (!validators || validators.length === 0) return null;

                    const isActive = position <= validatorStats.maxPosition;
                    const isLast = position === validatorStats.maxPosition;

                    const firstValidatorName =
                      usersData.data?.data?.find(
                        (u) => u.id === validators[0].userId,
                      )?.firstName +
                        " " +
                        usersData.data?.data?.find(
                          (u) => u.id === validators[0].userId,
                        )?.lastName || "Inconnu";

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
                        {/* Cercle position */}
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

                        {/* Label */}
                        <span className="text-xs mt-2 text-center">
                          {isLast ? "Dernier" : `Position ${position}`}
                        </span>

                        {/* Ascendant(s) */}
                        <span className="text-xs text-muted-foreground text-center uppercase">
                          {validators.length === 1 && firstValidatorName}

                          {validators.length > 1 && (
                            <>
                              {firstValidatorName}{" "}
                              <span className="italic">
                                +{validators.length - 1}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border rounded-lg bg-gray-50">
              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">{"Aucun ascendant configuré"}</p>
              <p className="text-sm text-gray-400 mt-1">
                {"Les besoins de cette catégorie ne pourront pas être validés"}
              </p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="w-full flex gap-3 p-6 pt-0 shrink-0">
          <Button
            variant="outline"
            className="bg-transparent ml-auto"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
