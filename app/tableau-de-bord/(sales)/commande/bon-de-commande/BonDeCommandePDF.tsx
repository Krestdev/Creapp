"use client";
import React from "react";
import {
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import { BonDeCommande } from "@/types/types";
import { BonDocument } from "./BonDoc";

// Sample data driven object
export const bonDeCommande: BonDeCommande = {
  numero: "BC0000224/11/2025/CREACONSULT/Ets Ideal DECOR",
  dateCreation: "2025-11-21T17:18:03",
  imprimePar: "CREACONSULT",
  imprimeLe: "2025-11-21 18:28:21",
  company: {
    name: "CREACONSULT",
    address:
      "BP 11735 Douala - Cameroun\nTel: 233 42 63 05\nEmail: creaconsult@yahoo.fr",
    phone: "233 42 63 05",
    email: "creaconsult@yahoo.fr",
  },
  fournisseur: {
    nom: "Ets Ideal DECOR",
    adresse: "Douala",
    ville: "DOUALA",
    pays: "CAMEROUN",
    niu: "P11761702977BU",
    email: "idealdecor237@gmail.com",
    telephone: "678819432/693",
  },
  client: {
    nom: "CREACONSULT",
    adresse: "BP 11735 Douala",
    ville: "DOUALA",
    pays: "CAMEROUN",
  },
  items: [
    {
      ref: "LOGO-EXT-80",
      designation: "Logo de 80 cm de Diamètre - Extérieur",
      qty: 1,
      puHt: 90000,
      tva: 0,
    },
    {
      ref: "LETT-3D-80",
      designation: "Lettrage 3D Lumineux de 80 cm Hauteur",
      qty: 4,
      puHt: 60000,
      tva: 0,
    },
    {
      ref: "POSE-GEN",
      designation: "Frais de pose Générale",
      qty: 1,
      puHt: 80000,
      tva: 0,
    },
  ],
  totals: {
    totalHt: 1304000,
    remise: 100000,
    tva: 0,
    isirda: 4063,
    net: 1199937,
  },
  amountInWords:
    "Un million cent quatre-vingt-dix-neuf mille neuf cent trente-sept XAF",
  conditions:
    "80% à la commande et le solde à la livraison avec bordereau de réception. Pénalité de 10 000 FCFA par jour de retard.",
};

function formatCurrency(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

export const BonDeCommandePDF: React.FC = () => {
  const b = bonDeCommande;

  return (
    <div>
      <PDFViewer style={{ width: "100%", height: "75vh" }} showToolbar={false}>
        <BonDocument doc={b} />
      </PDFViewer>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
      </div>
    </div>
  );
};

export default BonDeCommandePDF;
