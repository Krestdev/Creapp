"use client";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import PageTitle from "@/components/pageTitle";
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
  FormDescription,
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
import { XAF } from "@/lib/utils";
import { useStore } from "@/providers/datastore";
import { bankQ } from "@/queries/bank";
import { transactionQ, TransferProps } from "@/queries/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z
  .object({
    label: z.string().min(2, "Libellé trop court"),
    amount: z.coerce
      .number({ message: "Montant invalide" })
      .gt(0, "Montant > 0 requis"),
    fromBankId: z.coerce.number().int(),
    toBankId: z.coerce.number().int(),
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

function Page() {
  const { user } = useStore();
  const {
    data: banks,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      amount: 5000,
      fromBankId: undefined,
      toBankId: undefined,
    },
  });

  const router = useRouter();
  const create = useMutation({
    mutationFn: async (payload: TransferProps) =>
      transactionQ.createTransaction(payload),
    onSuccess: () => {
      toast.success("Votre demande de transfert a été initiée avec succès !");
      setFormData(null);
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const fromValue = form.watch("fromBankId");

  const filteredBanks = React.useMemo(() => {
    if (!banks) return [];
    return banks.data.filter((c) => !!c.type);
  }, [banks]);

  const fromBank = React.useMemo(() => {
    if (!fromValue) return null;
    return filteredBanks.find((b) => b.id === Number(fromValue)) ?? null;
  }, [fromValue, filteredBanks]);

  const [show, setShow] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const isInstant = (data: FormValues): boolean => {
    const from = filteredBanks.find((x) => x.id === data.fromBankId)?.type;
    const to = filteredBanks.find((x) => x.id === data.toBankId)?.type;
    if (from === "CASH" || (from === "CASH_REGISTER" && to === "CASH")) {
      return true;
    }
    return false;
  };

  function onSubmit(values: FormValues) {
    // Vérifier le solde insuffisant avant de continuer
    const fromBank = filteredBanks.find((x) => x.id === values.fromBankId);
    if (!fromBank) {
      return form.setError("fromBankId", {
        message: "Compte source introuvable",
      });
    }

    if (values.amount > fromBank.balance) {
      return form.setError("amount", {
        message: `Solde insuffisant. Solde disponible : ${XAF.format(
          fromBank.balance,
        )}`,
      });
    }

    const fromType = filteredBanks.find(
      (x) => x.id === values.fromBankId,
    )?.type;
    const toType = filteredBanks.find((x) => x.id === values.toBankId)?.type;
    if (!fromType) {
      return form.setError("fromBankId", { message: "Erreur sur le compte" });
    }
    if (!toType) {
      return form.setError("toBankId", { message: "Erreur sur le compte" });
    }
    if (
      fromType === "CASH" &&
      toType !== "CASH" &&
      toType !== "CASH_REGISTER"
    ) {
      return form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer d'une sous-caisse que vers une sous-caisse ou la caisse !",
      });
    }
    if (
      fromType === "CASH_REGISTER" &&
      toType !== "CASH" &&
      toType !== "MOBILE_WALLET"
    ) {
      return form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer de la Caisse que vers une sous-caisse ou un portefeuille mobile !",
      });
    }
    if (fromType === "BANK" && toType === "CASH") {
      return form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer vers une sous-caisse depuis une banque !",
      });
    }
    if (fromType === "MOBILE_WALLET" && toType === "CASH") {
      return form.setError("toBankId", {
        message:
          "Vous ne pouvez transférer d'un portefeuille mobile vers une sous-caisse !",
      });
    }
    setFormData(values);
    setShow(true);
  }

  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess)
    return (
      <div className="content">
        <PageTitle
          title="Transfert"
          subtitle="Initier une demande de transfert de fonds"
          color="blue"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="@min-[640px]:col-span-2">
                  <FormLabel isRequired>{"Libellé du Transfert"}</FormLabel>
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
            <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
              <h3 className="@min-[640px]:col-span-2">{"Transférer depuis"}</h3>
              <FormField
                control={form.control}
                name="fromBankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Compte source"}</FormLabel>
                    <FormControl>
                      <Select
                        value={!!field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBanks
                            .filter((c) => c.Status === true)
                            .map((bank) => (
                              <SelectItem key={bank.id} value={String(bank.id)}>
                                {bank.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      <FormDescription>
                        {fromBank ? (
                          <span className="text-muted-foreground">
                            {"Solde disponible : "}
                            <span className="font-medium text-secondary">
                              {XAF.format(fromBank.balance)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {"Sélectionnez un compte"}
                          </span>
                        )}
                      </FormDescription>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="@min-[640px]:col-span-2 w-full p-3 rounded-sm border grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 place-items-start">
              <h3 className="@min-[640px]:col-span-2">{"Transférer vers"}</h3>
              <FormField
                control={form.control}
                name="toBankId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>{"Compte destinataire"}</FormLabel>
                    <FormControl>
                      <Select
                        value={!!field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBanks
                            .filter((c) => c.Status === true)
                            .map((bank) => (
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
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
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
            <div className="@min-[640px]:col-span-2 w-full inline-flex justify-end">
              <Button
                type="submit"
                variant={"primary"}
                disabled={create.isPending}
                isLoading={create.isPending}
              >
                {"Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
        {!!formData && (
          <Dialog open={show} onOpenChange={setShow}>
            <DialogContent>
              <DialogHeader
                variant={isInstant(formData) ? "secondary" : "default"}
              >
                <DialogTitle>
                  {isInstant(formData)
                    ? "Confirmer le transfert"
                    : "Confirmer la demande de transfert"}
                </DialogTitle>
                <DialogDescription>
                  {isInstant(formData)
                    ? "Vous êtes sur le point de transférer des fonds vers une sous-caisse"
                    : "Initiation d'une demande de transfert. Cette demande devra être validée par le Donneur d'ordre"}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant={"primary"}
                  onClick={() => {
                    create.mutate({
                      ...formData,
                      Type: "TRANSFER",
                      userId: user?.id ?? 0,
                      isDirect: isInstant(formData),
                    });
                    setShow(false);
                  }}
                  isLoading={create.isPending}
                  disabled={create.isPending}
                >
                  {"Soumettre"}
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setFormData(null);
                    setShow(false);
                  }}
                >
                  {"Annuler"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
}

export default Page;
