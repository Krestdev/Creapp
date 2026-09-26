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
import { queryKeys } from "@/lib/query-keys";
import { XAF } from "@/lib/utils";
import { transactionQ } from "@/queries/transaction";
import { vehicleQ } from "@/queries/vehicule";
import { PaymentRequest } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CarIcon,
  DollarSignIcon,
  LandmarkIcon,
  ReceiptTextIcon,
  SquareUserRound,
  TypeIcon,
} from "lucide-react";
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
    .min(1, { message: "Veuillez fournir un justificatif" }),
});

type FormValues = z.infer<typeof formSchema>;

function PayExpense({ ticket, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const request = ticket.request;

  const getVehicle = useQuery({
    queryKey: queryKeys.vehicle(Number(request?.vehiclesId)),
    queryFn: () => vehicleQ.getOne(Number(request?.vehiclesId)),
    enabled: !!request?.vehiclesId,
  });

  const getTransaction = useQuery({
    queryKey: queryKeys.transaction(Number(ticket?.transactionId)),
    queryFn: () => transactionQ.getOne(Number(ticket?.transactionId)),
    enabled: !!ticket?.transactionId,
  });

  const vehicle = getVehicle.data?.data;
  const transaction = getTransaction.data?.data;
  const isCheque = ticket.method?.type?.toLowerCase() === "chq";
  const isOv = ticket.method?.type?.toLowerCase() === "ov";
  const isNotCash = isCheque || isOv;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: [],
    },
  });

  const pay = useMutation({
    mutationFn: async (payload: {
      id: number;
      proof: File;
      paymentId: number;
    }) => transactionQ.completePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(
        isNotCash
          ? "Le ticket a été déchargé avec succès !"
          : "Votre transaction a été enregistrée avec succès !",
      );
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: FormValues) {
    if (
      transaction &&
      transaction.Type === "DEBIT"
      // &&
      // transaction.from.balance >= ticket.price
    ) {
      const payload: { id: number; proof: File; paymentId: number } = {
        proof: values.proof[0],
        id: transaction.id,
        paymentId: ticket.id,
      };

      return pay.mutate(payload);
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
          <DialogTitle>{`${isNotCash ? "Décharger" : "Payer"} - ${ticket.title}`}</DialogTitle>
          <DialogDescription>{`${isNotCash ? "Décharge" : "Paiement"} du ticket ${ticket.reference}`}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 pb-4">
          <div className="bg-primary-50 border border-dashed border-primary-200 rounded-md grid gap-2 p-3">
            {isCheque && (
              <div className="view-group">
                <span className="view-icon">
                  <SquareUserRound />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Fournisseur"}</p>
                  <p className="font-semibold">
                    {ticket.facture?.command.provider.name ?? "--"}
                  </p>
                </div>
              </div>
            )}
            {isNotCash && (
              <div className="view-group">
                <span className="view-icon">
                  <TypeIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Objet"}</p>
                  <p className="font-semibold">{ticket.title}</p>
                </div>
              </div>
            )}
            {isNotCash && (
              <div className="view-group">
                <span className="view-icon">
                  <ReceiptTextIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">
                    {isCheque ? "Chèque" : "Ordre de virement"}
                  </p>
                  <p className="font-semibold">
                    {ticket.transaction?.docNumber ?? "--"}
                  </p>
                </div>
              </div>
            )}
            {/**Bank */}
            <div className="view-group">
              <span className="view-icon">
                <LandmarkIcon />
              </span>
              <div className="flex flex-col">
                <p className="view-group-title">{"Compte payeur"}</p>
                <p className="font-semibold">
                  {!!transaction && transaction.Type === "DEBIT" && (
                    <div>
                      <span className="flex gap-1.5">
                        {transaction.from?.label}
                        <span>{"- Solde :"}</span>
                        <strong className="text-primary-600">
                          {`${XAF.format(transaction.from?.balance)}`}
                        </strong>
                      </span>
                      <span className="">
                        {`Solde Réel: ${XAF.format((transaction.from?.balance ?? 0) + (transaction.from?.tempAccount?.balance ?? 0))} (${XAF.format(transaction.from?.tempAccount?.balance ?? 0)} réservés)`}
                      </span>
                    </div>
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
                <p className="view-group-title">
                  {isCheque
                    ? "Montant du chèque"
                    : isOv
                      ? "Montant de l'ordre de virement"
                      : "Montant à payer"}
                </p>
                <p className="font-semibold">{XAF.format(ticket.price)}</p>
              </div>
            </div>
            {request && request.type === "gas" && (
              <div className="view-group">
                <span className="view-icon">
                  <CarIcon />
                </span>
                <div className="flex flex-col">
                  <p className="view-group-title">{"Véhicule"}</p>
                  <p className="font-semibold">
                    {vehicle &&
                      vehicle.mark.concat(
                        " - ",
                        vehicle.label,
                        ` (${vehicle.matricule})`,
                      )}
                    {!vehicle && "Aucun véhicule trouvé"}
                  </p>
                </div>
              </div>
            )}
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
            {isNotCash ? "Décharger" : "Payer"}
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
