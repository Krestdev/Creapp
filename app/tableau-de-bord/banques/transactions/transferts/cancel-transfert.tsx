"use client";
import { CancelDialog } from "@/components/modals/cancel-dialog";
import { transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CancelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transaction;
}

export function CancelTransfert({ open, onOpenChange, transfer }: CancelProps) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      return transactionQ.cancel(transfer.id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Transfert annulé avec succès");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <CancelDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Annuler le transfert ?"
      description={`Vous êtes sur le point d'annuler le transfert ${transfer.label}. Voulez-vous continuer ?`}
      reason={{
        label: "Motif de l’annulation",
        placeholder: "Motif de l’annulation",
        minLength: 5,
      }}
      confirmLabel="Annuler le transfert"
      isPending={cancelMutation.isPending}
      onConfirm={(reason) => cancelMutation.mutate(reason)}
    />
  );
}
