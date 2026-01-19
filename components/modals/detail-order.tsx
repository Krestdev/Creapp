"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommandRequestT } from "@/types/types";
import { DownloadButton } from "../bdcommande/TéléchargeButton";
import { PDFViewer } from "@react-pdf/renderer";
import CotationPDF from "../bdcommande/DétailCotation";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
}

export function DetailOrder({ open, onOpenChange, data }: DetailOrderProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[750px] overflow-y-auto p-0 gap-0 overflow-x-hidden border-none flex flex-col">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {`Demande - ${data.title}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Informations relatives à la commande"}
          </p>
        </DialogHeader>
        <div style={{ height: "500px", marginBottom: "20px" }}>
          <PDFViewer width="100%" height="100%">
            <CotationPDF data={data} />
          </PDFViewer>
        </div>

        {/* Footer buttons */}
        <div className="flex w-full justify-end gap-3 p-6 pt-0">
          <DownloadButton data={data} />
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            {"Fermer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
