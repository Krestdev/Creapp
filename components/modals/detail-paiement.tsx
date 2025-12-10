import { Paiement } from "@/app/tableau-de-bord/bdcommande/paiements/page";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Hash } from "lucide-react";
import { Badge } from "../ui/badge";

interface Props {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: Paiement;
}

const DetailPaiement = ({ open, onOpenChange, data }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-linear-to-r from-[#8B1538] to-[#700032] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {data.bonDeCommande}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">{`Facture ${data.reference}`}</p>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-col gap-3 px-4">
          {/* Reference */}
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Hash className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{"Référence"}</p>
              <Badge
                variant="secondary"
                className="bg-pink-100 text-pink-900 hover:bg-pink-100 dark:bg-pink-900 dark:text-pink-100"
              >
                {data.reference}
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailPaiement;
