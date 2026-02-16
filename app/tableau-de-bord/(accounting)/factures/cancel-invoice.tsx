"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { invoiceQ } from "@/queries/invoices";
import { BonsCommande, Invoice } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  invoice: Invoice;
  purchases: Array<BonsCommande>;
}

function CancelInvoice({ open, openChange, invoice, purchases }: Props) {

  const toCancel = useMutation({
    mutationFn: async () =>
      invoiceQ.cancel(invoice.id),
    onSuccess: () => {
      toast.success("Facture annulée avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (): void => {
    toCancel.mutate();
  };
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>
            {`Annuler ${invoice.title}`}
          </DialogTitle>
          <DialogDescription>{"Êtes-vous sûr de vouloir annuler cette Facture ?"}</DialogDescription>
        </DialogHeader>
            <DialogFooter>
              <Button
                type="submit"
                variant={"destructive"}
                disabled={toCancel.isPending}
                isLoading={toCancel.isPending}
              >
                {"Annuler"}
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                }}
                disabled={toCancel.isPending}
              >
                {"Annuler"}
              </Button>
            </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelInvoice;
