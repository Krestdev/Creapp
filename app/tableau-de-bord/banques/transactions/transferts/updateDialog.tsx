"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { transactionQ, TransferProps } from "@/queries/transaction";
import { Transaction } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z
  .object({
    label: z.string().min(2, "Libellé trop court"),
    amount: z.coerce
      .number({ message: "Montant invalide" })
      .gt(0, "Montant > 0 requis"),
    fromBankId: z.coerce.number().int().positive(),
    toBankId: z.coerce.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.fromBankId === data.toBankId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["toBankId"],
        message: "Vous ne pouvez pas transférer de fonds vers le même compte",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface EditTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transaction;
}

export function EditTransferDialog({
  open,
  onOpenChange,
  transfer,
}: EditTransferDialogProps) {
  const { user } = useStore();

  // Charger la liste des banques
  const {
    data: banksData,
    isLoading: banksLoading,
    isError: banksError,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll }); // Charger seulement quand le dialog est ouvert

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      amount: 5000,
      fromBankId: undefined,
      toBankId: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    if (!transfer) return;
  }

  if (banksLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center p-8">
            <p>{"Chargement des données..."}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (banksError || !banksData?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="p-6 text-center">
            <p className="text-destructive">
              {"Erreur lors du chargement des banques"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const banks = banksData.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto p-0 gap-0 overflow-x-hidden border-none">
        {/* Header avec background gradient */}
        <DialogHeader className="bg-[#8B1538] text-white p-6 m-4 rounded-lg pb-8 relative">
          <DialogTitle className="text-xl font-semibold text-white uppercase">
            {`Transfert - ${transfer.label}`}
          </DialogTitle>
          <p className="text-sm text-white/80 mt-1">
            {"Modifier les informations du transfert"}
          </p>
        </DialogHeader>

        {/* Formulaire de modification */}
        <div className="px-6 py-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4"
            >
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>
                      {"Libellé de la Transaction"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Intitulé de la transaction"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="@min-[640px]:col-span-2">
                    <FormLabel isRequired>{"Montant"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          {...field}
                          placeholder="Ex. 50 000"
                          className="pr-12"
                        />
                        <span className="absolute right-2 text-primary-700 top-1/2 -translate-y-1/2 text-base uppercase">
                          {"FCFA"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Compte source */}
              <div className="@min-[640px]:col-span-2 w-full p-4 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
                <h3 className="@min-[640px]:col-span-2 text-lg font-semibold">
                  {"Transférer depuis"}
                </h3>
                <FormField
                  control={form.control}
                  name="fromBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Compte source"}</FormLabel>
                      <FormControl>
                        <Select
                          value={
                            !!field.value ? String(field.value) : undefined
                          }
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un compte" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                {bank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Compte destinataire */}
              <div className="@min-[640px]:col-span-2 w-full p-4 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
                <h3 className="@min-[640px]:col-span-2 text-lg font-semibold">
                  {"Transférer vers"}
                </h3>
                <FormField
                  control={form.control}
                  name="toBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Compte destinataire"}</FormLabel>
                      <FormControl>
                        <Select
                          value={
                            !!field.value ? String(field.value) : undefined
                          }
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un compte" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                {bank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Boutons d'action */}
              <div className="@min-[640px]:col-span-2 w-full flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                //   disabled={updateMutation.isPending}
                >
                  {"Annuler"}
                </Button>
                <Button
                  type="submit"
                  variant={"primary"}
                //   disabled={updateMutation.isPending}
                //   isLoading={updateMutation.isPending}
                >
                  {"Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
