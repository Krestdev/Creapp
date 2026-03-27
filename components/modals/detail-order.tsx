"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CommandRequestT } from "@/types/types";
import { DownloadButton } from "../bdcommande/TéléchargeButton";
import { PDFViewer } from "@react-pdf/renderer";
import CotationPDF from "../bdcommande/DétailCotation";
import { Description } from "@radix-ui/react-dialog";

interface DetailOrderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommandRequestT | null;
  message?: string;
}

export function DetailOrder({
  open,
  onOpenChange,
  data,
  message,
}: DetailOrderProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{`Demande - ${data.title}`}</DialogTitle>
          <DialogDescription>
            {message || "Détails de la commande"}
          </DialogDescription>
        </DialogHeader>
        <div style={{ height: "500px", marginBottom: "20px" }}>
          <PDFViewer width="100%" height="100%">
            <CotationPDF data={data} />
          </PDFViewer>
        </div>

        {/* Footer buttons */}
        <DialogFooter>
          <DownloadButton data={data} />
          <DialogClose asChild>
            <Button variant="outline">{"Fermer"}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
