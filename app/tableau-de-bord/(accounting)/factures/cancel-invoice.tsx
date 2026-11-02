"use client";
import { CancelDialog } from "@/components/modals/cancel-dialog";
import { invoiceQ } from "@/queries/invoices";
import { Invoice } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  invoice: Invoice;
}

function CancelInvoice({ open, openChange, invoice }: Props) {
  const queryClient = useQueryClient();
  const toCancel = useMutation({
    mutationFn: async () => invoiceQ.cancel(invoice.id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Facture annulée avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  return (
    <CancelDialog
      open={open}
      onOpenChange={openChange}
      title={`Annuler ${invoice.title} ?`}
      description="Êtes-vous sûr de vouloir annuler cette facture ?"
      confirmLabel="Annuler la facture"
      isPending={toCancel.isPending}
      onConfirm={() => toCancel.mutate()}
    />
  );
}

export default CancelInvoice;
