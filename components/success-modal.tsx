"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TableData } from "./base/data-table";

interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuccessModal({ open, onOpenChange }: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header with burgundy background */}
        <DialogHeader className="bg-gradient-to-r from-[#15803D] to-[#0B411F] text-white p-6 m-4 rounded-lg pb-8 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          >
            {/* <X className="h-4 w-4 text-white" /> */}
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="text-xl font-semibold text-white">
            Succès !
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            Votre besoin a été soumis avec succès.
          </p>
        </DialogHeader>

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
