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
import { transactionQ } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface CancelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transaction;
}

const formSchema = z.object({
  reason: z.string().min(5, "La raison doit contenir au moins 5 caractere"),
});

type FormSchemaType = z.infer<typeof formSchema>;

export function CancelTransfert({ open, onOpenChange, transfer }: CancelProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Mutation pour mettre à jour le transfert
  const cancelMutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {
      return transactionQ.cancel(transfer.id);
    },
    onSuccess: () => {
      toast.success("Transfert annulé avec succès");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: FormSchemaType) {
    cancelMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader variant={"error"}>
          <DialogTitle>Annuler le transfert</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'annuler le transfert {transfer.label}.
            Voulez-vous continuer ?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Motif</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Motif de l'annulation" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                variant="destructive"
                disabled={cancelMutation.isPending}
                isLoading={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Annulation..." : "Oui, annuler"}
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                }}
                disabled={cancelMutation.isPending}
              >
                Non
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
