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
import { transactionQ } from "@/queries/transaction";
import { TransferTransaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  transfer: TransferTransaction
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

const formSchema = z.object({
  proof: z
    .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
    .min(1, "Veuillez fournir un justificatif"),
});

type FormValues = z.infer<typeof formSchema>;

function SignTransfer({ transfer, open, onOpenChange }: Props) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });

  const sign = useMutation({
    mutationFn: async (signDoc: File) => transactionQ.sign({ id: transfer.id, signDoc }),
    onSuccess: () => {
      toast.success("Votre signature a été enregistrée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    sign.mutate(values.proof[0]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader variant={"success"}>
          <DialogTitle className="uppercase">{`Signer - ${transfer.label}`}</DialogTitle>
          <DialogDescription>{`Signer le transfert de ${transfer.from.label} vers ${transfer.to.label}`}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SignTransfer;
