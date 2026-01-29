"use client";
import PageTitle from "@/components/pageTitle";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { BANK_TYPES } from "@/types/types"; // ou "@/types/bank" selon ton projet

import FilesUpload from "@/components/comp-547";
import ErrorPage from "@/components/error-page";
import LoadingPage from "@/components/loading-page";
import { Button } from "@/components/ui/button";
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
import { BankPayload, bankQ } from "@/queries/bank";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const banks = BANK_TYPES.filter((t) => t.value !== "CASH_REGISTER");
// ✅ Schema: champs communs + validations conditionnelles
const formSchema = z
  .object({
    label: z.string().min(2, "Intitulé trop court").max(120, "Trop long"),
    type: z.enum(
      banks.map((t) => t.value) as [
        (typeof banks)[number]["value"],
        ...(typeof banks)[number]["value"][],
      ],
    ),
    balance: z.coerce.number({ message: "Solde invalide" }),
    justification: z
      .array(z.instanceof(File, { message: "Doit être un fichier valide" }))
      .min(0),

    // BANK
    accountNumber: z.string().optional(),
    bankCode: z.string().optional(),
    key: z.string().optional(),
    atmCode: z.string().optional(),

    // MOBILE_WALLET
    phoneNum: z.string().optional(),
    merchantNum: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validations conditionnelles selon type
    if (data.type === "BANK") {
      if (!data.accountNumber || data.accountNumber.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Numéro de compte requis",
        });
      }
      if (data.justification.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["justification"],
          message: "Veuillez ajouter la pièce justificative",
        });
      }
      if (!data.bankCode || data.bankCode.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankCode"],
          message: "Code banque requis",
        });
      }
      if (!data.atmCode || data.atmCode.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["atmCode"],
          message: "Code banque requis",
        });
      }
    }

    if (data.type === "MOBILE_WALLET") {
      if (!data.phoneNum || data.phoneNum.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNum"],
          message: "Numéro de téléphone requis",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

function Page() {
  const {
    data: accounts,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({ queryKey: ["banks"], queryFn: bankQ.getAll });
  //Banks data
  const filteredBanks = React.useMemo(() => {
    if (!accounts) return [];
    return accounts.data.filter((c) => !!c.type);
  }, [accounts]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      type: "BANK",
      balance: 0,
      justification: [],
      accountNumber: "",
      bankCode: "",
      key: "",
      atmCode: "",
      phoneNum: "",
      merchantNum: "",
    },
  });

  const type = form.watch("type");

  const router = useRouter();
  const createBankAccount = useMutation({
    mutationFn: async (payload: BankPayload) => bankQ.create(payload),
    onSuccess: () => {
      toast.success("Nouveau compte Banque créé avec succès !");
      router.push("../banques");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    const {
      justification,
      atmCode,
      accountNumber,
      bankCode,
      phoneNum,
      merchantNum,
      key,
      ...rest
    } = values;
    if (
      filteredBanks.some(
        (y) =>
          y.label.toLocaleLowerCase().trim() ===
          values.label.toLocaleLowerCase().trim(),
      )
    ) {
      return form.setError("label", { message: "Ce compte existe déjà" });
    }
    if (type === "BANK") {
      const payload: BankPayload = {
        ...rest,
        Status: true,
        justification: justification[0] as File,
        atmCode,
        accountNumber,
        bankCode,
        key,
      };
      return createBankAccount.mutate(payload);
    }
    if (type === "CASH") {
      const payload: BankPayload = {
        ...rest,
        Status: true,
        justification: justification[0] as File,
      };
      return createBankAccount.mutate(payload);
    }
    if (type === "MOBILE_WALLET") {
      const payload: BankPayload = {
        ...rest,
        Status: true,
        justification: justification[0] as File,
        merchantNum,
        phoneNum,
      };
      return createBankAccount.mutate(payload);
    }
  };
  if (isLoading) {
    return <LoadingPage />;
  }
  if (isError) {
    return <ErrorPage error={error} />;
  }
  if (isSuccess) {
    return (
      <div className="content">
        <PageTitle
          title="Ajouter un compte"
          subtitle="Complétez le formulaire pour créer un compte"
          color="blue"
        />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-3xl">
            {/* Intitulé */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="@min-[640px]:col-span-2">
                  <FormLabel isRequired>{"Intitulé du compte"}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: UBA Cameroun / Caisse Générale"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Type"}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.filter(b=> !!b.value && b.value !== "null").map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Solde */}
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Solde initial"}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Ex: 100000"
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
            {/* Champs conditionnels */}
            {type === "BANK" && (
              <>
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Numéro de compte"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 00123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Code banque"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: UBA-CM" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Clé (optionnel)"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type === "MOBILE_WALLET" && (
              <>
                <FormField
                  control={form.control}
                  name="phoneNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isRequired>{"Numéro téléphone"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 699123456" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="merchantNum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{"Numéro marchand"}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: OM-8899" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {type === "BANK" && (
              <FormField
                control={form.control}
                name="atmCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{"Code Guichet"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 06619" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {/* Justification */}
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem className="@min-[640px]:col-span-2">
                  <FormLabel isRequired={type === "BANK"}>
                    {"Justificatif"}
                  </FormLabel>
                  <FormControl>
                    <FilesUpload
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      acceptTypes="images"
                      multiple={false}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="@min-[640px]:col-span-2 w-full flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={createBankAccount.isPending}
                disabled={createBankAccount.isPending}
              >
                {"Créer le compte"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
}

export default Page;
