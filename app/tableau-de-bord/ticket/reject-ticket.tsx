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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { paymentQ } from "@/queries/payment";
import { BonsCommande, PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  payment: PaymentRequest;
  purchases: Array<BonsCommande>;
}

const formSchema = z.object({
  reason: z
    .string()
    .min(3, { message: "Motif trop court" })
    .max(60, { message: "Trop long" }),
});
type FormValue = z.infer<typeof formSchema>;

function RejectTicket({ open, openChange, payment, purchases }: Props) {
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });
  const toReject = useMutation({
    mutationFn: async (reason: string) =>
      paymentQ.rejectInvoice({ id: payment.id, reason }),
    onSuccess: () => {
      toast.success("Vous avez rejeté un ticket avec succès !");
      form.reset({ reason: "" });
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (value: FormValue): void => {
    toReject.mutate(value.reason);
  };
  const purchase = purchases.find((p) => p.id === payment.commandId);
  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>
            {purchase?.devi.commandRequest.title ?? `Rejeter un paiement`}
          </DialogTitle>
          <DialogDescription>{"Rejeter le paiement"}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Motif"}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ex. Le justificatif est illisible"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant={"destructive"}
                disabled={toReject.isPending}
                isLoading={toReject.isPending}
              >
                {"Rejeter"}
              </Button>
              <Button
                variant={"outline"}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                  form.reset({ reason: "" });
                }}
                disabled={toReject.isPending}
              >
                {"Annuler"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RejectTicket;
