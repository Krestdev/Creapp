import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { transactionQ } from "@/queries/transaction";
import { TransferTransaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: TransferTransaction;
}

const formSchema = z.object({
  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(1, { message: "Veuillez ajouter un justificatif" }),
});

type FormValue = z.infer<typeof formSchema>;

function CompleteTransfer({ open, openChange, transaction }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });
  const complete = useMutation({
    mutationFn: async ({ id, proof }: { id: number; proof: File }) =>
      transactionQ.complete({ id, proof }),
    onSuccess: () => {
      toast.success("Transfert mis à jour avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["transactions", "banks"],
        refetchType: "active",
      });
      openChange(false);
      form.reset({ proof: [] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const onSubmit = (value: FormValue): void => {
    complete.mutate({ id: transaction.id, proof: value.proof[0] });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"default"}>
          <DialogTitle>{transaction.label}</DialogTitle>
          <DialogDescription>{`Compléter le transfert - ${transaction.label}`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="proof"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Justificatif"}</FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      acceptTypes="images"
                      multiple={true}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" variant={"primary"} disabled={complete.isPending} isLoading={complete.isPending}>{"Transférer"}</Button>
                <Button variant="outline" disabled={complete.isPending} onClick={(e)=>{e.preventDefault(); openChange(false); form.reset({proof: []});}}>{"Fermer"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteTransfer;
