"use client";
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
import { BonsCommande, Invoice, User } from "@/types/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CalendarFold,
  DollarSign,
  FileIcon,
  HelpCircle,
  LucideHash,
  SquareUser,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { getInvoiceStatusBadge } from "./invoices-table";

interface Props {
  invoice: Invoice;
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchases: Array<BonsCommande>;
  users: Array<User>;
}

// Fonction pour calculer le pourcentage de paiement
function getPaymentProgress(invoice: Invoice): { progress: number; value: number } {
  if (invoice.payment.length === 0) return { progress: 0, value: 0 };
  const values = invoice.payment.map((p) => {
    if (p.status !== "paid") return 0;
    return p.price;
  });
  const value = values.reduce((acc, i) => acc + i, 0);
  return {
    value,
    progress: (value * 100) / invoice.amount,
  };
}

// Fonction pour déterminer le statut basé sur le pourcentage
function getStatusFromProgress(progress: number, originalStatus: Invoice["status"]): Invoice["status"] {
  // Si la facture est annulée, garder le statut CANCELLED
  if (originalStatus === "CANCELLED") return "CANCELLED";
  
  // Si le pourcentage est à 100%, considérer comme payée
  if (progress >= 100) return "PAID";
  
  // Si le pourcentage est entre 0 et 100%, considérer comme impayée (partiellement payée)
  if (progress > 0 && progress < 100) return "UNPAID";
  
  // Sinon, garder le statut original
  return originalStatus;
}

function ViewInvoice({ invoice, open, openChange, purchases, users }: Props) {
  const purchase = purchases.find((p) => p.id === invoice.commandId);
  const files = typeof invoice.proof === "string" ? invoice.proof : "";
  
  // Calculer le pourcentage de paiement
  const paymentProgress = getPaymentProgress(invoice);
  
  // Déterminer le statut réel basé sur le pourcentage
  const actualStatus = getStatusFromProgress(paymentProgress.progress, invoice.status);
  
  // Obtenir le badge correspondant au statut réel
  const statusBadge = getInvoiceStatusBadge(actualStatus);

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`facture - ${invoice.title}`}</DialogTitle>
          <DialogDescription>{`Informations sur la facture de ${purchase?.devi.commandRequest.title ?? invoice.commandId}`}</DialogDescription>
        </DialogHeader>
        {/**Reference */}
        <div className="view-group">
          <span className="view-icon">
            <LucideHash />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Référence"}</p>
            <div className="w-fit bg-primary-100 flex items-center justify-center px-1.5 rounded">
              <p className="text-primary-600 text-sm">
                {invoice.reference || "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/**Status */}
        <div className="view-group">
          <span className="view-icon">
            <HelpCircle />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Statut"}</p>
            <Badge variant={statusBadge.variant}>
              {statusBadge.label}
            </Badge>
            {paymentProgress.progress > 0 && paymentProgress.progress < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                Payé: {XAF.format(paymentProgress.value)} / {XAF.format(invoice.amount)} ({Math.round(paymentProgress.progress)}%)
              </p>
            )}
          </div>
        </div>
        {/**Fournisseur */}
        <div className="view-group">
          <span className="view-icon">
            <SquareUser />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Fournisseur"}</p>
            <p className="font-semibold">
              {purchase?.provider.name ?? "Non défini"}
            </p>
          </div>
        </div>
        {/**Montant */}
        <div className="view-group">
          <span className="view-icon">
            <DollarSign />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Montant"}</p>
            <p className="font-semibold">{XAF.format(invoice.amount)}</p>
          </div>
        </div>
        {/**Montant payé */}
        <div className="view-group">
          <span className="view-icon">
            <DollarSign />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Montant payé"}</p>
            <p className="font-semibold">{XAF.format(paymentProgress.value)}</p>
          </div>
        </div>
        {/**Justificatif */}
        <div className="view-group">
          <span className="view-icon">
            <FileIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Justificatif"}</p>
            <div className="space-y-1">
              {files ? (
                files
                  .split(";")
                  .filter((x) => !!x)
                  .map((proof, index) => (
                    <Link
                      key={index}
                      href={`${process.env.NEXT_PUBLIC_API}/${proof}`}
                      target="_blank"
                      className="flex gap-0.5 items-center"
                    >
                      <img
                        src="/images/pdf.png"
                        alt="preuve"
                        className="h-7 w-auto aspect-square"
                      />
                      <p className="text-foreground font-medium">
                        {"Document de preuve"}
                      </p>
                    </Link>
                  ))
              ) : (
                <p className="italic">{"Aucune preuve jointe"}</p>
              )}
            </div>
          </div>
        </div>
        {/**Date limite */}
        <div className="view-group">
          <span className="view-icon">
            <CalendarFold />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Date limite"}</p>
            <p className="font-semibold">
              {format(new Date(invoice.deadline), "dd MMMM yyyy", {
                locale: fr,
              })}
            </p>
          </div>
        </div>
        {/**Created by */}
        <div className="view-group">
          <span className="view-icon">
            <UserIcon />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Initié par"}</p>
            <p className="font-semibold">
              {users.find((u) => u.id === invoice.userId)?.firstName +
                " " +
                users.find((u) => u.id === invoice.userId)?.lastName ||
                "Non défini"}
            </p>
          </div>
        </div>
        {/**Created at */}
        <div className="view-group">
          <span className="view-icon">
            <Calendar />
          </span>
          <div className="flex flex-col">
            <p className="view-group-title">{"Créé le"}</p>
            <p className="font-semibold">
              {format(new Date(invoice.createdAt), "dd MMMM yyyy à kk:mm", {
                locale: fr,
              })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewInvoice;