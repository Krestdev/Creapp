"use client";
import { badgeVariants } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BonDeCommande,
  BonsCommande,
  PaymentRequest,
  User,
} from "@/types/types";
import { VariantProps } from "class-variance-authority";
import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { ViewDepensePDF } from "./depencePDF";
import { DepenseDocument } from "./depenseDoc";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  depense: PaymentRequest;
}

// export const bonDeCommande: BonDeCommande = {
//   numero: "BC0000224/11/2025/CREACONSULT/Ets Ideal DECOR",
//   dateCreation: "2025-11-21T17:18:03",
//   imprimePar: "CREACONSULT",
//   imprimeLe: "2025-11-21 18:28:21",
//   company: {
//     name: "CREACONSULT",
//     address:
//       "BP 11735 Douala - Cameroun\nTel: 233 42 63 05\nEmail: creaconsult@yahoo.fr",
//     phone: "233 42 63 05",
//     email: "creaconsult@yahoo.fr",
//   },
//   fournisseur: {
//     nom: "Ets Ideal DECOR",
//     adresse: "Douala",
//     ville: "DOUALA",
//     pays: "CAMEROUN",
//     niu: "P11761702977BU",
//     email: "idealdecor237@gmail.com",
//     telephone: "678819432/693",
//   },
//   client: {
//     nom: "CREACONSULT",
//     adresse: "BP 11735 Douala",
//     ville: "DOUALA",
//     pays: "CAMEROUN",
//   },
//   items: [
//     {
//       ref: "LOGO-EXT-80",
//       designation: "Logo de 80 cm de Diamètre - Extérieur",
//       qty: 1,
//       puHt: 90000,
//       tva: 0,
//     },
//     {
//       ref: "LETT-3D-80",
//       designation: "Lettrage 3D Lumineux de 80 cm Hauteur",
//       qty: 4,
//       puHt: 60000,
//       tva: 0,
//     },
//     {
//       ref: "POSE-GEN",
//       designation: "Frais de pose Générale",
//       qty: 1,
//       puHt: 80000,
//       tva: 0,
//     },
//   ],
//   totals: {
//     totalHt: 1304000,
//     remise: 100000,
//     tva: 0,
//     isirda: 4063,
//     net: 1199937,
//   },
//   amountInWords:
//     "Un million cent quatre-vingt-dix-neuf mille neuf cent trente-sept XAF",
//   conditions:
//     "80% à la commande et le solde à la livraison avec bordereau de réception. Pénalité de 10 000 FCFA par jour de retard.",
// };

function ViewDepense({ open, openChange, depense }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="max-h-[750px] max-w-4xl! gap-0 overflow-hidden border-none flex flex-col">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white mb-2 rounded-lg relative">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {`Recu ${depense.title}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives aux bons de commande"}
          </p>
        </DialogHeader>

        <div className="flex-1 pb-[68px] bg-white">
          <ViewDepensePDF doc={depense} />
        </div>

        {/* pdf here */}
        <DialogFooter className="shrink-0 sticky z-10 w-full bottom-0">
          <PDFDownloadLink
            document={<DepenseDocument doc={depense} />}
            fileName={`BonDeCommande_${depense.reference}.pdf`}
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

export default ViewDepense;
