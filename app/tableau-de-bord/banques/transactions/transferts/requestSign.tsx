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
import { Select, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentMethods } from "@/data/payment-methods";
import { transactionQ } from "@/queries/transaction";
import { PayType, TransferTransaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectContent } from "@radix-ui/react-select";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: TransferTransaction;
  paymentMethods: Array<PayType>
}

const formSchema = z.object({
  methodId: z.string({message: "Méthode de transfert requise"}),
});

type FormValue = z.infer<typeof formSchema>;

function RequestSign({ open, openChange, transaction }: Props) {

  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      methodId: undefined,
    },
  });
  const initiateSign = useMutation({
    mutationFn: async ({
      id,
      methodId
    }: {
      id: number;
      methodId: number;
    }) => transactionQ.initiateSign({ id, methodId }),
    onSuccess: () => {
      toast.success("Transfert mis à jour avec succès !");
      openChange(false);
      form.reset({ methodId: undefined });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (value: FormValue): void => {
    initiateSign.mutate({
      id: transaction.id,
      methodId: Number(value.methodId)
    });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle>{`Demande de signature - ${transaction.label}`}</DialogTitle>
          <DialogDescription>{`Sélectionnez une méthode de paiement pour demander la signature du transfert.`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="methodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Méthode de paiement"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une méthode de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                            {paymentMethods.map(m=>(
                                <SelectItem key={m.value} value={m.value}>{m.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant={"primary"}
                disabled={initiateSign.isPending}
                isLoading={initiateSign.isPending}
              >
                {"Demander la signature"}
              </Button>
              <Button
                variant="outline"
                disabled={initiateSign.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  openChange(false);
                  form.reset({ methodId: undefined });
                }}
              >
                {"Fermer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RequestSign;
