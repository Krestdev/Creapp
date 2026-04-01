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
import { Input } from "@/components/ui/input";
import { invoiceQ } from "@/queries/invoices";
import { BonsCommande, Invoice } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  invoice: Invoice;
  purchases: Array<BonsCommande>;
}

const formSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Le titre doit comporter au moins 5 caractères" }),
});

function CancelInvoice({ open, openChange, invoice, purchases }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: invoice.title,
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async (values: { id: number; title: string }) => {
      // Appel API pour mettre à jour le titre
      // À adapter selon votre API réelle
      return await invoiceQ.update(values.id, { title: values.title });
    },
    onSuccess: () => {
      toast.success("Titre de la facture modifié avec succès !");
      openChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>): void => {
    updateInvoice.mutate({
      id: invoice.id,
      title: values.title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le titre de la facture</DialogTitle>
          <DialogDescription>
            Modifiez uniquement le titre de la facture. Les autres champs ne
            peuvent pas être modifiés.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Titre de la facture - Seul champ modifiable */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>Titre de la facture</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Saisissez le nouveau titre"
                      className="border-blue-500 focus:ring-blue-500"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-blue-600 mt-1">
                    Seul le titre peut être modifié
                  </p>
                </FormItem>
              )}
            />

            {/* Informations supplémentaires - Affichage en lecture seule */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Informations de la facture
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant :</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XAF",
                    }).format(invoice.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bon de commande :</span>
                  <span className="font-medium">
                    {purchases.find((p) => p.id === invoice.commandId)?.devi
                      .commandRequest.title || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date d'échéance :</span>
                  <span className="font-medium">
                    {new Date(invoice.deadline).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Statut :</span>
                  <span className="font-medium capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                variant={"primary"}
                disabled={updateInvoice.isPending}
                isLoading={updateInvoice.isPending}
              >
                {updateInvoice.isPending ? "Modification..." : "Modifier le titre"}
              </Button>
              <Button
                type="button"
                variant={"outline"}
                onClick={() => {
                  openChange(false);
                  form.reset();
                }}
                disabled={updateInvoice.isPending}
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CancelInvoice;