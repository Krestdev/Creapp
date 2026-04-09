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
  const downloadFile = async (fileUrl: string, fileName?: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a hidden link and click it
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "download.pdf";
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

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
        <iframe
          src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
          className="w-full h-[60vh]"
        />

        <DialogFooter>
          <Button
            variant={"primary"}
            onClick={() =>
              downloadFile(fileUrl, purchaseOrder.devi.commandRequest.title)
            }
          >
            {"Télécharger"}
          </Button>
          <DialogClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default viewSignedPurchase;
