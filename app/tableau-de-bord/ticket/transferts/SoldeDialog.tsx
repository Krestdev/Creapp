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
import { cn, XAF } from "@/lib/utils";
import { bankQ } from "@/queries/bank";
import { BANK_TYPES } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export type Justificatif = {
  type: "file" | "image";
  nom: string;
  taille: number;
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
  moyen?: string;
  statut?: "pending" | "approved" | "rejected" | "in-review";
  delai?: string;
  lieu?: string;
  emetteur?: string;
  creeLe?: string;
  modifieLe?: string;
  justificatif?: Justificatif[];
  condition?: string;
  besoin?: Besoin[];
}

interface ApproveTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GRADIENTS = [
  "from-purple-500 to-fuchsia-500",
  "from-indigo-500 to-sky-400",
  "from-orange-400 to-pink-500",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-orange-400",
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-blue-500",
  "from-amber-400 to-red-500",
];

const AMOUNT = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

function shuffle<T>(items: Array<T>): Array<T> {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function SoldeDialog({ open, onOpenChange }: ApproveTicketProps) {
  const getBanks = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  // Ordre des couleurs tiré au hasard une seule fois : stable entre les rendus
  const [palette] = useState(() => shuffle(GRADIENTS));
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
          {/* Liste détaillée des comptes */}
          <div className="grid grid-cols-1 @min-[480px]/dialog:grid-cols-2 gap-4 p-1">
            {getBanks.isSuccess &&
              getBanks.data.data
                .filter((c) => !!c.type)
                .map((bank, index) => (
                  <div
                    key={bank.id}
                    className={cn(
                      "relative overflow-hidden rounded-xl p-5 text-white shadow-lg bg-linear-to-br flex flex-col gap-3 min-h-40",
                      palette[index % palette.length],
                    )}
                  >
                    <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
                    <span className="pointer-events-none absolute -bottom-16 -left-8 size-44 rounded-full bg-white/10" />
                    <div className="relative">
                      <h3 className="text-lg font-semibold leading-tight">
                        {bank.label}
                      </h3>
                      <p className="text-xs text-white/70 flex items-center gap-2">
                        <span>
                          {BANK_TYPES.find((t) => t.value === bank.type)
                            ?.name ?? bank.type}
                        </span>
                        {bank.accountNumber && (
                          <>
                            <span className="h-3 w-px bg-white/50" />
                            <span>{bank.accountNumber}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="relative flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl font-semibold tracking-tight">
                        {AMOUNT.format(bank.balance)}
                      </span>
                      <span className="text-sm text-white/80">{"FCFA"}</span>
                      <span className="text-xs text-white/70">
                        {"Disponible"}
                      </span>
                    </div>
                    {bank.tempAccount && (
                      <p className="relative text-xs text-white/70 mt-auto">
                        {`${XAF.format(bank.balance + bank.tempAccount.balance)} réel`}
                      </p>
                    )}
                  </div>
                ))}
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
