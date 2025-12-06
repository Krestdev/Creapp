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
  return <Dialog open={open} onOpenChange={openChange}>
    <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
            <DialogTitle>{"Modifier le Devis"}</DialogTitle>
            <DialogDescription>{`Modifiez les informations du devis ${quotation.ref}`}</DialogDescription>
        </DialogHeader>
            <CreateQuotation quotation={quotation} />
    </DialogContent>
  </Dialog>;
}

export default EditQuotation;
