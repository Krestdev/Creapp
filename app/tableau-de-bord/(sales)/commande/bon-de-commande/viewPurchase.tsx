"use client";
import { badgeVariants } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BonsCommande, User } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import React from "react";
import BonDeCommandePDF, {
  bonDeCommande,
} from "./BonDeCommandePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { BonDocument } from "./BonDoc";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewPurchase({ open, openChange, purchaseOrder, users }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="max-h-[750px] max-w-[800px]! p-4 gap-0 overflow-x-hidden border-none flex flex-col">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {purchaseOrder.reference}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives aux bons de commande"}
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <BonDeCommandePDF />
        </div>

        {/* pdf here */}
        <DialogFooter>
          <PDFDownloadLink
            document={<BonDocument doc={bonDeCommande} />}
            fileName={`BonDeCommande_${bonDeCommande.numero}.pdf`}
          >
            {({ loading }) => (
              <Button
                variant={"primary"}
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                {loading ? "Préparation..." : "Télécharger le PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPurchase;
