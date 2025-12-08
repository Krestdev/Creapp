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
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { TicketsData } from "@/types/types";
import { fr } from "date-fns/locale";

interface DetailTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TicketsData | undefined;
}

export function DetailTicket({ open, onOpenChange, data }: DetailTicketProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        {/* Header avec fond bordeaux - FIXE */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative shrink-0">
          <DialogTitle className="text-xl font-semibold text-white">
            {/* {data!.label} */}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{"Details du besoin"}</p>
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
                <p className="text-sm text-muted-foreground mb-1">
                  {"Référence"}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
                >
                  {data?.reference}
                </Badge>
              </div>
            </div>

            {/* Projet - MAJ */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{"Montant"}</p>
                <p className="font-semibold">
                  {"750 000 FCFA"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Moyen de paiement"}
                </p>
                <p className="text-sm">{"Moyen de paiement"}</p>
              </div>
            </div>

            {/* Catégorie - MAJ */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <FolderTree className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Compte Payeur"}
                </p>
                <p className="font-semibold">
                  {"Compte Payeur"}
                </p>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{"Statut"}</p>
                <Badge>
                  {"Statut"}
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
                  {"Fournisseur"}
                </p>
                <p className="text-sm">{"Moyen de paiement"}</p>
              </div>
            </div>

            {/* Date de création */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Créé le"}
                </p>
                <p className="font-semibold">
                  {/* {format(data?.createdAt!, "PPP", { locale: fr })} */}
                </p>
              </div>
            </div>

            {/* Date de modification */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {"Modifié le"}
                </p>
                <p className="font-semibold">
                  {/* {format(data?.updatedAt!, "PPP", { locale: fr })} */}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons du footer - FIXE */}
        <div className="flex gap-3 p-6 pt-0 shrink-0">
          <Button
            onClick={() => {}}
            className="flex-1 bg-[#003D82] hover:bg-[#002D62] text-white"
            disabled={true}
          >
            {"Payer"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
