"use client";

import { ViewDialog, ViewGrid, ViewGroup } from "@/components/ds/view-dialog";
import { RequestType } from "@/types/types";
import { LucideScrollText, TextQuoteIcon } from "lucide-react";

export type Justificatif = {
  type: "file" | "image";
  nom: string;
  taille: number; // en Ko ou Mo selon ton choix
};

interface ShowRequestTypeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: RequestType | undefined;
}

export function ShowRequestType({
  open,
  onOpenChange,
  data,
}: ShowRequestTypeProps) {
  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Type de besoin - ${data?.label ?? ""}`}
      description="Informations relatives au type de besoin"
    >
      <ViewGrid>
        <ViewGroup icon={LucideScrollText} label="Nom">
          <p className="font-semibold first-letter:uppercase">
            {data?.label || "Non renseigné"}
          </p>
        </ViewGroup>
        <ViewGroup icon={TextQuoteIcon} label="Description">
          <p className="font-semibold first-letter:uppercase">
            {data?.description || "Non renseigné"}
          </p>
        </ViewGroup>
      </ViewGrid>
    </ViewDialog>
  );
}
