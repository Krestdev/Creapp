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
import { paymentQ } from "@/queries/payment";
import { TransactionProps, transactionQ } from "@/queries/transaction";
import { PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(0),
});

type FormValues = z.infer<typeof formSchema>;

function SignExpense({ ticket, open, onOpenChange }: Props) {

  const { user } = useStore()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });

  const sign = useMutation({
    mutationFn: async (payload: {
      userId: number;
      signeDoc: File | string | undefined;
      paymentId: number;
    }) => paymentQ.validate(payload),
    onSuccess: () => {
      toast.success("Votre signature a été enregistrée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    const { proof, ...rest } = values;
    const payload: {
      paymentId: number;
      userId: number;
      signeDoc: File | string | undefined;
    } = {
      paymentId: ticket.id,
      userId: user!.id,
      signeDoc: proof[0],
    };
    sign.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
          <DialogTitle className="uppercase">{`Signer - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`Signature du ticket ${ticket.reference}`}</DialogDescription>
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
                        acceptTypes="images"
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
            disabled={sign.isPending}
            isLoading={sign.isPending}
          >
            {"Signer"}
          </Button>
          <Button
            variant={"outline"}
            // Désactiver si il n'y a aucun fichier
            disabled={sign.isPending}
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

export default SignExpense;
