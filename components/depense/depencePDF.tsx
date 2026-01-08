"use client";

import { PaymentRequest } from "@/types/types";
import { PDFViewer } from "@react-pdf/renderer";
import { DepenseDocument } from "./depenseDoc";

interface Props {
  doc: PaymentRequest;
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
export function ViewDepensePDF({ doc }: Props) {
  return (
    <div>
      <PDFViewer style={{ width: "100%", height: "75vh" }} showToolbar={false}>
        <DepenseDocument doc={doc} />
      </PDFViewer>
    </div>
  );
}
