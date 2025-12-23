import { Paiement } from "@/app/tableau-de-bord/(sales)/commande/paiements/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, XAF } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarFold,
  DollarSign,
  Hash,
  Info,
  LucideFile,
  MessageCircleQuestion,
  SquareUserRound,
  UserCircle,
  Wallet
} from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: Paiement;
}

// Fonction pour déterminer les styles du badge de priorité
const getPrioriteStyles = (priorite: string) => {
  switch (priorite.toLowerCase()) {
    case "élevée":
    case "haute":
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800";
    case "moyenne":
    case "normale":
    case "standard":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800";
    case "basse":
    case "faible":
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
  }
};

// Fonction pour déterminer les styles du badge de statut
const getStatutStyles = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "validé":
    case "approuvé":
    case "payé":
    case "terminé":
    case "completed":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
    case "en attente":
    case "pending":
    case "en cours":
    case "en traitement":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800";
    case "rejeté":
    case "refusé":
    case "annulé":
    case "échoué":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800";
    case "brouillon":
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800";
  }
};

const DetailPaiement = ({ open, onOpenChange, data }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]! max-h-[80vh] p-0 gap-0 overflow-hidden border-none flex flex-col">
        {/* Header with burgundy background - FIXED */}
        <div className="shrink-0 sticky top-0 z-10">
          <DialogHeader className="bg-linear-to-r from-[#8B1538] to-[#700032] text-white p-6 m-4 rounded-lg pb-8">
            <DialogTitle className="text-xl font-semibold text-white">
              {data.bonDeCommande}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">{`Facture ${data.reference}`}</p>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-3 pb-4">
            {/* Reference */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Hash className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Référence"}</p>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                >
                  {data.reference}
                </Badge>
              </div>
            </div>

            {/* Fournisseur */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <SquareUserRound className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Fournisseur"}</p>
                <p className="text-black font-semibold text-sm">
                  {data.fournisseur}
                </p>
              </div>
            </div>

            {/* Montant */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Montant"}</p>
                <p className="text-black font-semibold text-sm">
                  {XAF.format(data.montant)}
                </p>
              </div>
            </div>

            {/* Moyen */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Moyen de paiement"}
                </p>
                <p className="text-black font-semibold text-sm">{data.moyen}</p>
              </div>
            </div>

            {/* Priorité */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Info className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Priorité"}</p>
                <Badge
                  variant="outline"
                  className={cn(getPrioriteStyles(data.priorite))}
                >
                  {data.priorite}
                </Badge>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <MessageCircleQuestion className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Statut"}</p>
                <Badge
                  variant="outline"
                  className={cn(getStatutStyles(data.statut))}
                >
                  {data.statut}
                </Badge>
              </div>
            </div>

            {/* Date limite */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <CalendarFold className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Date limite"}</p>
                <p className="text-black font-semibold text-sm">
                  {format(data.dueDate, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Justificatifs */}
            <div className="w-full flex flex-row items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-[#E4E4E7] size-10">
                <LucideFile size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-[#52525B]">{"Justificatifs"}</p>
                <div className="flex gap-1.5 items-center">
                  {data?.proof ? (
                    <>
                      <img
                        src="/images/pdf.png"
                        alt="justificatif"
                        className="h-8 w-auto aspect-square"
                      />
                      <div>
                        <p className="text-[#2F2F2F] text-[12px] font-medium">
                          {"Document justificatif"}
                        </p>
                        <p className="text-[#A1A1AA] text-[12px]">
                          {true
                            ? `${(20 / 1024).toFixed(1)} ko`
                            : "Taille inconnue"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun justificatif</p>
                  )}
                </div>
              </div>
            </div>

            {/* Initié par */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Initié par"}</p>
                <p className="text-black font-semibold text-sm">
                  {"Bonfou Moussa"}
                </p>
              </div>
            </div>

            {/* Date creation */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Date de création"}
                </p>
                <p className="text-black font-semibold text-sm">
                  {format(data.createdAt, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Date modification */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Date de modification"}
                </p>
                <p className="text-black font-semibold text-sm">
                  {format(data.updatedAt, "PPP", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons - FIXED */}
        <div className="shrink-0 sticky bottom-0 z-10">
          <div className="flex justify-end gap-3 p-6">
            <Button variant={"primary"} onClick={() => onOpenChange(false)}>
              {"Modifier"}
            </Button>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              {"Fermer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailPaiement;