"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  FileText,
  FolderOpen,
  FolderTree,
  Hash,
  User,
  Building,
  Receipt,
} from "lucide-react";
import { PaymentRequest } from "@/types/types";

interface DetailTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PaymentRequest | undefined;
}

export function DetailTicket({ open, onOpenChange, data }: DetailTicketProps) {
  // Fonction pour formater le montant
  const formatMontant = (montant: number | undefined) => {
    if (!montant) return "0 FCFA";
    return `${montant.toLocaleString("fr-FR")} FCFA`;
  };

  // Fonction pour obtenir la couleur du badge selon la priorité
  const getPrioriteColor = (priorite: string | undefined) => {
    switch (priorite) {
      case "urgent":
        return "bg-red-100 text-red-900 hover:bg-red-100 dark:bg-red-900 dark:text-red-100";
      case "high":
        return "bg-orange-100 text-orange-900 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-100";
      case "medium":
        return "bg-yellow-100 text-yellow-900 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-900 hover:bg-green-100 dark:bg-green-900 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  // Fonction pour obtenir la couleur du badge selon l'état
  const getStateColor = (state: string | undefined) => {
    switch (state) {
      case "paid":
        return "bg-green-100 text-green-900 hover:bg-green-100 dark:bg-green-900 dark:text-green-100";
      case "approved":
        return "bg-blue-100 text-blue-900 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100";
      case "pending":
        return "bg-yellow-100 text-yellow-900 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100";
      case "gost":
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
      default:
        return "bg-gray-100 text-gray-900 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  // Fonction pour traduire les états
  const translateState = (state: string | undefined) => {
    switch (state) {
      case "paid":
        return "Payé";
      case "approved":
        return "Approuvé";
      case "pending":
        return "En attente";
      case "gost":
        return "Brouillon";
      default:
        return state || "Inconnu";
    }
  };

  // Fonction pour traduire les priorités
  const translatePriorite = (priorite: string | undefined) => {
    switch (priorite) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Élevée";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
      default:
        return priorite || "Non défini";
    }
  };

  // Fonction pour traduire les moyens de paiement
  const translateMoyenPaiement = (moyen: string | undefined) => {
    switch (moyen?.toLowerCase()) {
      case "virement":
        return "Virement bancaire";
      case "cheque":
        return "Chèque";
      case "especes":
        return "Espèces";
      case "carte":
        return "Carte bancaire";
      default:
        return moyen || "Non spécifié";
    }
  };

  // Fonction pour traduire les moyens de paiement
  const typePaiment = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case "FAC":
        return "Facilitation";
      case "RH":
        return "Resource Humain";
      case "SPECIAL":
        return "Special";
      case "PURCHASE":
        return "Normal";
      default:
        return "diver";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            Détails du ticket de paiement
          </DialogTitle>
          <h4 className="text-sm text-white/80 mt-1">
            {typePaiment(data?.type)} : {data?.reference || "N/A"}
          </h4>
          <p className="text-sm text-white/80 mt-1">
            Référence : {data?.reference || "N/A"}
          </p>
        </DialogHeader>

        {/* Contenu - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 pb-4">
            {/* Référence */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Hash className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Référence</p>
                <Badge
                  variant="secondary"
                  className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
                >
                  {data?.reference || "N/A"}
                </Badge>
              </div>
            </div>

            {/* Montant */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Montant</p>
                <p className="font-semibold text-lg">
                  {formatMontant(data?.price || 0)}
                </p>
              </div>
            </div>

            {/* Fournisseur */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Building className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Fournisseur
                </p>
                {/* <p className="font-semibold">{data?.fournisseur || "N/A"}</p> */}
              </div>
            </div>

            {/* Bon de commande */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Bon de commande
                </p>
                {/* <p className="text-sm">{data?.bonDeCommande || "N/A"}</p> */}
              </div>
            </div>

            {/* Moyen de paiement */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Moyen de paiement
                </p>
                <p className="text-sm">
                  {/* {translateMoyenPaiement(data?.moyenPaiement)} */}
                </p>
              </div>
            </div>

            {/* Compte Payeur */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderTree className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Compte Payeur
                </p>
                {/* <p className="font-semibold">{data?.comptePayeur || "N/A"}</p> */}
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Statut</p>
                <Badge className={getStateColor(data?.status)}>
                  {translateState(data?.status)}
                </Badge>
              </div>
            </div>

            {/* Priorité */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Priorité"}
                </p>
                <Badge className={getPrioriteColor(data?.priority)}>
                  {translatePriorite(data?.priority)}
                </Badge>
              </div>
            </div>

            {/* Date de création */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Créé le</p>
                <p className="font-semibold">
                  {data?.createdAt
                    ? format(new Date(data.createdAt), "PPP", { locale: fr })
                    : "N/A"}
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
                  {data?.updatedAt
                    ? format(new Date(data.updatedAt), "PPP", { locale: fr })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons du footer - FIXE */}
        <div className="flex gap-3 p-6 pt-0 shrink-0">
          {/* <Button
            onClick={() => {
              // Logique de paiement
              console.log("Paiement du ticket:", data?.id);
            }}
            className="flex-1 bg-[#003D82] hover:bg-[#002D62] text-white"
            disabled={!data || data.status === "paid"}
          >
            {data?.status === "paid" ? "Déjà payé" : "Payer"}
          </Button> */}
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
