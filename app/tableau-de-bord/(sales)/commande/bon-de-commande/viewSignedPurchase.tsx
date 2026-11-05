import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerEyebrow,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerContent className="sm:max-w-3xl">
        <DrawerHeader>
          <DrawerEyebrow>{"Bon de commande signé"}</DrawerEyebrow>
          <DrawerTitle>{purchaseOrder.devi.commandRequest.title}</DrawerTitle>
          <DrawerDescription>{"Prévisualisez le bon de commande signé"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">

        {/* pdf here */}
        <iframe
          src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
          className="w-full h-[60vh]"
        />

        
        </DrawerBody>
        <DrawerFooter pinned>
          <Button
            variant={"primary"}
            onClick={() =>
              downloadFile(fileUrl, purchaseOrder.devi.commandRequest.title)
            }
          >
            {"Télécharger"}
          </Button>
          <DrawerClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default viewSignedPurchase;
