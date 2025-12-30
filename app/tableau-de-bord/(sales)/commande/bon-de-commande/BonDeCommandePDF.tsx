"use client";

import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { BonDeCommande, BonsCommande } from "@/types/types";
import { BonDocument } from "./BonDoc";

interface Props {
  doc: BonsCommande;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function BonDeCommandePDF({ doc }: Props) {
  return (
    <div>
      <PDFViewer style={{ width: "100%", height: "75vh" }} showToolbar={false}>
        <BonDocument doc={doc} />
      </PDFViewer>
    </div>
  );
}
