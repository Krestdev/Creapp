"use client";
import { Button } from "@/components/ui/button";
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
import { ApproProps, transactionQ } from "@/queries/transaction";
import { Bank, RequestModelT } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  banks: Array<Bank>;
  requests: Array<RequestModelT>;
}

const formSchema = z.object({
  label: z.string().min(2, "Libellé trop court"),
  amount: z.coerce
    .number({ message: "Montant invalide" })
    .gt(0, "Montant > 0 requis"),
  fromBankId: z.coerce.number().int(),
  toBankId: z.coerce.number().int(),
});

type FormValues = z.infer<typeof formSchema>;

function CashSupplyForm({ banks }: Props) {
  const { user } = useStore();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "Approvisionnement",
      amount: 5000,
      fromBankId: undefined,
      toBankId: undefined, //To-Do Here !
    },
  });

  const router = useRouter();
  const create = useMutation({
    mutationFn: async (payload: ApproProps) =>
      transactionQ.createAppro(payload),
    onSuccess: () => {
      toast.success("Votre demande de transfert a été initiée avec succès !");
      router.push("./");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  //Watch from Bank Id
  const fromValue = form.watch("fromBankId");

  const fromBank = React.useMemo(() => {
    if (!fromValue) return null;
    return banks.find((b) => b.id === Number(fromValue)) ?? null;
  }, [fromValue, banks]);

  function onSubmit(values: FormValues) {
    // Vérifier le solde insuffisant avant de continuer
    const fromBank = banks.find((x) => x.id === values.fromBankId);
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

    const fromType = banks.find((x) => x.id === values.fromBankId)?.type;
    const toType = banks.find((x) => x.id === values.toBankId)?.type;
    if (!fromType) {
      return form.setError("fromBankId", { message: "Erreur sur le compte" });
    }
    if (!toType) {
      return form.setError("toBankId", { message: "Erreur sur le compte" });
    }
    create.mutate({
      ...values,
      Type: "TRANSFER",
      userId: user?.id ?? 0,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem className="@min-[640px]:col-span-2">
              <FormLabel isRequired>{"Libellé"}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Intitulé de la transaction" />
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
                      {banks
                        .filter((c) => c.Status === true && c.type === "BANK")
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
                      {banks
                        .filter(
                          (c) =>
                            c.Status === true && c.type === "CASH_REGISTER",
                        )
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
  );
}

export default CashSupplyForm;
