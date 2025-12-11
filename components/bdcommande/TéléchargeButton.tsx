"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CommandRequestT } from "@/types/types";
import CotationPDF from "./DétailCotation";

interface DownloadButtonProps {
  data: CommandRequestT;
}

export function DownloadButton({ data }: DownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<CotationPDF data={data} />}
      fileName={`cotation-${data.reference}.pdf`}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => {
        
        return (
          <Button 
            className="bg-[#27272A] hover:bg-[#27272A]/80 text-white"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Génération..." : "Télécharger"}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}