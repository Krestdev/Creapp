"use client";
import { ActionDialog } from "@/components/ds/action-dialog";
import { RejectDialog } from "@/components/modals/reject-dialog";
import { getClearingInstrument } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { PayType, Transaction } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: Transaction;
  method?: PayType;
  userId: number;
  status: "paid" | "rejected";
}

function MarkCheckStatusDialog({
  open,
  openChange,
  transaction,
  method,
  userId,
  status,
}: Props) {
  const queryClient = useQueryClient();
  const isRejection = status === "rejected";
  const instrument = getClearingInstrument(method ?? transaction.method) ?? {
    label: "Chèque",
    withArticle: "le chèque",
    cleared: "encaissé",
  };

  const markStatus = useMutation({
    mutationFn: async ({ reason }: { reason?: string }) =>
      transactionQ.markCheckStatus({
        id: transaction.id,
        status,
        reason,
        validatorId: userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(
        isRejection
          ? `${instrument.label} marqué comme rejeté avec succès !`
          : `${instrument.label} marqué comme ${instrument.cleared} avec succès !`,
      );
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isRejection) {
    return (
      <RejectDialog
        open={open}
        onOpenChange={openChange}
        title={`Marquer ${instrument.withArticle} comme rejeté ?`}
        description={`${transaction.label} : ${instrument.withArticle} sera marqué comme rejeté par la banque. Le montant sera retiré du compte temporaire et recrédité sur le compte d'origine. Le ticket repassera au statut "Validé" pour être traité à nouveau.`}
        reason={{
          optional: true,
          placeholder: "Ex. Provision insuffisante",
          maxLength: 80,
        }}
        confirmLabel="Marquer comme rejeté"
        isPending={markStatus.isPending}
        onConfirm={(reason) =>
          markStatus.mutate({ reason: reason || undefined })
        }
      />
    );
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={openChange}
      tone="success"
      icon={CircleCheck}
      title={`Marquer ${instrument.withArticle} comme ${instrument.cleared} ?`}
      description={`${transaction.label} : le montant sera définitivement retiré du compte temporaire.`}
      confirmLabel={`Marquer comme ${instrument.cleared}`}
      confirmVariant="default"
      isPending={markStatus.isPending}
      onConfirm={() => markStatus.mutate({})}
    />
  );
}

export default MarkCheckStatusDialog;
