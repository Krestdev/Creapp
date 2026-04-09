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
import { BonsCommande } from "@/types/types";
import React from "react";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  fileUrl: string;
}

function viewSignedPurchase({
  open,
  openChange,
  fileUrl,
  purchaseOrder,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{`[Bon de Commande] ${
            purchaseOrder.devi.commandRequest.title
          }`}</DialogTitle>
          <DialogDescription>
            {"Prévisualiation du Bon de commande signé"}
          </DialogDescription>
        </DialogHeader>

        {/* pdf here */}
        <object
          data={fileUrl}
          type="application/pdf"
          className="w-full h-[60vh] border-none"
        >
          <p>
            Le fichier PDF n'a pas pu être chargé. Veuillez le télécharger pour
            le visualiser.
          </p>
        </object>

        <DialogFooter>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant={"primary"}>{"Télécharger"}</Button>
          </a>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default viewSignedPurchase;
