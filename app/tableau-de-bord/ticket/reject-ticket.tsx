"use client";
import { RejectDialog } from "@/components/modals/reject-dialog";
import { paymentQ } from "@/queries/payment";
import { PaymentRequest } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
}

function RejectTicket({ open, openChange, payment }: Props) {
  const queryClient = useQueryClient();
  const toReject = useMutation({
    mutationFn: async (reason: string) =>
      paymentQ.rejectPayment({ id: payment.id, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Vous avez rejeté un ticket avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <RejectDialog
      open={open}
      onOpenChange={openChange}
      title={`Rejeter ${payment.title ? `« ${payment.title} »` : "ce paiement"} ?`}
      description="Le rejet est définitif : le paiement sort du circuit. L’émetteur est notifié avec votre motif."
      reason={{
        placeholder: "Ex. Le justificatif est illisible",
        minLength: 3,
        maxLength: 60,
      }}
      confirmLabel="Rejeter le paiement"
      isPending={toReject.isPending}
      onConfirm={(reason) => toReject.mutate(reason)}
    />
  );
}

export default RejectTicket;
