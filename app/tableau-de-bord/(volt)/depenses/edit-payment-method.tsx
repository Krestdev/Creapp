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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paymentQ } from "@/queries/payment";
import { PayType, PaymentRequest } from "@/types/types";
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
  payTypes: PayType[];
}

const formSchema = z.object({
  methodId: z.coerce.number({
    message: "Veuillez sélectionner un moyen de paiement",
  }),
});

function EditPaymentMethodDepenses({
  open,
  openChange,
  payTypes,
  payment,
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      methodId: Number(payment.methodId) || undefined,
    },
  });

  const updatePayment = useMutation({
    mutationFn: async (data: number) =>
      paymentQ.updatePaymentMethod(payment.id, { methodId: Number(data) }),
    onSuccess: () => {
      toast.success("Votre paiement a été modifié avec succès !");
      openChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updatePayment.mutate(values.methodId);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Modifier le mode de paiment"}</DialogTitle>
          <DialogDescription>{`Vous allez modifier le mode de paiment de`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="methodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Moyen de paiement"}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner un moyen de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        {payTypes.map((payType) => (
                          <SelectItem
                            key={payType.id}
                            value={String(payType.id)}
                          >
                            {payType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={updatePayment.isPending}>
                  {"Annuler"}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={updatePayment.isPending}
                isLoading={updatePayment.isPending}
              >
                {"Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditPaymentMethodDepenses;
