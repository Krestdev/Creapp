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
  Users,
  UserPlus,
  Calendar,
  X,
  LucideScrollText,
  UserRound,
  CalendarFold,
  CircleDollarSign,
  LucideWallet,
  LucideFlag,
  LucideInfo,
  LucideCheckCheck,
  LucideX,
  LucideMapPin,
  FileQuestion,
  LucideSquareUserRound,
  LucideFile,
  LucideUserRound,
  LucideCalendarFold,
  LucideCalendar,
} from "lucide-react";
import { XAF } from "@/lib/utils";
import Link from "next/link";
import { TicketsData } from "@/types/types";

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
  description: string;
  action: () => void;
  buttonTexts: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TicketsData | undefined;
}

export function ApproveTicket({
  title,
  description,
  action,
  buttonTexts,
  open,
  onOpenChange,
  data,
}: ApproveTicketProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] w-full overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.bonDeCommande}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{title}</p>
        </DialogHeader>

        {/* Content */}
        <p className="text-[#2F2F2F] w-full px-4 italic">{description}</p>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <Button onClick={action} className="bg-[#16A34A] text-white">
            {buttonTexts}
          </Button>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
