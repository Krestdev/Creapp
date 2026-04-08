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
import { BonsCommande, User } from "@/types/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import React from "react";
import { BonDeCommandePDF } from "./BonDeCommandePDF";
import { BonDocument } from "./BonDoc";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewPurchase({ open, openChange, purchaseOrder, users }: Props) {
  // Vérifier si le bon de commande est rejeté
  const isRejected = purchaseOrder.status === "REJECTED";

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {`Bon de commande - ${purchaseOrder.provider.name}`}
          </DialogTitle>
          <DialogDescription>
            {"Informations relatives aux bons de commande"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 pb-[68px] bg-white">
          <BonDeCommandePDF doc={purchaseOrder} />
        </div>

        {/* pdf here */}
        <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
          {/* <PDFDownloadLink
              document={<BonDocument doc={purchaseOrder} />}
              fileName={`BonDeCommande_${purchaseOrder.reference}.pdf`}
            >
              {({ loading }) => (
                <Button variant={"primary"}>
                  {loading ? "Préparation..." : "Télécharger le PDF"}
                </Button>
              )}
            </PDFDownloadLink> */}
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewPurchase;
