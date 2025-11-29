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
  LucideScrollText,
  UserRound,
  CalendarFold,
  CircleDollarSign,
  LucideWallet,
  LucideFlag,
  LucideInfo,
  LucideCheckCheck,
  LucideX,
  LucideMapPin,
  FileQuestion,
  LucideSquareUserRound,
  LucideFile,
  LucideUserRound,
  LucideCalendarFold,
  LucideCalendar,
} from "lucide-react";
import { XAF } from "@/lib/utils";
import Link from "next/link";

export type Justificatif = {
  type: "file" | "image";
  nom: string;
  taille: number; // en Ko ou Mo selon ton choix
};

export type Besoin = {
  title: string;
  prix: number;
  qte: number;
};

export interface BonCommandePaiement {
  id: string;
  reference: string;
  fournisseur: string;
  titre: string;
  montant: number;
  priorite: "low" | "high" | "medium" | "urgent";
  moyen?: string; // ex: "Espece", "Virement", etc.
  statut?: "pending" | "approved" | "rejected" | "in-review"
  delai?: string; // date au format JJ/MM/AAAA
  lieu?: string;
  emetteur?: string;
  creeLe?: string; // date au format JJ/MM/AAAA
  modifieLe?: string; // date au format JJ/MM/AAAA
  justificatif?: Justificatif[];
  condition?: string;
  besoin?: Besoin[];
}

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BonCommandePaiement | null;
}

export function DetailBC({ open, onOpenChange, data }: DetailBCProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.titre}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives à la commande"}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-4 grid grid-cols-2">
          <div className="flex-1 flex flex-col gap-3">
            {/* Reference */}
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

            {/* Created date */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Montant total"}
                </p>
                <p className="font-semibold">{XAF.format(data.montant)}</p>
              </div>
            </div>

            {/* Moyen de paiement */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideWallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Moyen de paiement"}
                </p>
                <p className="font-semibold">{data.moyen}</p>
              </div>
            </div>

            {/* Priorité */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideInfo className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Priorité"}</p>
                <Badge
                  className={` text-white ${
                    data.priorite === "high"
                      ? "bg-[#ff6900]"
                      : data.priorite === "medium"
                      ? "bg-[#2b7fff]"
                      : data.priorite === "urgent"
                      ? "bg-[#fb2c36]"
                      : "bg-[#6a7282]"
                  }`}
                >
                  <LucideFlag />
                  {data.priorite === "high"
                    ? "Haute"
                    : data.priorite === "medium"
                    ? "Moyenne"
                    : data.priorite === "urgent"
                    ? "Urgente"
                    : "Normale"}
                </Badge>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FileQuestion className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Statut"}</p>
                <Badge
                  className={` text-white ${
                    data.statut === "approved"
                      ? "bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]"
                      : "bg-[#FED7D7] border-[#FCA5A5] text-[#DC2626]"
                  }`}
                >
                  {data.statut === "approved" ? (
                    <LucideCheckCheck />
                  ) : (
                    <LucideX />
                  )}
                  {data.statut === "approved" ? "Accepté" : "Rejetté"}
                </Badge>
              </div>
            </div>

            {/* Besoins */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideScrollText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Besoins"}</p>
                <div className="flex flex-col gap-1">
                  {data.besoin?.map((bes, index) => (
                    <div key={index} className="flex flex-col gap-0.5">
                      <p className="text-[14px] font-medium first-letter:uppercase">{bes.title}</p>
                      <p className="text-primary text-[12px] font-medium">
                        {XAF.format(bes.prix) + " (x" + bes.qte + " Pièce)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Délai de livraison */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Délai de livraison"}
                </p>
                <p className="font-semibold">{data.delai}</p>
              </div>
            </div>

            {/* Lieu de livraison */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideMapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Lieu de livraison"}
                </p>
                <p className="font-semibold">{data.lieu}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* Fournisseur */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideSquareUserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Lieu de livraison"}
                </p>
                <p className="font-semibold uppercase">{data.fournisseur}</p>
              </div>
            </div>

            {/* Justificatifs */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideFile className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Justificatifs"}
                </p>

                <div className="flex flex-row gap-3  overflow-auto scrollbar-thin pb-1 w-full">
                  {data.justificatif?.map((just, index) => (
                    <Link
                      href={`lien-vers-le-justificatif/${just.nom}`}
                      key={index}
                      className="flex flex-none flex-row items-center gap-2 bg-white"
                    >
                      <img
                        src={
                          just.type === "file"
                            ? "/images/pdf.png"
                            : "/images/image.png"
                        }
                        alt="File"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="flex flex-col truncate">
                        <p className="text-sm text-[#2F2F2F] truncate">
                          {just.nom}
                        </p>
                        <p className="text-[12px] text-[#A1A1AA]">{`${just.taille} ko`}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Initié par */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideUserRound className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Initié par"}</p>
                <p className="font-semibold">{data.emetteur}</p>
              </div>
            </div>

            {/* Date limite */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideCalendarFold className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Date limite"}</p>
                <p className="font-semibold">{data.creeLe}</p>
              </div>
            </div>

            {/* Créé le */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideCalendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Créé le"}</p>
                <p className="font-semibold">{data.creeLe}</p>
              </div>
            </div>

            {/* Modifié le */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideCalendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Modifié le"}</p>
                <p className="font-semibold">{data.modifieLe}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1">
                <LucideWallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Modifié le"}</p>
                <p className="font-semibold">{data.condition}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button className="bg-[#27272A] hover:bg-[#27272A]/80 text-white">
            {"Apperçu"}
          </Button>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
