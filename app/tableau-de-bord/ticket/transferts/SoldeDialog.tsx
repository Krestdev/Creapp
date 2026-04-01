"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XAF } from "@/lib/utils";
import { bankQ } from "@/queries/bank";
import { useQuery } from "@tanstack/react-query";

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
  statut?: "pending" | "approved" | "rejected" | "in-review";
  delai?: string; // date au format JJ/MM/AAAA
  lieu?: string;
  emetteur?: string;
  creeLe?: string; // date au format JJ/MM/AAAA
  modifieLe?: string; // date au format JJ/MM/AAAA
  justificatif?: Justificatif[];
  condition?: string;
  besoin?: Besoin[];
}

interface ApproveTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SoldeDialog({ open, onOpenChange }: ApproveTicketProps) {
  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  const totalBank = getBanks.data?.data
    .filter((b) => b.type === "BANK")
    .reduce((acc, b) => acc + b.balance, 0);
  const totalCash = getBanks.data?.data
    .filter((b) => b.type === "CASH" || b.type === "CASH_REGISTER")
    .reduce((acc, b) => acc + b.balance, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* Header - FIXE EN HAUT */}
        <DialogHeader variant={"default"}>
          <DialogTitle className="uppercase">
            {"Soldes des comptes"}
          </DialogTitle>
          <DialogDescription>
            {"Consultez les soldes de comptes enregistrés"}
          </DialogDescription>
        </DialogHeader>
        {/* Cartes récapitulatives */}
        <div className="grid grid-cols-1 @min-[640px]/dialog:grid-cols-2 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-primary-100 text-primary-800">
            <div>
              <h3 className="font-medium text-slate-900">{"Total banques"}</h3>
              <p className="text-xl font-semibold">
                {totalBank !== undefined ? XAF.format(totalBank) : "N/A"}
              </p>
            </div>
          </div>
          <div className="shadow flex items-center justify-between p-4 bg-secondary text-white">
            <div>
              <h3 className="font-medium">{"Total caisses"}</h3>
              <p className="text-xl font-semibold">
                {totalCash !== undefined ? XAF.format(totalCash) : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Liste détaillée des comptes */}
            <div className="grid grid-cols-1 @min-[480px]/dialog:grid-cols-2 @min-[640px]/dialog:grid-cols-3 gap-3">
              {getBanks.isSuccess &&
                getBanks.data.data
                  .filter((c) => !!c.type)
                  .map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{bank.label}</h3>
                        <p className="text-sm text-primary font-semibold">
                          {XAF.format(bank.balance)}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Footer - FIXE EN BAS */}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
