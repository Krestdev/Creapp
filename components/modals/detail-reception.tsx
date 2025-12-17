import { Reception } from "@/app/tableau-de-bord/commande/receptions/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarFold,
  Hash,
  LucideCheck,
  LucideFile,
  LucideFileText,
  LucideX,
  MessageCircleQuestion,
  ScrollText,
  SquareUserRound,
  UserCircle,
} from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: Reception;
  action: () => void;
}

// Fonction de traduction des statuts
const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Statuts en anglais vers français
    'pending': 'En attente',
    'completed': 'Terminé',
    'in_progress': 'En cours',
    'draft': 'Brouillon',
    'cancelled': 'Annulé',
    'rejected': 'Rejeté',
    'approved': 'Approuvé',
    'paid': 'Payé',
    'failed': 'Échoué',
    'validated': 'Validé',
    
    // Ajoutez d'autres correspondances si nécessaire
    'pending_validation': 'En attente de validation',
    'pending_approval': 'En attente d\'approbation',
    'pending_payment': 'En attente de paiement',
    'partially_completed': 'Partiellement terminé',
    'in_transit': 'En transit',
    'delivered': 'Livré',
    'received': 'Reçu',
    'processing': 'En traitement',
    'on_hold': 'En suspens',
    'refunded': 'Remboursé',
    'expired': 'Expiré',
    'archived': 'Archivé',
  };

  // Vérifie si le statut existe dans la map, sinon retourne le statut original
  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || status;
};

// Fonction pour déterminer les styles du badge de statut
const getStatutStyles = (statut: string) => {
  const translatedStatus = translateStatus(statut).toLowerCase();
  
  switch (translatedStatus) {
    case "validé":
    case "approuvé":
    case "payé":
    case "terminé":
    case "livré":
    case "reçu":
    case "completé":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800";
    case "en attente":
    case "en cours":
    case "en traitement":
    case "en suspens":
    case "en transit":
    case "en attente de validation":
    case "en attente d'approbation":
    case "en attente de paiement":
    case "partiellement terminé":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800";
    case "rejeté":
    case "refusé":
    case "annulé":
    case "échoué":
    case "expiré":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800";
    case "brouillon":
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800";
  }
};

const DetailReception = ({ open, onOpenChange, data, action }: Props) => {
  // Traduire le statut pour l'affichage
  const translatedStatus = translateStatus(data.statut);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]! max-h-[80vh] p-0 gap-0 overflow-hidden border-none flex flex-col">
        {/* Header with burgundy background - FIXED */}
        <div className="shrink-0 sticky top-0 z-10">
          <DialogHeader className="bg-linear-to-r from-[#8B1538] to-[#700032] text-white p-6 m-4 rounded-lg pb-8">
            <DialogTitle className="text-xl font-semibold text-white">
              {data.bonDeCommande}
            </DialogTitle>
            <p className="text-sm text-white/80 mt-1">{`Réception du bon de commande`}</p>
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
                  className="bg-[#F2CFDE] text-[#9E1351]"
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
                  {data.provider}
                </p>
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
                  {translatedStatus}
                </Badge>
              </div>
            </div>

            {/* Reference */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <LucideFileText className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Référence du Bon"}
                </p>
                <Badge
                  variant="outline"
                  className="bg-[#F4F4F5] text-[#2F2F2F] border-[#E4E4E7] "
                >
                  {data.refBC}
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

            {/* Date reception */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {"Date reception"}
                </p>
                <p className="text-black font-semibold text-sm">
                  {format(data.receptionDate, "PPP", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Livrables */}
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[#E4E4E7] h-10 w-10 rounded-full flex items-center justify-center">
                <ScrollText className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{"Livrables"}</p>
                <div className="flex flex-col gap-1">
                  {data.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-1.5"
                    >
                      <Badge
                        variant={
                          item.status === true ? "success" : "destructive"
                        }
                        className="px-1 rounded-[6px]"
                      >
                        {item.status === true ? (
                          <LucideCheck className="text-green-500 size-3.5" />
                        ) : (
                          <LucideX className="text-red-500 size-3.5" />
                        )}
                      </Badge>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                  ))}
                </div>
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
            <Button variant={"primary"} onClick={action}>
              {"Compléter"}
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

export default DetailReception;