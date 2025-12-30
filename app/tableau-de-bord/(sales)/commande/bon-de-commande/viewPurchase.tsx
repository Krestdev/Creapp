"use client";
import { badgeVariants } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BonsCommande, User } from "@/types/types";
import { VariantProps } from "class-variance-authority";
import React from "react";
import BonDeCommandePDF from "./BonDeCommandePDF";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewPurchase({ open, openChange, purchaseOrder, users }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="max-h-[750px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none flex flex-col">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {purchaseOrder.reference}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives aux bons de commande"}
          </p>
        </DialogHeader>

        <BonDeCommandePDF />

        {/* pdf here */}
      </DialogContent>
    </Dialog>
  );
}

export default ViewPurchase;
