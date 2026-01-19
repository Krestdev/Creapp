"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/providers/datastore";
import { paymentQ } from "@/queries/payment";
import { Bank, PaymentRequest } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

interface Props {
  ticket: PaymentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banks: Array<Bank>;
}

const formSchema = z.object({
  id: z.string(),
  userId: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

function SignExpense({ ticket, open, onOpenChange, banks }: Props) {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const pay = useMutation({
    mutationFn: async (userId: number) =>
      paymentQ.validate({ paymentId: ticket.id, userId }),
    onSuccess: () => {
      toast.success("Votre signatur a été enregistrée avec succès !");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    user && (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0 gap-0 border-none flex flex-col">
          <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 shrink-0">
            <DialogTitle>{`Payer ${ticket.title}`}</DialogTitle>
            <DialogDescription>{`Paiement du ticket ${ticket.reference}`}</DialogDescription>
          </DialogHeader>
          <div className="shrink-0 flex gap-3 p-6 pt-0 ml-auto">
            <Button
              onClick={() => pay.mutate(user.id)}
              variant={"primary"}
              disabled={pay.isPending}
              isLoading={pay.isPending}
            >
              {"Signer"}
            </Button>
            <Button
              variant={"outline"}
              disabled={pay.isPending}
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
              }}
            >
              {"Annuler"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
}

export default SignExpense;
