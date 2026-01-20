import { Badge } from "@/components/ui/badge";
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
import { Bank, BANK_TYPES } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  DollarSign,
  FileIcon,
  HelpCircle,
  IdCardIcon,
  Landmark,
  LucideHash,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  bank: Bank;
}

function ViewBank({ open, openChange, bank }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle className="uppercase">
            {"Compte - " + bank.label}
          </DialogTitle>
          <DialogDescription>{`Informations du compte`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 @min-[540px]/dialog:grid-cols-2">
          {/**Reference */}
          <div className="view-group">
            <span className="view-icon">
              <LucideHash />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Référence"}</p>
              <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
                <p className="text-primary-600 text-sm">{`BA-${bank.id}`}</p>
              </div>
            </div>
          </div>
          {/**Montant */}
          <div className="view-group">
            <span className="view-icon">
              <DollarSign />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Solde du Compte"}</p>
              <p className="font-semibold">{XAF.format(bank.balance)}</p>
            </div>
          </div>
          {/**Method */}
          <div className="view-group">
            <span className="view-icon">
              <Landmark />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Méthode de paiement"}</p>
              <p className="font-semibold">
                {BANK_TYPES.find((p) => p.value === bank.type)?.name ??
                  "Non défini"}
              </p>
            </div>
          </div>
          {/**Status */}
          <div className="view-group">
            <span className="view-icon">
              <HelpCircle />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Statut"}</p>
              <Badge variant={bank.Status ? "success" : "destructive"}>
                {bank.Status ? "Actif" : "Désactivé"}
              </Badge>
            </div>
          </div>
          {/**Infos */}
          <div className="view-group">
            <span className="view-icon">
              <IdCardIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Informations du compte"}</p>
              <div className="space-y-0.5">
                {!!bank.accountNumber && (
                  <p>
                    {"Numéro de compte: "}
                    <span className="font-semibold">{bank.accountNumber}</span>
                  </p>
                )}
                {!!bank.atmCode && (
                  <p>
                    {"Code Guichet: "}
                    <span className="font-semibold">{bank.atmCode}</span>
                  </p>
                )}
                {!!bank.bankCode && (
                  <p>
                    {"Code Banque: "}
                    <span className="font-semibold">{bank.bankCode}</span>
                  </p>
                )}
                {!!bank.key && (
                  <p>
                    {"Clé: "}
                    <span className="font-semibold">{bank.key}</span>
                  </p>
                )}
                {!!bank.phoneNum && (
                  <p>
                    {"Numéro de téléphone: "}
                    <span className="font-semibold">{bank.phoneNum}</span>
                  </p>
                )}
                {!!bank.merchantNum && (
                  <p>
                    {"Numéro marchand: "}
                    <span className="font-semibold">{bank.merchantNum}</span>
                  </p>
                )}
                {!bank.merchantNum &&
                  !bank.accountNumber &&
                  !bank.phoneNum &&
                  !bank.atmCode &&
                  !bank.bankCode &&
                  !bank.key && <p>{"--"}</p>}
              </div>
            </div>
          </div>
          {/**Justificatif */}
          <div className="view-group">
            <span className="view-icon">
              <FileIcon />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Justificatif"}</p>
              {!!bank.justification ? (
                <Link
                  href={`${
                    process.env.NEXT_PUBLIC_API
                  }/${bank.justification}`}
                  target="_blank"
                  className="flex gap-0.5 items-center"
                >
                  <img
                    src="/images/pdf.png"
                    alt="justificatif"
                    className="h-7 w-auto aspect-square"
                  />
                  <p className="text-foreground font-medium">
                    {bank.justification
                      ? "Document justificatif"
                      : "Aucun justificatif"}
                  </p>
                </Link>
              ) : (
                <p className="italic">{"Aucun justificatif"}</p>
              )}
            </div>
          </div>
          {/**Updated at */}
          <div className="view-group">
            <span className="view-icon">
              <Calendar />
            </span>
            <div className="flex flex-col">
              <p className="view-group-title">{"Dernière mise à jour"}</p>
              <p className="font-semibold">
                {format(
                  new Date(bank.updatedAt ?? bank.createdAt),
                  "dd MMMM yyyy, p",
                  {
                    locale: fr,
                  },
                )}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewBank;
