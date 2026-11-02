"use client";
import { RejectDialog as RejectRequestDialog } from "@/components/modals/reject-dialog";
import { transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: Transaction;
  userId: number;
}

function RejectDialog({ transaction, open, openChange, userId }: Props) {
  const queryClient = useQueryClient();
  const reject = useMutation({
    mutationFn: async (reason: string) =>
      transactionQ.approve({
        id: transaction.id,
        status: "REJECTED",
        reason: reason,
        validatorId: userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Demande de transfert rejetée avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <RejectRequestDialog
      open={open}
      onOpenChange={openChange}
      title={`Rejeter la demande de transfert « ${transaction.label} » ?`}
      description="Le rejet est définitif : la demande de transfert de fonds sort du circuit. L’émetteur est notifié avec votre motif."
      reason={{
        placeholder: "Ex. Ne pas transférer de fonds pour l’instant",
        minLength: 3,
        maxLength: 80,
      }}
      confirmLabel="Rejeter la demande"
      isPending={reject.isPending}
      onConfirm={(reason) => reject.mutate(reason)}
    />
  );
}

export default RejectDialog;
