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
}

const formSchema = z.object({
  reason: z
    .string()
    .min(3, {
      message: "Vous definir définir un motif d'au moins 3 caractères",
    })
    .max(80, { message: "Votre motif ne peut pas dépasser 80 caractères" }),
});

type FormValues = z.infer<typeof formSchema>;

function RejectDialog({ transaction, open, openChange, userId }: Props) {
  const queryClient = useQueryClient();
  const reject = useMutation({
    mutationFn: async ({ reason }: { reason: string }) =>
      transactionQ.approve({
        id: transaction.id,
        status: "REJECTED",
        reason: reason,
        validatorId: userId,
      }),
    onSuccess: () => {
      toast.success("Demande de transfert rejetée avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["transactions", "banks"],
        refetchType: "active",
      });
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
    reject.mutate(values);
  };
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`${transaction.label}`}</DialogTitle>
          <DialogDescription>
            {"Rejeter la demande de transfert de fonds"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Motif du rejet"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ex. Ne pas transférer de fonds pour l'instant"
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
                disabled={reject.isPending}
                isLoading={reject.isPending}
              >
                {"Rejeter"}
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

export default RejectDialog;
