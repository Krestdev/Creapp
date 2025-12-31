"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { PaymentRequest } from "@/types/types";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ACCOUNTS } from "@/data/accounts";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentQueries, PayPayload } from "@/queries/payment";
import { toast } from "sonner";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  account: z.string().min(1, "Le compte est requis"),
  justification: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(1, "La justification est requise"),
});

function PayExpense({ ticket, open, onOpenChange }: Props) {
    const paymentQuery = new PaymentQueries();
    const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: "",
      justification: [],
    },
  });

  const pay = useMutation({
    mutationFn: async(data: PayPayload)=> paymentQuery.pay(ticket.id, data),
    onSuccess: () => {
      toast.success("Paiement enregistré avec succès");
      form.reset({account: "", justification: []});
      queryClient.invalidateQueries({ queryKey: ["payments"], refetchType: "active" });
      onOpenChange(false);
    },
    onError: (error:Error) => {
        toast.error(`Erreur lors du paiement: ${error.message}`);
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    const {updatedAt, createdAt,id, status,...rest} = ticket;
    const payload:PayPayload = {
        ...rest,
        account: data.account,
        justification: data.justification[0],
    }
    pay.mutate(payload);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Payer ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Compte Payeur"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez un compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNTS.map((account) => (
                          <SelectItem key={account.value} value={account.value}>
                            {account.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Justificatif"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      acceptTypes="all"
                      multiple={false}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" variant={"primary"} disabled={pay.isPending} isLoading={pay.isPending}>{"Payer"}</Button>
                <Button variant={"outline"} disabled={pay.isPending} onClick={(e)=>{e.preventDefault(); form.reset({account: "", justification: []});onOpenChange(false);}}>{"Annuler"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default PayExpense;
