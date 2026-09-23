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
import { transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: Transaction;
  userId: number;
  status: "paid" | "rejected";
}

const formSchema = z.object({
  reason: z.string().max(80, { message: "Le motif ne peut pas dépasser 80 caractères" }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function MarkCheckStatusDialog({ open, openChange, transaction, userId, status }: Props) {
  const queryClient = useQueryClient();
  const isRejection = status === "rejected";

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
          ? "Chèque marqué comme rejeté avec succès !"
          : "Chèque marqué comme encaissé avec succès !",
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
    markStatus.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction.label}</DialogTitle>
          <DialogDescription>
            {isRejection
              ? "Marquer ce chèque comme rejeté par la banque. Le montant sera retiré du compte temporaire et recrédité sur le compte d'origine."
              : "Marquer ce chèque comme encaissé. Le montant sera définitivement retiré du compte temporaire."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {isRejection && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Motif du rejet (optionnel)"}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ex. Provision insuffisante"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="w-full flex justify-end gap-2">
              <Button
                type="submit"
                variant={isRejection ? "destructive" : "primary"}
                disabled={markStatus.isPending}
                isLoading={markStatus.isPending}
              >
                {isRejection ? "Marquer comme rejeté" : "Marquer comme encaissé"}
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                }}
              >
                {"Annuler"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default MarkCheckStatusDialog;
