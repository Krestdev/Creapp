"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { getClearingInstrument } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { PayType, Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: (open: boolean) => void;
  transaction: Transaction;
  method?: PayType;
  userId: number;
}

const formSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, { message: "Veuillez indiquer le motif de l'annulation" })
    .max(80, { message: "Le motif ne peut pas dépasser 80 caractères" }),
});

type FormValues = z.infer<typeof formSchema>;

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
    mutationFn: async ({ reason }: FormValues) =>
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    cancelCheck.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Annuler ${instrument.withArticle}`}</DialogTitle>
          <DialogDescription>
            {`${instrument.withArticle.charAt(0).toUpperCase()}${instrument.withArticle.slice(1)} ${transaction.docNumber ? `n° ${transaction.docNumber} ` : ""}sera annulé et conservé dans l'historique du ticket. Si les fonds ont été placés sur le compte temporaire, ils seront recrédités sur le compte d'origine. Le ticket repassera au statut "Validé" pour être traité à nouveau, avec le même moyen de paiement ou un autre.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Motif de l'annulation"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ex. Document perdu, erreur de montant"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end gap-2">
              <Button
                type="submit"
                variant={"destructive"}
                disabled={cancelCheck.isPending}
                isLoading={cancelCheck.isPending}
              >
                {`Annuler ${instrument.withArticle}`}
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                }}
              >
                {"Fermer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CancelCheckDialog;
