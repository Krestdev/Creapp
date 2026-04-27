"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  data: PaymentRequest;
}

const formSchema = z.object({
  reason: z.string().min(5, "La raison doit contenir au moins 5 caracteres"),
});

function CancelTicket({ open, openChange, data }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  const cancelPaymentRequest = useMutation({
    mutationFn: (reason: string) => paymentQ.cancel({ id: data.id, reason }),
    onSuccess: () => {
      toast.success("Ticket annulé avec succès");
      openChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    cancelPaymentRequest.mutate(values.reason);
  }

  React.useEffect(() => {
    form.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>{`Annuler un Ticket - ${data.title}`}</DialogTitle>
          <DialogDescription>{"Annulation du ticket"}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Raison</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Entrez la raison de l'annulation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="destructive">Confirmer l'annulation</Button>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CancelTicket;
