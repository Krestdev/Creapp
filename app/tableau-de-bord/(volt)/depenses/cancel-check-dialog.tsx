"use client";
import { CancelDialog } from "@/components/modals/cancel-dialog";
import { getClearingInstrument } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { PayType, Transaction } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: (open: boolean) => void;
  transaction: Transaction;
  method?: PayType;
  userId: number;
}

function CancelCheckDialog({
  open,
  openChange,
  transaction,
  method,
  userId,
}: Props) {
  const queryClient = useQueryClient();
  const instrument = getClearingInstrument(method ?? transaction.method) ?? {
    label: "Chèque",
    withArticle: "le chèque",
  };

  const cancelCheck = useMutation({
    mutationFn: async (reason: string) =>
      transactionQ.cancelCheck({
        id: transaction.id,
        reason,
        validatorId: userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(
        `${instrument.label} annulé. Le ticket peut être traité à nouveau.`,
      );
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
      title={`Annuler ${instrument.withArticle} ?`}
      description={`${instrument.withArticle.charAt(0).toUpperCase()}${instrument.withArticle.slice(1)} ${transaction.docNumber ? `n° ${transaction.docNumber} ` : ""}sera annulé et conservé dans l'historique du ticket. Si les fonds ont été placés sur le compte temporaire, ils seront recrédités sur le compte d'origine. Le ticket repassera au statut "Validé" pour être traité à nouveau, avec le même moyen de paiement ou un autre.`}
      reason={{
        label: "Motif de l’annulation",
        placeholder: "Ex. Document perdu, erreur de montant",
        maxLength: 80,
      }}
      confirmLabel={`Annuler ${instrument.withArticle}`}
      isPending={cancelCheck.isPending}
      onConfirm={(reason) => cancelCheck.mutate(reason)}
    />
  );
}

export default CancelCheckDialog;
