"use client";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { providerQ } from "@/queries/providers";
import { Quotation } from "@/types/types";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import CreateQuotation from "./creer/create";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

function EditQuotation({ open, openChange, quotation }: Props) {
  const providers = useQuery({
    queryKey: ["providers"],
    queryFn: providerQ.getAll,
  });

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        {/* Header fixe */}
        <DialogHeader variant={"secondary"}>
          <DialogTitle className="uppercase">
            {`Devis - ${
              providers.data?.data.find((p) => p.id === quotation.providerId)
                ?.name
            }`}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {`Modifiez les informations du devis`}
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
