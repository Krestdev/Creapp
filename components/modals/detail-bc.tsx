"use client";
import { ViewDialog, ViewGrid, ViewGroup } from "@/components/ds/view-dialog";
import { Badge } from "@/components/ui/badge";
import { XAF } from "@/lib/utils";
import { commandRqstQ } from "@/queries/commandRqstModule";
import { BonsCommande } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  CircleDollarSign,
  FileQuestion,
  LucideCalendar,
  LucideCheckCheck,
  LucideFlag,
  LucideInfo,
  LucideMapPin,
  LucideWallet,
  LucideX,
} from "lucide-react";

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

interface DetailBCProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: BonsCommande | null;
}

export function DetailBC({ open, onOpenChange, data }: DetailBCProps) {
  const {
    data: devis,
    isSuccess,
    // isLoading,
  } = useQuery({ queryKey: ["commands"], queryFn: commandRqstQ.getAll });
  if (!data || !isSuccess) return null;

  const devisTitle = devis?.data.find(
    (devis) => devis.id === data.deviId
  )?.title;

  const priorityVariant =
    data.priority === "high"
      ? "orange"
      : data.priority === "medium"
        ? "blue"
        : data.priority === "urgent"
          ? "destructive"
          : "default";
  const priorityLabel =
    data.priority === "high"
      ? "Haute"
      : data.priority === "medium"
        ? "Moyenne"
        : data.priority === "urgent"
          ? "Urgente"
          : "Normale";
  const approved = data.status === "APPROVED";

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Bon de commande - ${devisTitle ?? ""}`}
      description="Informations relatives au bon de commande"
    >
      <ViewGrid>
        <ViewGroup icon={CircleDollarSign} label="Montant total">
          <p className="font-semibold">{XAF.format(data.amountBase)}</p>
        </ViewGroup>
        <ViewGroup icon={LucideWallet} label="Moyen de paiement">
          <p className="font-semibold">{data.paymentMethod}</p>
        </ViewGroup>
        <ViewGroup icon={LucideInfo} label="Priorité">
          <Badge variant={priorityVariant}>
            <LucideFlag />
            {priorityLabel}
          </Badge>
        </ViewGroup>
        <ViewGroup icon={FileQuestion} label="Statut">
          <Badge variant={approved ? "success" : "destructive"}>
            {approved ? <LucideCheckCheck /> : <LucideX />}
            {approved ? "Accepté" : "Rejeté"}
          </Badge>
        </ViewGroup>
        <ViewGroup icon={LucideMapPin} label="Lieu de livraison">
          <p className="font-semibold">{data.deliveryLocation}</p>
        </ViewGroup>
        <ViewGroup icon={Calendar} label="Délai de livraison">
          <p className="font-semibold">
            {format(data.deliveryDelay, "PPP", { locale: fr })}
          </p>
        </ViewGroup>
        <ViewGroup icon={LucideCalendar} label="Créé le">
          <p className="font-semibold">
            {format(data.createdAt, "PPP", { locale: fr })}
          </p>
        </ViewGroup>
        <ViewGroup icon={LucideCalendar} label="Modifié le">
          <p className="font-semibold">
            {format(data.updatedAt, "PPP", { locale: fr })}
          </p>
        </ViewGroup>
      </ViewGrid>
    </ViewDialog>
  );
}
