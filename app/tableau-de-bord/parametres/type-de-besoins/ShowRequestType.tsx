"use client";

import { ViewDrawer, ViewGrid, ViewGroup } from "@/components/ds/view-drawer";
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
    <ViewDrawer
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Type de besoin"
      title={data?.label ?? ""}
      description="Consultez les informations associées au type de besoin"
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
    </ViewDrawer>
  );
}
