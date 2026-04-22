"use client";

import { BonsCommande } from "@/types/types";
import { BonDocument } from "./BonDoc";
import { CrossPlatformPDFViewer } from "@/components/cross-view-pdf";

interface Props {
  doc: BonsCommande;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function BonDeCommandePDF({ doc }: Props) {
  return (
    <div>
      <CrossPlatformPDFViewer
        document={<BonDocument doc={doc} />}
        fileName={`Bon_de_commande_${doc.reference}.pdf`}
        style={{ width: "100%", height: "75vh" }}
        showToolbar={false}
      />
    </div>
  );
}
