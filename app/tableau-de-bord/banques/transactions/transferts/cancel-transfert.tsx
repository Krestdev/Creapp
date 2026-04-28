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
import { transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CancelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transaction;
}

export function CancelTransfert({ open, onOpenChange, transfer }: CancelProps) {
  // Mutation pour mettre à jour le transfert
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return transactionQ.cancel(transfer.id);
    },
    onSuccess: () => {
      toast.success("Transfert annulé avec succès");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>Annuler le transfert</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'annuler le transfert {transfer.label}.
            Voulez-vous continuer ?
          </DialogDescription>
        </DialogHeader>
        {/* Footer avec boutons - Style cohérent */}
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={cancelMutation.isPending}
            isLoading={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? "Annulation..." : "Oui, annuler"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelMutation.isPending}
          >
            Non
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
