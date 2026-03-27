"use client";
import FilesUpload from "@/components/comp-547";
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
import { XAF } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { Bank, PaymentRequest, Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { DollarSignIcon, LandmarkIcon } from "lucide-react";
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });

  const transaction = transactions
    .filter((t) => t.Type === "DEBIT")
    .find((item) => item.id === ticket.transactionId);

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
    if (transaction && transaction.from.balance >= ticket.price) {
      const payload: { id: number; proof: File; paymentId: number } = {
        proof: values.proof[0],
        id: transaction.id,
        paymentId: ticket.id,
      };

      pay.mutate(payload);
    }
    const message = !transaction
      ? "Transaction introuvable"
      : "solde Insuffisant";
    return form.setError("proof", { message });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{`Payer - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 pb-4">
          <div className="bg-primary-50 border border-dashed border-primary-200 rounded-md grid gap-2 p-3">
            <div className="view-group">
              <span className="view-icon">
                <LandmarkIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Compte payeur"}</p>
                <p className="font-semibold">
                  {!!transaction && (
                    <span className="flex gap-1.5">
                      {transaction.from.label}
                      <p>{"- Solde :"}</p>
                      <strong className="text-primary-600">
                        {`(${XAF.format(transaction.from.balance)})`}
                      </strong>
                    </span>
                  )}
                </p>
              </div>
            </div>
            {/**Montant à payer */}
            <div className="view-group">
              <span className="view-icon">
                <DollarSignIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Montant à payer"}</p>
                <p className="font-semibold">{XAF.format(ticket.price)}</p>
              </div>
            </div>
          </div>
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
        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PayExpense;
