"use client";
import FilesUpload from "@/components/comp-547";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BankPayload, BankQuery } from "@/queries/bank";
import { Bank, BANK_TYPES } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface Props {
  open: boolean;
  openChange: React.Dispatch<React.SetStateAction<boolean>>;
  bank: Bank;
}

const formSchema = z
  .object({
    label: z.string().min(2, "Intitulé trop court").max(120, "Trop long"),
    type: z.enum(
      BANK_TYPES.map((t) => t.value) as [
        (typeof BANK_TYPES)[number]["value"],
        ...(typeof BANK_TYPES)[number]["value"][]
      ]
    ),
    balance: z.coerce.number({ message: "Solde invalide" }),
    justification: z
      .array(
        z.union([
          z.instanceof(File, { message: "Doit être un fichier valide" }),
          z.string(),
        ])
      )
      .min(0),
    Status: z.boolean(),

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
          message: "Veuillez ajouter une pièce justificative",
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

function EditBank({ open, openChange, bank }: Props) {
  useEffect(() => {
    if (open) {
      form.reset({
        label: bank.label,
        type: bank.type,
        Status: bank.Status,
        balance: bank.balance,
        justification: bank.justification.length > 0 ? [bank.justification] : [],
        accountNumber: !!bank.accountNumber ? bank.accountNumber : undefined,
        bankCode: !!bank.bankCode ? bank.bankCode : undefined,
        key: !!bank.key ? bank.key : undefined,
        atmCode: !!bank.atmCode ? bank.atmCode : undefined,
        phoneNum: !!bank.phoneNum ? bank.phoneNum : undefined,
        merchantNum: !!bank.merchantNum ? bank.merchantNum : undefined,
      });
    }
  }, [open]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: bank.label,
      type: bank.type,
      Status: bank.Status,
      balance: bank.balance,
      justification: bank.justification.length > 0 ? [bank.justification] : [],
      accountNumber: !!bank.accountNumber ? bank.accountNumber : undefined,
      bankCode: !!bank.bankCode ? bank.bankCode : undefined,
      key: !!bank.key ? bank.key : undefined,
      atmCode: !!bank.atmCode ? bank.atmCode : undefined,
      phoneNum: !!bank.phoneNum ? bank.phoneNum : undefined,
      merchantNum: !!bank.merchantNum ? bank.merchantNum : undefined,
    },
  });

  const type = form.watch("type");
  const queryClient = useQueryClient();
  const bankQuery = new BankQuery();
  const update = useMutation({
    mutationFn: async (payload: BankPayload) =>
      bankQuery.update(bank.id, payload),
    onSuccess: () => {
      toast.success("Compte mis à jour avec succès !");
      queryClient.invalidateQueries({
        queryKey: ["banks"],
        refetchType: "active",
      });
      form.reset({
        label: bank.label,
        type: bank.type,
        Status: bank.Status,
        balance: bank.balance,
        justification: bank.justification.length > 0 ? [bank.justification] : [],
        accountNumber: !!bank.accountNumber ? bank.accountNumber : undefined,
        bankCode: !!bank.bankCode ? bank.bankCode : undefined,
        key: !!bank.key ? bank.key : undefined,
        atmCode: !!bank.atmCode ? bank.atmCode : undefined,
        phoneNum: !!bank.phoneNum ? bank.phoneNum : undefined,
        merchantNum: !!bank.merchantNum ? bank.merchantNum : undefined,
      });
      openChange(false);
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
    if (type === "BANK") {
      const payload: BankPayload = {
        ...rest,
        justification: justification[0],
        atmCode,
        accountNumber,
        bankCode,
        key,
      };
      return update.mutate(payload);
    }
    if (type === "CASH") {
      const payload: BankPayload = {
        ...rest,
        justification: justification[0],
      };
      return update.mutate(payload);
    }
    if (type === "MOBILE_WALLET") {
      const payload: BankPayload = {
        ...rest,
        justification: justification[0],
        merchantNum,
        phoneNum,
      };
      return update.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader variant={"secondary"}>
          <DialogTitle>{bank.label}</DialogTitle>
          <DialogDescription>{`Modifier les informations du compte`}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 @min-[540px]/dialog:grid-cols-2"
          >
            {/* Intitulé */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem className="@min-[540px]/dialog:col-span-2">
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANK_TYPES.map((t) => (
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
                  <FormLabel isRequired>{"Solde"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Ex: 100000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isRequired>{"Statut"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <span>{field.value ? "Actif" : "Désactivé"}</span>
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
                    <FormLabel>
                      {"Code / Localisation caisse (optionnel)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Siège - 1er étage / CAISSE-SIEGE"
                      />
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
                <FormItem className="@min-[540px]/dialog:col-span-2">
                  <FormLabel isRequired={type === "BANK"}>{"Justificatif"}</FormLabel>
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
            <DialogFooter className="@min-[540px]/dialog:col-span-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={update.isPending}
                disabled={update.isPending}
              >
                {"Enregistrer"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">{"Fermer"}</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EditBank;
