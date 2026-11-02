"use client";
import { CancelDialog } from "@/components/modals/cancel-dialog";
import { paymentQ } from "@/queries/payment";
import { PaymentRequest } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: PaymentRequest;
}

function CancelTicket({ open, openChange, data }: Props) {
  const queryClient = useQueryClient();

  const cancelPaymentRequest = useMutation({
    mutationFn: (reason: string) => paymentQ.cancel({ id: data.id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Ticket annulé avec succès");
      openChange(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <CancelDialog
      open={open}
      onOpenChange={openChange}
      title={`Annuler le ticket « ${data.title} » ?`}
      description="Le ticket sera annulé. L’annulation est journalisée et les personnes concernées sont notifiées."
      reason={{
        label: "Raison de l’annulation",
        placeholder: "Entrez la raison de l’annulation",
        minLength: 5,
      }}
      confirmLabel="Annuler le ticket"
      isPending={cancelPaymentRequest.isPending}
      onConfirm={(reason) => cancelPaymentRequest.mutate(reason)}
    />
  );
}

export default CancelTicket;
