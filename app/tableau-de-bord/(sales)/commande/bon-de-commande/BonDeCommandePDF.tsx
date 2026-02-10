"use client";

import React from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { BonDeCommande, BonsCommande, CommandCondition } from "@/types/types";
import { BonDocument } from "./BonDoc";

interface Props {
  doc: BonsCommande;
  conditions: Array<CommandCondition>;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function BonDeCommandePDF({ doc, conditions }: Props) {
  return (
    <div>
      <PDFViewer style={{ width: "100%", height: "75vh" }} showToolbar={false}>
        <BonDocument doc={doc} conditions={conditions} />
      </PDFViewer>
    </div>
  );
}
