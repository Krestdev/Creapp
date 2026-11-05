"use client";
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
import { BonsCommande, User } from "@/types/types";
import React from "react";
import { BonDeCommandePDF } from "./BonDeCommandePDF";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  purchaseOrder: BonsCommande;
  users: Array<User>;
}

function ViewDocument({ open, openChange, purchaseOrder }: Props) {
  // Vérifier si le bon de commande est rejeté
  // const isRejected = purchaseOrder.status === "REJECTED";

  return (
    <Drawer open={open} onOpenChange={openChange}>
      <DrawerContent className="sm:max-w-3xl">
        <DrawerHeader>
          <DrawerEyebrow>{"Bon de commande"}</DrawerEyebrow>
          <DrawerTitle>{purchaseOrder.provider.name}</DrawerTitle>
          <DrawerDescription>{"Prévisualisez le bon de commande"}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-3 [&>*]:shrink-0">

        <div className="flex-1 pb-[68px] bg-white">
          <BonDeCommandePDF doc={purchaseOrder} />
        </div>

        {/* pdf here */}
        
        </DrawerBody>
        <DrawerFooter pinned>
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
          <DrawerClose asChild>
            <Button variant={"outline"}>{"Fermer"}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ViewDocument;
