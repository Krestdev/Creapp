"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Quotation } from "@/types/types";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import CreateQuotation from "./creer/create";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

function EditQuotation({ open, openChange, quotation }: Props) {
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[80vh] p-0 gap-0 flex flex-col">
        {/* Header fixe */}
        <DialogHeader
          variant={"secondary"}
          className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0"
        >
          <DialogTitle className="uppercase">
            {"Modifier le Devis"}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {`Modifiez les informations du devis ${quotation.ref}`}
          </DialogDescription>
        </DialogHeader>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <CreateQuotation quotation={quotation} openChange={openChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditQuotation;