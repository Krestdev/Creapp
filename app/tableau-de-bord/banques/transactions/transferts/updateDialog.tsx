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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import LoadingPage from "@/components/loading-page";
import ErrorPage from "@/components/error-page";

const formSchema = z
  .object({
    label: z.string().min(2, "Libellé trop court"),
    amount: z.coerce
      .number({ message: "Montant invalide" })
      .gt(0, "Montant > 0 requis"),
    fromBankId: z.coerce.number().int(),
    toBankId: z.coerce.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.fromBankId === data.toBankId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toBankId"],
        message: "Vous ne pouvez pas transférer de fonds vers le même compte",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface EditTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transaction;
}

export function EditTransferDialog({
  open,
  onOpenChange,
  transfer,
}: EditTransferDialogProps) {
  const { user } = useStore();

  // Charger la liste des banques
  const {
    data: banks,
    isLoading: banksLoading,
    isError: banksError,
    isSuccess: banksSuccess,
  } = useQuery({
    queryKey: ["banks"],
    queryFn: bankQ.getAll,
    enabled: open
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      amount: 0,
      fromBankId: undefined,
      toBankId: undefined,
    },
  });

  const fromValue = form.watch("fromBankId");
  const amountValue = form.watch("amount");

  const filteredBanks = useMemo(() => {
    if (!banks?.data) return [];
    return banks.data.filter((c) => !!c.type && c.Status === true);
  }, [banks?.data]);

  const fromBank = useMemo(() => {
    if (!fromValue) return null;
    return filteredBanks.find((b) => b.id === Number(fromValue)) ?? null;
  }, [fromValue, filteredBanks]);

  // Vérifier le solde
  const isBalanceSufficient = useMemo(() => {
    if (!fromBank || !amountValue) return true;
    return fromBank.balance >= amountValue;
  }, [fromBank, amountValue]);

  // Mutation pour mettre à jour le transfert
  const updateMutation = useMutation({
    mutationFn: async (data: Omit<TransactionProps, "userId" | "updatedAt">) => {
      return transactionQ.update(transfer.id, data);
    },
    onSuccess: () => {
      toast.success("Transfert modifié avec succès");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la modification");
    },
  });

  // Vérifications de validation similaires au create
  function validateForm(values: FormValues) {
    // Vérifier le solde insuffisant
    const fromBank = filteredBanks.find((x) => x.id === values.fromBankId);
    if (!fromBank) {
      form.setError("fromBankId", {
        message: "Compte source introuvable",
      });
      return false;
    }

    if (values.amount > fromBank.balance) {
      form.setError("amount", {
        message: `Solde insuffisant. Solde disponible : ${XAF.format(
          fromBank.balance,
        )}`,
      });
      return false;
    }

    const fromType = filteredBanks.find(
      (x) => x.id === values.fromBankId,
    )?.type;
    const toType = filteredBanks.find((x) => x.id === values.toBankId)?.type;

    if (!fromType) {
      form.setError("fromBankId", { message: "Erreur sur le compte" });
      return false;
    }
    if (!toType) {
      form.setError("toBankId", { message: "Erreur sur le compte" });
      return false;
    }
    if (
      fromType === "CASH" &&
      toType !== "CASH" &&
      toType !== "CASH_REGISTER"
    ) {
      form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer d'une sous-caisse que vers une sous-caisse ou la caisse !",
      });
      return false;
    }
    if (
      fromType === "CASH_REGISTER" &&
      toType !== "CASH"
    ) {
      form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer de la Caisse que vers une sous-caisse !",
      });
      return false;
    }
    if (fromType === "BANK" && toType === "CASH") {
      form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer vers une sous-caisse depuis une banque !",
      });
      return false;
    }
    return true;
  }

  function onSubmit(values: FormValues) {
    if (!validateForm(values)) {
      return;
    }

    const transferData: Omit<TransactionProps, "userId" | "updatedAt"> = {
      Type: "TRANSFER",
      label: values.label,
      amount: values.amount,
      fromBankId: values.fromBankId,
      toBankId: values.toBankId,
      date: transfer.date,
    };

    updateMutation.mutate(transferData);
  }

  // Réinitialiser le formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open && transfer && banks?.data) {
      form.reset({
        label: transfer.label || "",
        amount: transfer.amount || 0,
        fromBankId: transfer.from.id || undefined,
        toBankId: transfer.to.id || undefined,
      });
    }
  }, [open, transfer, banks?.data, form]);

  if (banksLoading) return <LoadingPage />
  if (banksError || !banks?.data) return <ErrorPage />

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Modifier le transfert
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du transfert existant
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Libellé - Même layout que le create */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Libellé du Transfert</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Intitulé de la transaction"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section "Transférer depuis" - Même layout que le create */}
            <div className="p-4 rounded-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold">Transférer depuis</h3>
              <FormField
                control={form.control}
                name="fromBankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Compte source</FormLabel>
                    <FormControl>
                      <Select
                        value={!!field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                        disabled
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBanks.map((bank) => (
                            <SelectItem key={bank.id} value={String(bank.id)}>
                              {bank.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {fromBank ? (
                        <span className="text-muted-foreground">
                          Solde disponible :{" "}
                          <span className="font-medium text-secondary">
                            {XAF.format(fromBank.balance)}
                          </span>
                          {!isBalanceSufficient && (
                            <span className="text-red-600 ml-2">
                              (Solde insuffisant)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Sélectionnez un compte
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section "Transférer vers" - Même layout que le create */}
            <div className="p-4 rounded-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold">Transférer vers</h3>
              <FormField
                control={form.control}
                name="toBankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Compte destinataire</FormLabel>
                    <FormControl>
                      <Select
                        value={!!field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                        disabled
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBanks
                            .filter(bank => bank.id !== fromValue)
                            .map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                {bank.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Montant - Même layout que le create */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Montant</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        placeholder="Ex. 50 000"
                        className="pr-12"
                      />
                      <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                        FCFA
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer avec boutons - Style cohérent */}
            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updateMutation.isPending || !isBalanceSufficient}
                isLoading={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Modification..." : "Enregistrer les modifications"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}