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
import { CrossPlatformPDFViewer } from "@/components/cross-view-pdf";
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
          <CrossPlatformPDFViewer
            document={<CotationPDF data={data} />}
            fileName={`Demande_${data.reference}.pdf`}
            style={{ width: "100%", height: "100%" }}
          />
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
