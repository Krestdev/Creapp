"use client";
import { CancelDialog } from "@/components/modals/cancel-dialog";
import { quotationQ } from "@/queries/quotation";
import { Quotation } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  quotation: Quotation;
}

function CancelQuotation({ open, openChange, quotation }: Props) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => quotationQ.cancel(quotation.id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Devis annulé avec succès !");
      openChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Une erreur est survenue lors de l'annulation du devis.");
    },
  });
  return (
    <CancelDialog
      open={open}
      onOpenChange={openChange}
      title={`Annuler le devis ${quotation.ref} ?`}
      description="Êtes-vous sûr de vouloir annuler ce devis ?"
      confirmLabel="Annuler le devis"
      isPending={isPending}
      onConfirm={() => mutate()}
    />
  );
}

export default CancelQuotation;
