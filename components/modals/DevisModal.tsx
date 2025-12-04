"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quotation } from "@/types/types";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Quotation | undefined;
  quotation: String | undefined
}

export function DevisModal({ open, onOpenChange, data, quotation }: DetailModalProps) {
  console.log(data);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-linear-to-r from-[#15803D] to-[#0B411F] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white">
            {`Devis - ${quotation}`}
          </DialogTitle>
          <DialogDescription>
            {"Détail du devis"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-3">
            <div className="">

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
}
