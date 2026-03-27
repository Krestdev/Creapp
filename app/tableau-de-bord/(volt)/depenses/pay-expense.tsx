"use client";
import FilesUpload from "@/components/comp-547";
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
import { useStore } from "@/providers/datastore";
import { transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest, Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Array<Bank>;
  transactions: Array<Transaction>;
}

const formSchema = z.object({
  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(1, { message: "Veuillez fournir un justificatif" }),
});

type FormValues = z.infer<typeof formSchema>;

function PayExpense({ ticket, open, onOpenChange, transactions }: Props) {
  const { user } = useStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });

  const transaction = transactions.find(
    (item) => item.id === ticket.transactionId,
  );

  const pay = useMutation({
    mutationFn: async (payload: {
      id: number;
      proof: File;
      paymentId: number;
    }) => transactionQ.completePayment(payload),
    onSuccess: () => {
      toast.success("Votre transaction a été enregistrée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    if (!!transaction) {
      const payload: { id: number; proof: File; paymentId: number } = {
        proof: values.proof[0],
        id: transaction.id,
        paymentId: ticket.id,
      };

      pay.mutate(payload);
    }
    return form.setError("proof", { message: "Transaction introuvable" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{`Payer - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="proof"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>{"Justificatif"}</FormLabel>
                    <FormControl>
                      <FilesUpload
                        value={field.value}
                        onChange={field.onChange}
                        name={field.name}
                        acceptTypes="all"
                        multiple={true}
                        maxFiles={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            variant={"primary"}
            disabled={pay.isPending}
            isLoading={pay.isPending}
          >
            {"Payer"}
          </Button>
          <Button
            variant={"outline"}
            disabled={pay.isPending}
            onClick={(e) => {
              e.preventDefault();
              form.reset();
              onOpenChange(false);
            }}
          >
            {"Annuler"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PayExpense;
