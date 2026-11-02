"use client";
import { ActionDialog } from "@/components/ds/action-dialog";
import { CircleCheck, CircleX } from "lucide-react";

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
  title: string;
  subTitle: string;
  description: string;
  action: () => void;
  buttonTexts: string;
  /** Classe de couleur du bouton : un rouge (`bg-red-…`) signale un rejet. */
  buttonColor?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Confirmation d’approbation ou de rejet d’un document, même présentation
 * que `ReasonDialog`. Un `buttonColor` rouge bascule en rejet (ton danger,
 * bouton destructif) ; sinon c’est une approbation.
 */
export function ApproveTicket({
  title,
  subTitle,
  description,
  action,
  buttonTexts,
  buttonColor = "bg-[#16A34A]",
  open,
  onOpenChange,
}: ApproveTicketProps) {
  const isReject = /red/i.test(buttonColor);
  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      tone={isReject ? "danger" : "success"}
      icon={isReject ? CircleX : CircleCheck}
      title={title}
      description={
        <>
          <span className="block font-medium text-text-primary">{subTitle}</span>
          {description}
        </>
      }
      confirmLabel={buttonTexts}
      confirmVariant={isReject ? "destructive" : "default"}
      onConfirm={action}
    />
  );
}
